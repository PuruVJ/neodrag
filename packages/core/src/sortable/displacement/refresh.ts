import { describeChipMotion, fmtIndexChange, fmtOrder, sortableStory } from '../agent-log.ts';
import type { SortableContext, SortableIntentPluginState } from '../context.ts';
import {
	axisForPreset,
	isSortingStrategy,
	listAxisForPreset,
	resolvePreset,
	resolveSortingStrategy,
	resolveStrategyInput,
} from '../strategy/resolve.ts';
import type { StrategyContext, Transform } from '../strategy/types.ts';
import { rectsFromLayout } from '../strategy/types.ts';
import { displacementFromVirtualSlots } from '../strategy/virtual-shift.ts';
import { averageGap, type SortableLayoutEntry } from '../visual/layout.ts';
import { applyDisplacements, clearDisplacements } from './apply.ts';
import type { SortablePreset } from '../strategy/types.ts';

function overIndexFromInsertAt(insertAt: number, dragFrom: number, length: number): number {
	if (insertAt === dragFrom) return dragFrom;
	if (insertAt > dragFrom) return Math.min(insertAt, length - 1);
	return Math.max(0, insertAt);
}

export function computeDisplacements<T>(
	ctx: SortableContext<T>,
	state: SortableIntentPluginState,
	dragKey: string,
): Map<string, Transform> {
	const intent = ctx.intent;
	if (!intent) return new Map();

	const from = intent.dragFrom;
	const insertAt = intent.previewTo;
	const input = resolveStrategyInput(ctx.opts.strategy);
	const preset = resolvePreset(input) ?? intent.sessionPreset ?? 'vertical';
	const strategyFn = resolveSortingStrategy(input);
	const listAxis = listAxisForPreset(preset);

	const byKey = new Map<string, Transform>();
	const entries = state.preLayout;
	const current = state.currentLayout.length ? state.currentLayout : entries;

	if (from >= entries.length && listAxis && intent.foreignInsertSize != null) {
		return computeForeignVirtualDisplacements(
			entries,
			insertAt,
			intent.foreignInsertSize,
			listAxis,
		);
	}

	if (listAxis) {
		for (const entry of current) {
			if (entry.key === dragKey) continue;
			const t = displacementFromVirtualSlots(
				entries,
				current,
				from,
				insertAt,
				entry.index,
				listAxis,
			);
			byKey.set(entry.key, t);
		}
		return byKey;
	}

	const axis = axisForPreset(preset);
	const rects = state.measuredRects.length
		? state.measuredRects
		: rectsFromLayout(entries, 'horizontal');
	const overIndex = overIndexFromInsertAt(insertAt, from, entries.length);

	for (let index = 0; index < entries.length; index++) {
		const entry = entries[index]!;
		const sctx: StrategyContext = {
			rects,
			activeIndex: from,
			overIndex,
			insertAt,
			index,
			axis,
		};
		const t = isSortingStrategy(input)
			? strategyFn(sctx)
			: strategyFn(sctx);
		byKey.set(entry.key, t ?? { x: 0, y: 0 });
	}

	if (!isSortingStrategy(input) && preset === 'grid') {
		return byKey;
	}

	return byKey;
}

export function computeSourceRemovedDisplacements(
	entries: readonly SortableLayoutEntry[],
	dragKey: string,
	listAxis: 'horizontal' | 'vertical',
): Map<string, Transform> {
	const gap = averageGap(entries);
	const horizontal = listAxis === 'horizontal';
	const remaining = [...entries]
		.filter((entry) => entry.key !== dragKey)
		.sort((a, b) => a.index - b.index);
	const anchor = entries.length
		? Math.min(...entries.map((entry) => entry.start))
		: 0;
	const byKey = new Map<string, Transform>();
	let pos = anchor;
	for (const entry of remaining) {
		const shift = pos - entry.start;
		byKey.set(entry.key, horizontal ? { x: shift, y: 0 } : { x: 0, y: shift });
		pos += entry.size + gap;
	}
	return byKey;
}

export function computeForeignVirtualDisplacements(
	entries: readonly SortableLayoutEntry[],
	insertAt: number,
	insertSize: number,
	listAxis: 'horizontal' | 'vertical',
): Map<string, Transform> {
	const gap = averageGap(entries);
	const room = insertSize + gap;
	const horizontal = listAxis === 'horizontal';
	const sorted = [...entries].sort((a, b) => a.index - b.index);
	const clampedInsert = Math.min(Math.max(insertAt, 0), sorted.length);
	const anchor = sorted.length ? Math.min(...sorted.map((entry) => entry.start)) : 0;

	const byKey = new Map<string, Transform>();
	let pos = anchor;
	for (let slot = 0; slot <= sorted.length; slot++) {
		if (slot === clampedInsert) {
			pos += room;
		}
		if (slot < sorted.length) {
			const entry = sorted[slot]!;
			const shift = pos - entry.start;
			byKey.set(entry.key, horizontal ? { x: shift, y: 0 } : { x: 0, y: shift });
			pos += entry.size + gap;
		}
	}
	return byKey;
}

export function refreshSortableDisplacement<T>(
	ctx: SortableContext<T>,
	dragKey: string,
	state: SortableIntentPluginState,
	options: { instant?: boolean } = {},
): void {
	const intent = ctx.intent;
	if (!intent) return;

	clearDisplacements(ctx.nodesByKey, state.displacedKeys, options);
	const byKey = computeDisplacements(ctx, state, dragKey);
	const applied = applyDisplacements(ctx.nodesByKey, byKey, {
		instant: options.instant ?? true,
		dragKey,
	});
	state.displacedKeys = [...applied];

	// #region agent log
	const keys = intent.snapshot.map((item) => ctx.opts.keyBy(item));
	const motions = [...byKey.entries()].map(([key, t]) => describeChipMotion(key, t));
	sortableStory('B', 'displacement/refresh.ts', `displacement paint · ${dragKey}`, () => ({
		story: [
			`Visual gap refresh while dragging "${dragKey}" (${intent.sessionPreset} preset).`,
			`Intent ${fmtIndexChange(intent.dragFrom, intent.previewTo)}; virtual order ${fmtOrder(keys, intent.previewTo, dragKey)}.`,
			applied.length
				? `Nudging ${applied.length} sibling(s): ${motions.join('; ')}.`
				: 'No siblings displaced this frame.',
		].join(' '),
		data: {
			dragKey,
			dragFrom: intent.dragFrom,
			previewTo: intent.previewTo,
			sessionPreset: intent.sessionPreset,
			displacedKeys: [...applied],
			transforms: Object.fromEntries(
				[...byKey.entries()].map(([key, t]) => [key, { x: t.x, y: t.y }]),
			),
			listKeys: keys,
		},
	}));
	// #endregion
}

export function freezeSessionPreset(
	strategy: ReturnType<typeof resolveStrategyInput>,
): SortablePreset {
	const preset = resolvePreset(strategy);
	return preset ?? 'vertical';
}
