import { numberStub, resolveSizeInput } from '../length-contract.ts';
import { lengthContext } from '../length/utils.ts';
import { SORTABLE_LIFTED_ATTR } from './visual.ts';
import type { SortableContext } from './context.ts';
import type { SortableOptions, SortableStrategy } from './types.ts';

export type SortableMidEntry = { key: string; mid: number; index: number };

export function invalidateMidsCache<T>(ctx: SortableContext<T>) {
	ctx.midsCache = null;
}

export function buildMidsFromLayout<T>(
	ctx: SortableContext<T>,
	items: readonly T[],
	strategy: SortableStrategy,
): SortableMidEntry[] {
	const mids: SortableMidEntry[] = [];
	for (let i = 0; i < items.length; i++) {
		const key = ctx.opts.keyBy(items[i]!);
		const el = ctx.nodesByKey.get(key);
		if (!el) continue;
		const rect = el.getBoundingClientRect();
		const mid =
			strategy === 'horizontal' ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
		mids.push({ key, mid, index: i });
	}
	mids.sort((a, b) => a.mid - b.mid);
	return mids;
}

export function resolveEdgeThresholdPx<T>(
	ctx: SortableContext<T>,
	strategy: SortableStrategy,
	list: SortableMidEntry[],
	excludeKey: string,
): number {
	if (ctx.opts.edgeThreshold == null) return 0;
	const adapter = ctx.opts.length ?? numberStub;
	const dragEntry = excludeKey ? list.find((entry) => entry.key === excludeKey) : undefined;
	const refKey = dragEntry?.key ?? list[0]?.key ?? '';
	const ref = ctx.nodesByKey.get(refKey) ?? document.documentElement;
	const axis = strategy === 'horizontal' ? 'x' : 'y';
	return resolveSizeInput(adapter, ctx.opts.edgeThreshold, lengthContext(ref, axis), 0);
}

export function computeTargetFromMids<T>(
	ctx: SortableContext<T>,
	list: SortableMidEntry[],
	pos: number,
	excludeKey: string,
	len: number,
	strategy: SortableStrategy,
	edgeThresholdPx: number,
	options: { skipDragDeadZone?: boolean },
): number {
	if (list.length === 0) return 0;

	const dragEntry = excludeKey ? list.find((entry) => entry.key === excludeKey) : undefined;
	const dragIndex = dragEntry?.index ?? -1;

	if (!options.skipDragDeadZone && dragEntry && dragIndex >= 0) {
		const el = ctx.nodesByKey.get(excludeKey);
		if (el instanceof HTMLElement && !el.hasAttribute(SORTABLE_LIFTED_ATTR)) {
			const rect = el.getBoundingClientRect();
			const start = strategy === 'horizontal' ? rect.left : rect.top;
			const end = strategy === 'horizontal' ? rect.right : rect.bottom;
			if (pos >= start && pos <= end) return dragIndex;
		}
	}

	let to = dragIndex >= 0 ? dragIndex : 0;
	if (dragIndex >= 0) {
		for (const entry of list) {
			if (entry.key === excludeKey) continue;
			if (entry.index < dragIndex) {
				if (pos < entry.mid - edgeThresholdPx) to = Math.min(to, entry.index);
			} else if (entry.index > dragIndex) {
				if (pos > entry.mid + edgeThresholdPx) to = Math.max(to, entry.index + 1);
			}
		}
	} else {
		for (const entry of list) {
			if (pos > entry.mid + edgeThresholdPx) {
				to = entry.index + 1;
				continue;
			}
			to = entry.index;
			break;
		}
	}

	return Math.min(Math.max(to, 0), len);
}

export function computeIndex<T>(
	ctx: SortableContext<T>,
	pointerX: number,
	pointerY: number,
	strategy: SortableStrategy,
	excludeKey: string,
): number {
	const items = ctx.opts.items();
	const len = items.length;
	if (len === 0) return 0;

	let orderKey = '';
	for (let i = 0; i < items.length; i++) {
		if (i > 0) orderKey += '\0';
		orderKey += ctx.opts.keyBy(items[i]!);
	}

	let mids = ctx.midsCache?.mids;
	if (!ctx.midsCache || ctx.midsCache.itemsLen !== len || ctx.midsCache.orderKey !== orderKey) {
		mids = buildMidsFromLayout(ctx, items, strategy);
		ctx.midsCache = { mids, itemsLen: len, orderKey };
	}

	const pos = strategy === 'horizontal' ? pointerX : pointerY;
	const edgeThresholdPx = resolveEdgeThresholdPx(ctx, strategy, mids, excludeKey);
	return computeTargetFromMids(ctx, mids, pos, excludeKey, len, strategy, edgeThresholdPx, {});
}

export function computeIntentIndex<T>(
	ctx: SortableContext<T>,
	pointerX: number,
	pointerY: number,
	strategy: SortableStrategy,
	excludeKey: string,
	options?: { commit?: boolean },
): number {
	const intent = ctx.intent;
	const snapshot = intent?.snapshot;
	const len = snapshot?.length ?? 0;
	if (len === 0) return 0;

	const pos = strategy === 'horizontal' ? pointerX : pointerY;
	const from = intent?.dragFrom ?? -1;
	const frozen = intent?.dragAxis;
	const mode = ctx.opts.mode ?? 'insert';

	if (
		!options?.commit &&
		mode !== 'swap' &&
		resolvePreviewMode(ctx.opts) === 'visual' &&
		frozen &&
		from >= 0 &&
		pos >= frozen.start &&
		pos <= frozen.end
	) {
		return intent && intent.previewTo >= 0 ? intent.previewTo : from;
	}

	if (resolvePreviewMode(ctx.opts) === 'state') {
		const list = intent?.mids ?? buildMidsFromLayout(ctx, ctx.opts.items(), strategy);
		const edgeThresholdPx = edgeThresholdForIntent(ctx, strategy, list, excludeKey);
		return computeTargetFromMids(ctx, list, pos, excludeKey, len, strategy, edgeThresholdPx, {
			skipDragDeadZone: true,
		});
	}

	const list = intent?.mids;
	if (!list || list.length === 0) {
		return computeIndex(ctx, pointerX, pointerY, strategy, excludeKey);
	}

	const edgeThresholdPx = edgeThresholdForIntent(ctx, strategy, list, excludeKey);
	return computeTargetFromMids(ctx, list, pos, excludeKey, len, strategy, edgeThresholdPx, {
		skipDragDeadZone: true,
	});
}

function resolvePreviewMode<T>(opts: SortableOptions<T>) {
	if (opts.preview === 'state' || opts.preview === 'visual') return opts.preview;
	if (opts.onSortPreview) return 'state';
	return 'visual';
}

function edgeThresholdForIntent<T>(
	ctx: SortableContext<T>,
	strategy: SortableStrategy,
	list: SortableMidEntry[],
	excludeKey: string,
): number {
	const intent = ctx.intent;
	if (intent && !Number.isNaN(intent.edgeThresholdPx)) return intent.edgeThresholdPx;
	return resolveEdgeThresholdPx(ctx, strategy, list, excludeKey);
}
