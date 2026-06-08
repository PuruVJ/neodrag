import {
	fmtIndexChange,
	fmtMids,
	fmtOffset,
	fmtOrder,
	fmtPoint,
	fmtRect,
	sortableStory,
} from '../agent-log.ts';
import { clearDisplacements } from '../displacement/apply.ts';
import { refreshSortableDisplacement } from '../displacement/refresh.ts';
import { snapshotLayout } from '../measurement/store.ts';
import {
	IntentSession,
	type SortableContext,
	type SortableIntentPluginState,
	sortableRegistry,
} from '../context.ts';
import {
	edgeThresholdForIntent,
	isForeignDrag,
	resolvePreviewMode,
	resolveStrategy,
	sortableDragPointer,
} from '../intent.ts';
import { getGroupedStickyTargetId } from '../group/plan.ts';
import type { DragSession } from '../../types.ts';
import {
	approachAxisForForeignTarget,
	foreignColumnShouldAppendAtEnd,
	isActiveForeignTarget,
	overlapsCrossAxis,
	pickBestForeignTarget,
	pointerBeyondForeignContent,
	pointerInForeignColumnContainer,
	resolveForeignContentRect,
} from './foreign-proximity.ts';
import { computeIndex, computeTargetFromMids } from '../mids.ts';
import {
	freezeSessionPreset,
} from '../displacement/refresh.ts';
import { resolveStrategyInput } from '../strategy/resolve.ts';
import { syncSourceGroupPreview } from './source-group-preview.ts';
import { SortableDragData } from '../session-data.ts';
import {
	midsFromLayoutEntries,
	slotBoundariesFromMids,
	stabilizeForeignInsertAt,
	stabilizeVisualInsertAt,
} from '../visual/layout.ts';
import { clearGroupedSourceElevation, syncGroupedSourceElevation } from '../visual/elevation.ts';

export function pointerInForeignTarget<T>(
	container: HTMLElement,
	targetCtx: SortableContext<T>,
	sourceCtx: SortableContext<unknown>,
	dragKey: string,
	pointerX: number,
	pointerY: number,
	session: DragSession | null = null,
): boolean {
	if (pointerInForeignColumnContainer(targetCtx, pointerX, pointerY)) return true;
	return isActiveForeignTarget(
		targetCtx,
		sourceCtx as SortableContext<T>,
		dragKey,
		pointerX,
		pointerY,
	);
}

function foreignInsertSize(
	sourceCtx: SortableContext<unknown>,
	dragKey: string,
	strategy: ReturnType<typeof resolveStrategy>,
): number {
	const node = sourceCtx.nodesByKey.get(dragKey);
	if (!(node instanceof HTMLElement)) return 48;
	const rect = node.getBoundingClientRect();
	return strategy === 'horizontal' ? rect.width : rect.height;
}

function ensureForeignIntentVisual<T>(
	ctx: SortableContext<T>,
	sourceCtx: SortableContext<unknown>,
	dragKey: string,
): SortableIntentPluginState {
	const snapshot = [...ctx.opts.items()];
	const strategyInput = resolveStrategyInput(ctx.opts.strategy);
	const sessionPreset = freezeSessionPreset(strategyInput);
	const strategy = resolveStrategy(ctx.opts.strategy);
	const listStrategy = sessionPreset === 'grid' ? 'horizontal' : strategy;

	let state = ctx.foreignIntentVisual;
	const needsFrozenLayout = !state || state.preLayout.length !== snapshot.length;

	if (needsFrozenLayout) {
		const layout = snapshotLayout(snapshot, ctx.opts.keyBy, ctx.nodesByKey, sessionPreset);
		if (!state) {
			state = {
				preLayout: layout.entries,
				currentLayout: layout.entries,
				measuredRects: layout.rects,
				displacedKeys: [],
			};
			ctx.foreignIntentVisual = state;
		} else {
			state.preLayout = layout.entries;
			state.currentLayout = layout.entries;
			state.measuredRects = layout.rects;
			state.displacedKeys = [];
		}

		const mids = midsFromLayoutEntries(layout.entries);
		const edgeThresholdPx = edgeThresholdForIntent(ctx, listStrategy, mids, '');

		const insertSize = foreignInsertSize(sourceCtx, dragKey, strategy);
		ctx.intent = new IntentSession({
			snapshot,
			dragFrom: snapshot.length,
			previewTo: snapshot.length,
			mids,
			dragAxis: null,
			dragBand: Math.max(8, insertSize * 0.2),
			targetIndex: snapshot.length,
			edgeThresholdPx,
			slotBoundaries: slotBoundariesFromMids(mids),
			sessionStrategy: strategy,
			sessionPreset,
			layoutStrategy: strategy,
			containerRect: null,
			foreignInsertSize: foreignInsertSize(sourceCtx, dragKey, strategy),
		});

		// #region agent log
		const targetKeys = snapshot.map((item) => ctx.opts.keyBy(item));
		sortableStory('I', 'intent/foreign.ts', `friend layout snapshot · ${String(ctx.id)}`, () => ({
		story: [
				`First time pointer entered friend column ${String(ctx.id)} during this drag.`,
				`Froze ${layout.entries.length} layout slot(s) for [${targetKeys.join(', ')}] so virtual gaps stay stable while hovering.`,
				`Virtual insert row opens at index ${snapshot.length} (append lane) until pointer picks a slot.`,
			].join(' '),
		data: { targetKeys, entryCount: layout.entries.length, targetId: String(ctx.id) },
	}));
		// #endregion
	} else if (ctx.intent) {
		const insertSize = foreignInsertSize(sourceCtx, dragKey, strategy);
		ctx.intent.snapshot = snapshot;
		ctx.intent.foreignInsertSize = insertSize;
		ctx.intent.dragBand = Math.max(8, insertSize * 0.2);
	}

	const container = ctx.containerNode;
	if (container instanceof HTMLElement && ctx.intent) {
		ctx.intent.containerRect = container.getBoundingClientRect();
		container.setAttribute('data-sortable-dragging', '');
	}

	return state!;
}

export function resolveForeignInsertAt<T>(
	targetCtx: SortableContext<T>,
	pointerX: number,
	pointerY: number,
	dragKey: string,
): number {
	const intent = targetCtx.intent;
	const container = targetCtx.containerNode;
	const contentRect =
		container instanceof HTMLElement
			? resolveForeignContentRect(targetCtx, container)
			: null;
	const approach = approachAxisForForeignTarget(targetCtx);
	const appendAtEnd =
		contentRect != null &&
		foreignColumnShouldAppendAtEnd(targetCtx, pointerX, pointerY, contentRect, approach);

	if (intent && intent.dragFrom >= intent.snapshot.length) {
		const len = intent.snapshot.length;
		if (appendAtEnd) return len;
		return Math.min(Math.max(intent.previewTo, 0), len);
	}
	if (appendAtEnd) {
		return targetCtx.opts.items().length;
	}
	const strategy = resolveStrategy(targetCtx.opts.strategy);
	let to = computeIndex(targetCtx, pointerX, pointerY, strategy, dragKey);
	if (to < 0) to = targetCtx.opts.items().length;
	return Math.min(Math.max(to, 0), targetCtx.opts.items().length);
}

export function syncForeignSortableIntents<T>(
	sourceCtx: SortableContext<T>,
	dragKey: string,
	pointerX: number,
	pointerY: number,
	sessionData: unknown,
	session: DragSession | null = null,
): void {
	const group = sourceCtx.opts.group;
	if (!group || !SortableDragData.is(sessionData) || sessionData.sortableId !== sourceCtx.id) {
		return;
	}
	const best = pickBestForeignTarget(sourceCtx, dragKey, pointerX, pointerY);
	const activeId = best?.id ?? (session ? getGroupedStickyTargetId(session) : null);
	// #region agent log
	const sourceKeys = sourceCtx.intent?.snapshot.map((item) => sourceCtx.opts.keyBy(item)) ?? [];
	sortableStory('D', 'intent/foreign.ts', `group foreign sync · ${dragKey}`, () => ({
		story: [
			`Pointer ${fmtPoint(pointerX, pointerY)} while dragging "${dragKey}" from home [${sourceKeys.join(', ')}].`,
			best
				? `Proximity picked friend column ${String(best.id)} as the active drop target.`
				: `No friend column won proximity; ${activeId != null ? `sticky target ${String(activeId)} still holds.` : 'nothing foreign is active.'}`,
			activeId != null
				? 'Pausing home-column visual preview and raising source stacking so the chip paints above friend chips.'
				: 'Clearing foreign previews on all other grouped columns.',
		].join(' '),
		data: {
			dragKey,
			pointerX,
			pointerY,
			activeId: activeId != null ? String(activeId) : null,
			bestId: best ? String(best.id) : null,
			sourceKeys,
		},
	}));
	// #endregion
	if (activeId != null) syncSourceGroupPreview(sourceCtx, dragKey);
	syncGroupedSourceElevation(sourceCtx, dragKey, activeId != null, pointerX, pointerY);
	for (const targetCtx of sortableRegistry.values()) {
		if (targetCtx.id === sourceCtx.id) continue;
		if (targetCtx.opts.group !== group) continue;
		if (activeId && targetCtx.id === activeId) {
			updateForeignSortableIntent(targetCtx, dragKey, pointerX, pointerY, sessionData, session);
		} else {
			clearForeignSortablePreview(targetCtx);
		}
	}
}

export function clearGroupedForeignSortablePreviews<T>(
	sourceCtx: SortableContext<T>,
	dragKey = '',
): void {
	const group = sourceCtx.opts.group;
	if (!group) return;
	if (dragKey) clearGroupedSourceElevation(sourceCtx, dragKey);
	for (const targetCtx of sortableRegistry.values()) {
		if (targetCtx.id === sourceCtx.id) continue;
		if (targetCtx.opts.group !== group) continue;
		clearForeignSortablePreview(targetCtx);
	}
}

export function clearForeignSortablePreview<T>(ctx: SortableContext<T>): void {
	// #region agent log
	const keys = ctx.intent?.snapshot.map((item) => ctx.opts.keyBy(item)) ?? [];
	sortableStory('C', 'intent/foreign.ts', `friend preview cleared · ${String(ctx.id)}`, () => ({
		story: [
			`Pointer left friend column ${String(ctx.id)} or another column won.`,
			keys.length
				? `Tearing down virtual preview for [${keys.join(', ')}] and snapping displaced chips back.`
				: 'No frozen friend layout was active.',
		].join(' '),
		data: { targetId: String(ctx.id), targetKeys: keys },
	}));
	// #endregion
	if (ctx.foreignIntentVisual) {
		clearDisplacements(ctx.nodesByKey, ctx.foreignIntentVisual.displacedKeys, {
			instant: true,
		});
		ctx.foreignIntentVisual.displacedKeys = [];
	}
	const container = ctx.containerNode;
	if (container instanceof HTMLElement) {
		container.removeAttribute('data-sortable-dragging');
	}
	ctx.foreignIntentVisual = null;
	ctx.clearIntent();
}

export function updateForeignSortableIntent<T>(
	ctx: SortableContext<T>,
	dragKey: string,
	pointerX: number,
	pointerY: number,
	sessionData: unknown,
	session: DragSession | null = null,
): boolean {
	if (!dragKey || !isForeignDrag(ctx, sessionData)) return false;
	if (resolvePreviewMode(ctx.opts) !== 'visual') return false;
	if (!SortableDragData.is(sessionData)) return false;

	const sourceId = sessionData.sortableId;
	if (!sourceId) return false;
	const sourceCtx = sortableRegistry.get(sourceId);
	if (!sourceCtx) return false;

	const container = ctx.containerNode;
	if (!(container instanceof HTMLElement)) return false;
	const stickyId = session ? getGroupedStickyTargetId(session) : null;
	const inTarget = pointerInForeignTarget(
		container,
		ctx,
		sourceCtx,
		dragKey,
		pointerX,
		pointerY,
		session,
	);
	if (!inTarget && stickyId !== ctx.id) {
		clearForeignSortablePreview(ctx);
		return false;
	}

	const visual = ensureForeignIntentVisual(ctx, sourceCtx, dragKey);
	const intent = ctx.intent;
	if (!intent) return false;

	const strategy = intent.sessionStrategy ?? resolveStrategy(ctx.opts.strategy);
	const listStrategy =
		intent.sessionPreset === 'grid' ? 'horizontal' : strategy;
	const dragPoint = sortableDragPointer(sourceCtx, dragKey, pointerX, pointerY);
	const axisPos = listStrategy === 'horizontal' ? pointerX : pointerY;
	const mids = intent.mids ?? [];
	const keys = intent.snapshot.map((item) => ctx.opts.keyBy(item));
	const prevInsert = intent.previewTo;
	let insertAt = computeTargetFromMids(
		ctx,
		mids,
		axisPos,
		dragKey,
		intent.snapshot.length,
		listStrategy,
		intent.edgeThresholdPx,
		{ skipDragDeadZone: true },
	);
	insertAt = Math.min(Math.max(insertAt, 0), intent.snapshot.length);
	const rawFromMids = insertAt;

	const stabilizeBand =
		intent.snapshot.length === 1
			? Math.max(intent.dragBand, (intent.foreignInsertSize ?? 48) * 0.35)
			: intent.dragBand;
	if (mids.length > 0 && stabilizeBand > 0) {
		const stabilizeFrom =
			intent.previewTo >= mids.length ? mids.length - 1 : intent.previewTo;
		insertAt = stabilizeForeignInsertAt(
			stabilizeFrom,
			insertAt,
			axisPos,
			mids,
			stabilizeBand,
		);
	} else if (intent.slotBoundaries?.length && intent.dragBand > 0) {
		const pos = strategy === 'horizontal' ? dragPoint.x : dragPoint.y;
		insertAt = stabilizeVisualInsertAt(
			intent.previewTo,
			insertAt,
			pos,
			intent.slotBoundaries,
			intent.dragBand,
		);
	}
	const afterStabilize = insertAt;

	const contentRect = resolveForeignContentRect(ctx, container);
	const approach = approachAxisForForeignTarget(ctx);
	const inColumn = pointerInForeignColumnContainer(ctx, pointerX, pointerY);
	const outsideCrossBand = !overlapsCrossAxis(pointerX, pointerY, contentRect, approach);
	const pastContentAlongApproach = pointerBeyondForeignContent(
		pointerX,
		pointerY,
		contentRect,
		approach,
	);
	const forceReasons: string[] = [];
	if (inColumn) {
		if (foreignColumnShouldAppendAtEnd(ctx, pointerX, pointerY, contentRect, approach)) {
			insertAt = intent.snapshot.length;
			const reason = pastContentAlongApproach
				? `pointer past content ${approach === 'x' ? 'right' : 'bottom'} edge → append at end`
				: outsideCrossBand && intent.snapshot.length <= 1
					? 'single-chip column: pointer in bottom/top padding → append at end'
					: 'append-at-end rule';
			forceReasons.push(reason);
		} else if (outsideCrossBand && intent.snapshot.length > 1) {
			forceReasons.push(
				`multi-chip column: pointer below/above chip row — slot from ${listStrategy === 'horizontal' ? 'pointer X' : 'pointer Y'}, not forced append`,
			);
		} else if (intent.snapshot.length === 1 && insertAt === 1) {
			const slot = visual.preLayout[0];
			const holdMargin = Math.max(8, intent.dragBand * 0.5);
			if (slot && axisPos < slot.end + holdMargin) {
				insertAt = 0;
				forceReasons.push('single friend chip: pointer before trailing edge → insert before');
			}
		}
	}

	const changed = intent.previewTo !== insertAt;
	// #region agent log
	sortableStory('F', 'intent/foreign.ts', `friend slot resolve · ${dragKey} → ${String(ctx.id)}`, () => ({
		story: [
			`${fmtPoint(pointerX, pointerY)} over friend column; chip center ${fmtPoint(dragPoint.x, dragPoint.y, 'chip')}; lag ${fmtOffset(pointerX, pointerY, dragPoint.x, dragPoint.y)}.`,
			`Chip row ${fmtRect(contentRect, 'content')}; column ${inColumn ? 'contains' : 'misses'} pointer; cross-axis overlap ${outsideCrossBand ? 'no (below/above row — slot still from axis)' : 'yes'}.`,
			`List strategy ${listStrategy}; axis position ${Math.round(axisPos)}; mids ${fmtMids(mids)}.`,
			`Pipeline: mids→${rawFromMids}, stabilize→${afterStabilize}, final→${insertAt} (${fmtIndexChange(prevInsert, insertAt)}).`,
			forceReasons.length
				? `Overrides: ${forceReasons.join('; ')}.`
				: 'No append-at-end override (padding below chips no longer forces last slot).',
			`Preview order ${fmtOrder(keys, insertAt, dragKey)}.`,
			changed ? 'Displacement refresh will run because the gap index moved.' : 'Gap index unchanged — siblings may still settle.',
		].join(' '),
		data: {
			dragKey,
			targetId: String(ctx.id),
			pointerX,
			pointerY,
			dragCenterX: dragPoint.x,
			dragCenterY: dragPoint.y,
			axisPos,
			rawFromMids,
			afterStabilize,
			insertAt,
			prevInsert,
			inColumn,
			outsideCrossBand,
			pastContentAlongApproach,
			forceReasons,
			targetKeys: keys,
		},
	}));
	// #endregion
	intent.previewTo = insertAt;
	intent.targetIndex = insertAt;

	ctx.lastIntentX = pointerX;
	ctx.lastIntentY = pointerY;

	refreshSortableDisplacement(ctx, dragKey, visual, { instant: true });

	if (changed) {
		// #region agent log
		sortableStory('I', 'intent/foreign.ts', `friend gap moved · ${dragKey}`, () => ({
		story: [
				`Friend column ${String(ctx.id)} preview slot ${fmtIndexChange(prevInsert, insertAt)}.`,
				`Virtual list now ${fmtOrder(keys, insertAt, dragKey)} — siblings should animate into the opened gap.`,
			].join(' '),
		data: { targetId: String(ctx.id), dragKey, insertAt, prevInsert, targetKeys: keys },
	}));
		// #endregion
	}

	return changed;
}
