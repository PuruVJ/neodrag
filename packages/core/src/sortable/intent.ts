import { fmtIndexChange, fmtOrder, fmtPoint, sortableStory } from './agent-log.ts';
import { refreshSortableDisplacement } from './displacement/refresh.ts';
import { stabilizeVisualInsertAt } from './visual/layout.ts';
import { computeGridOverIndex } from './intent/grid-index.ts';
import {
	resolvePreset,
	resolveStrategyInput,
} from './strategy/resolve.ts';
import type { SortableCommit, SortableContext, SortableIntentPluginState } from './context.ts';
import { sortableRegistry } from './context.ts';
import {
	buildMidsFromLayout,
	computeIntentIndex,
	computeIndex,
	resolveEdgeThresholdPx,
} from './mids.ts';
import {
	applySortableReorder,
	buildCommittedOrder,
	insertAtFromTargetIndex,
	reorderForInsert,
} from './reorder.ts';
import { SortableDragData } from './session-data.ts';
import { isGroupedForeignDropPending, updateGroupDropPlan } from './group/plan.ts';
import { syncSourceGroupPreview } from './intent/source-group-preview.ts';
import type { DragSession } from '../types.ts';
import type {
	SortableMode,
	SortableOptions,
	SortablePreset,
	SortablePreviewMode,
	SortableStrategy,
} from './types.ts';

export function resolveStrategy(strategy: SortableOptions<unknown>['strategy']): SortableStrategy {
	const input = resolveStrategyInput(strategy);
	const preset = resolvePreset(input);
	return preset ?? 'vertical';
}

export function resolveSessionPreset(
	strategy: SortableOptions<unknown>['strategy'],
): SortablePreset {
	return resolvePreset(resolveStrategyInput(strategy)) ?? 'vertical';
}

export function resolvePreviewMode<T>(opts: SortableOptions<T>): SortablePreviewMode {
	if (opts.preview === 'state' || opts.preview === 'visual') return opts.preview;
	if (opts.onSortPreview) return 'state';
	return 'visual';
}

export function layoutStrategyFromNodes<T>(
	ctx: SortableContext<T>,
	keys: readonly string[],
): SortableStrategy | null {
	if (keys.length < 2) return null;
	const first = ctx.nodesByKey.get(keys[0]!);
	const last = ctx.nodesByKey.get(keys[keys.length - 1]!);
	if (!(first instanceof HTMLElement) || !(last instanceof HTMLElement)) return null;
	const a = first.getBoundingClientRect();
	const b = last.getBoundingClientRect();
	const spanX = Math.abs(b.left + b.width / 2 - (a.left + a.width / 2));
	const spanY = Math.abs(b.top + b.height / 2 - (a.top + a.height / 2));
	if (spanX > spanY * 1.2) return 'horizontal';
	if (spanY > spanX * 1.2) return 'vertical';
	return null;
}

export function declaredStrategyMatchesLayout<T>(_ctx: SortableContext<T>): boolean {
	return true;
}

export function isForeignDrag<T>(ctx: SortableContext<T>, data: unknown): boolean {
	if (!ctx.opts.group || !SortableDragData.is(data)) return false;
	const sortableId = data.sortableId;
	if (!sortableId || sortableId === ctx.id) return false;
	return sortableRegistry.hasForeignGroupMember(ctx.opts.group, sortableId);
}

export type IntentAtResult = { index: number; insertAt: number };

export function resolveIntentAt<T>(
	ctx: SortableContext<T>,
	pointerX: number,
	pointerY: number,
	dragKey: string,
	options: { commit?: boolean; stabilize?: boolean } = {},
): IntentAtResult | null {
	const intent = ctx.intent;
	if (!intent) return null;
	const snapshot = intent.snapshot;
	const from = intent.dragFrom;
	if (from < 0) return null;
	if (ctx.opts.keyBy(snapshot[from]!) !== dragKey) return null;

	const preset = intent.sessionPreset ?? intent.sessionStrategy ?? resolveStrategy(ctx.opts.strategy);
	const strategy = preset === 'grid' ? 'horizontal' : preset;
	const mode = ctx.opts.mode ?? 'insert';
	const previewMode = resolvePreviewMode(ctx.opts);
	const pos = strategy === 'horizontal' ? pointerX : pointerY;

	if (preset === 'grid' && ctx.intentVisual) {
		const rects = ctx.intentVisual.measuredRects;
		if (rects.length > 0) {
			const index = computeGridOverIndex(
				rects,
				pointerX,
				pointerY,
				ctx.opts.collision ?? 'closestCenter',
			);
			let insertAt: number;
			if (mode === 'swap') {
				({ insertAt } = applySortableReorder(snapshot, from, index, mode));
			} else if (options.commit) {
				({ insertAt } = reorderForInsert(snapshot, from, index, mode));
			} else {
				insertAt = insertAtFromTargetIndex(from, index, snapshot.length);
			}
			return { index, insertAt };
		}
	}

	if (
		!options.commit &&
		previewMode === 'visual' &&
		mode !== 'swap' &&
		intent.dragAxis &&
		pos >= intent.dragAxis.start &&
		pos <= intent.dragAxis.end
	) {
		const index = intent.targetIndex >= 0 ? intent.targetIndex : from;
		return { index, insertAt: intent.previewTo >= 0 ? intent.previewTo : from };
	}

	let index = computeIntentIndex(ctx, pointerX, pointerY, strategy, dragKey, {
		commit: options.commit,
	});
	if (index < 0) index = snapshot.length - 1;

	let insertAt: number;
	if (mode === 'swap') {
		({ insertAt } = applySortableReorder(snapshot, from, index, mode));
	} else if (options.commit) {
		({ insertAt } = reorderForInsert(snapshot, from, index, mode));
	} else {
		insertAt = insertAtFromTargetIndex(from, index, snapshot.length);
		if (options.stabilize !== false && previewMode === 'visual') {
			insertAt = stabilizeVisualInsertAt(
				intent.previewTo,
				insertAt,
				pos,
				intent.slotBoundaries ?? [],
				intent.dragBand,
			);
		}
	}

	return { index, insertAt };
}

export function commitFromIntent<T>(
	ctx: SortableContext<T>,
	dragKey: string,
	pointerX: number,
	pointerY: number,
): SortableCommit<T> | null {
	const intent = ctx.intent!;
	const from = intent.dragFrom;
	const previewMode = resolvePreviewMode(ctx.opts);
	if (from < 0) return null;
	if (ctx.opts.keyBy(intent.snapshot[from]!) !== dragKey) return null;

	const mode = ctx.opts.mode ?? 'insert';
	if (previewMode === 'visual' && intent.previewTo >= 0 && intent.previewTo !== from) {
		const insertAt = intent.previewTo;
		const next = buildCommittedOrder(intent.snapshot, from, insertAt, mode);
		// #region agent log
		const nextKeys = next.map((item) => ctx.opts.keyBy(item));
		sortableStory('A', 'intent.ts:commitFromIntent', `home list commit · ${dragKey}`, () => ({
		story: [
				`Committing visual preview for "${dragKey}" in home column: ${fmtIndexChange(from, insertAt)}.`,
				`DOM order will become ${fmtOrder(nextKeys, insertAt, dragKey)}.`,
			].join(' '),
		data: { dragKey, from, insertAt, nextKeys },
	}));
		// #endregion
		return { next, from, insertAt, item: intent.snapshot[from]! };
	}

	const resolved = resolveIntentAt(ctx, pointerX, pointerY, dragKey, { commit: true });
	if (!resolved) return null;
	if (resolved.insertAt === from) return null;
	const next = buildCommittedOrder(intent.snapshot, from, resolved.insertAt, mode);
	return { next, from, insertAt: resolved.insertAt, item: intent.snapshot[from]! };
}

export function updateSortableIntent<T>(
	ctx: SortableContext<T>,
	dragKey: string,
	pointerX: number,
	pointerY: number,
	sessionData: unknown,
	session?: DragSession,
): boolean {
	if (!dragKey || isForeignDrag(ctx, sessionData)) return false;

	const intent = ctx.intent;
	if (!intent) return false;

	const container = ctx.containerNode;
	const previewMode = resolvePreviewMode(ctx.opts);
	const overForeignColumn =
		ctx.opts.group != null &&
		isGroupedForeignDropPending(ctx, session ?? null, dragKey, pointerX, pointerY);
	if (overForeignColumn && previewMode === 'visual') {
		syncSourceGroupPreview(ctx, dragKey);
		if (session && ctx.opts.group) {
			updateGroupDropPlan(session, ctx, dragKey, pointerX, pointerY, sessionData);
		}
		return false;
	}
	if (container && !pointerInContainer(container, pointerX, pointerY, ctx)) {
		if (
			previewMode === 'visual' &&
			!overForeignColumn &&
			intent.previewTo !== intent.dragFrom &&
			ctx.intentVisual
		) {
			intent.previewTo = intent.dragFrom;
			refreshSortableDisplacement(ctx, dragKey, ctx.intentVisual, { instant: true });
		}
		return false;
	}

	const from = intent.dragFrom;
	if (from < 0) return false;

	const preset = intent.sessionPreset ?? intent.sessionStrategy ?? resolveStrategy(ctx.opts.strategy);
	const strategy = preset === 'grid' ? 'horizontal' : preset;
	const pos = strategy === 'horizontal' ? pointerX : pointerY;
	const frozen = intent.dragAxis;
	const mode = ctx.opts.mode ?? 'insert';
	if (previewMode === 'visual' && mode !== 'swap' && frozen && pos >= frozen.start && pos <= frozen.end) {
		return false;
	}

	const resolved = resolveIntentAt(ctx, pointerX, pointerY, dragKey, { stabilize: true });
	if (!resolved) return false;

	intent.targetIndex = resolved.index;
	const insertAt = resolved.insertAt;
	const changed = intent.previewTo !== insertAt;
	intent.previewTo = insertAt;

	const item = intent.snapshot[from]!;

	if (ctx.opts.onIntentChange) {
		ctx.opts.onIntentChange({ from, to: insertAt, item, mode });
	}

	if (mode === 'swap' && changed && insertAt !== from) {
		const { next } = applySortableReorder(intent.snapshot, from, resolved.index, mode);
		ctx.opts.onReorder(next, { from, to: insertAt, item, mode, phase: 'preview' });
	}

	if (previewMode === 'state') {
		if (insertAt !== from) {
			const { next } =
				mode === 'insert'
					? reorderForInsert(intent.snapshot, from, resolved.index, mode)
					: applySortableReorder(intent.snapshot, from, resolved.index, mode);
			ctx.opts.onSortPreview?.(next, { from, to: insertAt, item, mode });
			intent.snapshot = next;
			intent.dragFrom = insertAt;
			intent.mids = buildMidsFromLayout(ctx, next, strategy);
		}
	}

	if (changed && previewMode === 'visual' && ctx.intentVisual) {
		refreshSortableDisplacement(ctx, dragKey, ctx.intentVisual, { instant: true });
	}

	if (changed) {
		// #region agent log
		const keys = intent.snapshot.map((item) => ctx.opts.keyBy(item));
		sortableStory('D', 'intent.ts:updateSortableIntent', `home slot moved · ${dragKey}`, () => ({
		story: [
				`${fmtPoint(pointerX, pointerY)} in home column (${intent.sessionPreset}).`,
				`Preview ${fmtIndexChange(from, insertAt)} → ${fmtOrder(keys, insertAt, dragKey)}.`,
			].join(' '),
		data: { dragKey, from, insertAt, pointerX, pointerY, sessionPreset: intent.sessionPreset },
	}));
		// #endregion
	}

	if (session && ctx.opts.group) {
		updateGroupDropPlan(session, ctx, dragKey, pointerX, pointerY, sessionData);
	}

	return changed;
}

export function refreshSortableVisual<T>(
	ctx: SortableContext<T>,
	dragKey: string,
	state: SortableIntentPluginState,
	options: { instant?: boolean } = {},
): void {
	refreshSortableDisplacement(ctx, dragKey, state, options);
}

export function pointerInContainer<T>(
	container: HTMLElement | SVGElement,
	x: number,
	y: number,
	ctx?: SortableContext<T>,
): boolean {
	const rect = ctx?.intent?.containerRect ?? container.getBoundingClientRect();
	if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return true;
	if (!ctx?.intentVisualKey) return false;
	const lifted = ctx.nodesByKey.get(ctx.intentVisualKey);
	if (!(lifted instanceof HTMLElement)) return false;
	const nodeRect = lifted.getBoundingClientRect();
	return (
		x >= nodeRect.left &&
		x <= nodeRect.right &&
		y >= nodeRect.top &&
		y <= nodeRect.bottom
	);
}

export function sortableDragPointer<T>(
	ctx: SortableContext<T>,
	dragKey: string,
	pointerX: number,
	pointerY: number,
): { x: number; y: number } {
	const node = ctx.nodesByKey.get(dragKey);
	if (node instanceof HTMLElement) {
		const rect = node.getBoundingClientRect();
		return { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 };
	}
	return { x: pointerX, y: pointerY };
}

export function sortableDraggedNodeRect<T>(
	ctx: SortableContext<T>,
	dragKey: string,
): DOMRect | null {
	const node = ctx.nodesByKey.get(dragKey);
	if (!(node instanceof HTMLElement)) return null;
	return node.getBoundingClientRect();
}

export function rectIntersectsContainer(
	container: HTMLElement | SVGElement,
	nodeRect: DOMRect,
): boolean {
	const containerRect = container.getBoundingClientRect();
	return (
		nodeRect.right >= containerRect.left &&
		nodeRect.left <= containerRect.right &&
		nodeRect.bottom >= containerRect.top &&
		nodeRect.top <= containerRect.bottom
	);
}

export function draggedNodeIntersectsContainer<T>(
	container: HTMLElement | SVGElement,
	sourceCtx: SortableContext<T>,
	dragKey: string,
): boolean {
	const nodeRect = sortableDraggedNodeRect(sourceCtx, dragKey);
	if (!nodeRect) return false;
	return rectIntersectsContainer(container, nodeRect);
}

export function draggedNodeOverlapsForeignGroupedZone<T>(
	sourceCtx: SortableContext<T>,
	dragKey: string,
	pointerX: number = sourceCtx.lastIntentX,
	pointerY: number = sourceCtx.lastIntentY,
	session: DragSession | null = null,
): boolean {
	return isGroupedForeignDropPending(sourceCtx, session, dragKey, pointerX, pointerY);
}

export function dragPayload<T>(ctx: SortableContext<T>, key: string, data?: () => T) {
	if (ctx.opts.group) {
		return data ? { key, sortableId: ctx.id, value: data() } : { key, sortableId: ctx.id };
	}
	return data ? { key, value: data() } : { key };
}

export function edgeThresholdForIntent<T>(
	ctx: SortableContext<T>,
	strategy: SortableStrategy,
	list: { key: string; mid: number; index: number }[],
	excludeKey: string,
): number {
	const intent = ctx.intent;
	if (intent && !Number.isNaN(intent.edgeThresholdPx)) return intent.edgeThresholdPx;
	return resolveEdgeThresholdPx(ctx, strategy, list, excludeKey);
}

export class SortableIntent<T> {
	constructor(readonly ctx: SortableContext<T>) {}

	resolveAt(
		pointerX: number,
		pointerY: number,
		dragKey: string,
		options?: { commit?: boolean; stabilize?: boolean },
	): IntentAtResult | null {
		return resolveIntentAt(this.ctx, pointerX, pointerY, dragKey, options);
	}

	update(dragKey: string, pointerX: number, pointerY: number, sessionData: unknown): boolean {
		return updateSortableIntent(this.ctx, dragKey, pointerX, pointerY, sessionData);
	}

	commitFrom(dragKey: string, pointerX: number, pointerY: number): SortableCommit<T> | null {
		return commitFromIntent(this.ctx, dragKey, pointerX, pointerY);
	}

	refreshVisual(
		dragKey: string,
		state: SortableIntentPluginState,
		options?: { instant?: boolean },
	): void {
		refreshSortableVisual(this.ctx, dragKey, state, options);
	}

	matchesDeclaredLayout(): boolean {
		return declaredStrategyMatchesLayout(this.ctx);
	}

	isForeignDrag(data: unknown): boolean {
		return isForeignDrag(this.ctx, data);
	}
}
