import { SORTABLE_ROW_ATTR } from '../../element-props.ts';
import { sortableRowSnapshot, sortableStory } from '../agent-log.ts';
import type { SortableStrategy } from '../types.ts';

export { SORTABLE_ROW_ATTR, sortableRowAttrs } from '../../element-props.ts';

export const SORTABLE_LIFTED_ATTR = 'data-neodrag-sortable-lifted';
export const SORTABLE_PLACEHOLDER_ROW_ATTR = 'data-neodrag-sortable-placeholder-row';

export function findSortableRow(
	node: HTMLElement,
	container?: HTMLElement | null,
): HTMLElement | null {
	if (node.hasAttribute(SORTABLE_ROW_ATTR)) return node;
	const marked = node.closest(`[${SORTABLE_ROW_ATTR}]`);
	if (marked instanceof HTMLElement) return marked;
	if (container instanceof HTMLElement) {
		const parent = node.parentElement;
		if (parent instanceof HTMLElement && parent !== node && container.contains(parent)) {
			parent.setAttribute(SORTABLE_ROW_ATTR, '');
			return parent;
		}
	}
	return null;
}

export type SortableLayoutEntry = {
	key: string;
	index: number;
	start: number;
	end: number;
	size: number;
};

export type SortableLiftState = {
	position: string;
	left: string;
	top: string;
	width: string;
	height: string;
	margin: string;
	zIndex: string;
	row: {
		minHeight: string;
		minWidth: string;
		flexShrink: string;
		position: string;
		translate: string;
		offsetX: number;
		offsetY: number;
	} | null;
};

export type SortableVisualState = {
	lift: SortableLiftState | null;
	siblingTranslates: Map<string, { x: number; y: number }>;
};

export function buildLayoutEntries<T>(
	items: readonly T[],
	keyBy: (item: T) => string,
	nodesByKey: Map<string, HTMLElement | SVGElement>,
	strategy: SortableStrategy,
): SortableLayoutEntry[] {
	const horizontal = strategy === 'horizontal';
	const entries: SortableLayoutEntry[] = [];
	for (let i = 0; i < items.length; i++) {
		const key = keyBy(items[i]!);
		const el = nodesByKey.get(key);
		if (!el) continue;
		const row =
			el instanceof HTMLElement ? findSortableRow(el) : null;
		const measure = row instanceof HTMLElement ? row : el;
		let rect = measure.getBoundingClientRect();
		if (el instanceof HTMLElement && el.hasAttribute(SORTABLE_LIFTED_ATTR) && row) {
			rect = row.getBoundingClientRect();
		}
		const start = horizontal ? rect.left : rect.top;
		const end = horizontal ? rect.right : rect.bottom;
		entries.push({ key, index: i, start, end, size: end - start });
	}
	return entries;
}

export function averageGap(entries: SortableLayoutEntry[]): number {
	const sorted = [...entries].sort((a, b) => a.start - b.start);
	let total = 0;
	let count = 0;
	for (let i = 0; i < sorted.length - 1; i++) {
		const gap = sorted[i + 1]!.start - sorted[i]!.end;
		if (gap >= 0) {
			total += gap;
			count++;
		}
	}
	return count > 0 ? total / count : 0;
}

export function virtualOrderKeys(
	entries: SortableLayoutEntry[],
	dragFrom: number,
	insertAt: number,
): string[] {
	const byIndex = [...entries].sort((a, b) => a.index - b.index);
	const dragEntry = byIndex.find((e) => e.index === dragFrom);
	if (!dragEntry) return [];

	const virtual = byIndex.filter((e) => e.index !== dragFrom);
	virtual.splice(insertAt, 0, dragEntry);
	return virtual.map((entry) => entry.key);
}

export function virtualSlotStarts(
	entries: SortableLayoutEntry[],
	dragFrom: number,
	insertAt: number,
): Map<number, number> {
	const byIndex = [...entries].sort((a, b) => a.index - b.index);
	const dragEntry = byIndex.find((e) => e.index === dragFrom);
	if (!dragEntry) return new Map();

	const virtual = byIndex.filter((e) => e.index !== dragFrom);
	virtual.splice(insertAt, 0, dragEntry);

	const gap = averageGap(entries);
	const anchor = Math.min(...entries.map((entry) => entry.start));
	const starts = new Map<number, number>();
	let pos = anchor;
	for (const entry of virtual) {
		starts.set(entry.index, pos);
		pos += entry.size + gap;
	}
	return starts;
}

export function slotBoundariesFromMids(mids: { mid: number }[]): number[] {
	const sorted = [...mids].sort((a, b) => a.mid - b.mid);
	const boundaries: number[] = [];
	for (let i = 0; i < sorted.length - 1; i++) {
		boundaries.push((sorted[i]!.mid + sorted[i + 1]!.mid) / 2);
	}
	return boundaries;
}

export function stabilizeVisualInsertAt(
	current: number,
	candidate: number,
	pos: number,
	boundaries: number[],
	band: number,
): number {
	if (current < 0 || current === candidate) return candidate;
	if (Math.abs(candidate - current) !== 1) return candidate;

	if (candidate > current) {
		const boundary = boundaries[current];
		if (boundary !== undefined && pos < boundary + band) return current;
	} else {
		const boundary = boundaries[candidate];
		if (boundary !== undefined && pos > boundary - band) return current;
	}
	return candidate;
}

export function stabilizeForeignInsertAt(
	current: number,
	candidate: number,
	pos: number,
	mids: readonly { mid: number }[],
	band: number,
): number {
	if (current < 0 || current === candidate) return candidate;
	if (Math.abs(candidate - current) !== 1) return candidate;
	if (mids.length === 0) return candidate;

	if (mids.length === 1) {
		const mid = mids[0]!.mid;
		const half = Math.max(24, band * 2);
		if (candidate > current && pos < mid + half) return current;
		if (candidate < current && pos > mid - half) return current;
		return candidate;
	}

	if (candidate > current) {
		const boundary = (mids[current]!.mid + mids[current + 1]!.mid) / 2;
		if (pos < boundary + band) return current;
	} else {
		const boundary = (mids[candidate]!.mid + mids[candidate + 1]!.mid) / 2;
		if (pos > boundary - band) return current;
	}
	return candidate;
}

export function midsFromLayoutEntries(
	entries: SortableLayoutEntry[],
): { key: string; mid: number; index: number }[] {
	return entries.map((entry) => ({
		key: entry.key,
		index: entry.index,
		mid: entry.start + entry.size / 2,
	}));
}

export function siblingShiftPx(
	preLift: SortableLayoutEntry[],
	postLift: SortableLayoutEntry[],
	dragFrom: number,
	insertAt: number,
	index: number,
): number {
	if (index === dragFrom) return 0;
	const post = postLift.find((entry) => entry.index === index);
	if (!post) return 0;
	const targets = virtualSlotStarts(preLift, dragFrom, insertAt);
	const targetStart = targets.get(index);
	if (targetStart === undefined) return 0;
	return targetStart - post.start;
}

export function placeholderRowShiftPx(
	preLift: SortableLayoutEntry[],
	postLift: SortableLayoutEntry[],
	dragFrom: number,
	insertAt: number,
	strategy: SortableStrategy,
): { x: number; y: number } {
	const post = postLift.find((entry) => entry.index === dragFrom);
	if (!post) return { x: 0, y: 0 };
	const targets = virtualSlotStarts(preLift, dragFrom, insertAt);
	const targetStart = targets.get(dragFrom);
	if (targetStart === undefined) return { x: 0, y: 0 };
	let shift = targetStart - post.start;
	if (insertAt === dragFrom) {
		for (const entry of postLift) {
			if (entry.index === dragFrom) continue;
			const siblingShift = siblingShiftPx(preLift, postLift, dragFrom, insertAt, entry.index);
			if (Math.abs(siblingShift) > Math.abs(shift)) shift = siblingShift;
		}
	}
	const horizontal = strategy === 'horizontal';
	return horizontal ? { x: shift, y: 0 } : { x: 0, y: shift };
}

/** Flex lists must use sibling translate shifts; row margin reflows following items. */
export function applyPlaceholderRowShift(
	row: HTMLElement,
	preLift: SortableLayoutEntry[],
	postLift: SortableLayoutEntry[],
	dragFrom: number,
	insertAt: number,
	strategy: SortableStrategy,
	options: { instant?: boolean } = {},
): void {
	const horizontal = strategy === 'horizontal';
	let shift: number;
	if (insertAt === dragFrom) {
		shift = horizontal
			? placeholderRowShiftPx(preLift, postLift, dragFrom, insertAt, strategy).x
			: placeholderRowShiftPx(preLift, postLift, dragFrom, insertAt, strategy).y;
	} else {
		const targets = virtualSlotStarts(preLift, dragFrom, insertAt);
		const targetStart = targets.get(dragFrom);
		if (targetStart === undefined) return;
		const rowRect = row.getBoundingClientRect();
		const postStart = horizontal ? rowRect.left : rowRect.top;
		shift = targetStart - postStart;
	}
	const x = horizontal ? shift : 0;
	const y = horizontal ? 0 : shift;
	if (horizontal) {
		const next = shift === 0 ? '' : `${x}px`;
		if (row.style.marginLeft === next && row.style.marginTop === '') return;
		if (options.instant) row.style.transition = 'none';
		row.style.marginTop = '';
		row.style.marginLeft = next;
		if (options.instant) {
			void row.offsetWidth;
			row.style.transition = '';
		}
		return;
	}
	const next = shift === 0 ? '' : `${y}px`;
	if (row.style.marginTop === next && row.style.marginLeft === '') return;
	if (options.instant) row.style.transition = 'none';
	row.style.marginLeft = '';
	row.style.marginTop = next;
	if (options.instant) {
		void row.offsetWidth;
		row.style.transition = '';
	}
}

export function clearPlaceholderRow(row: HTMLElement | null) {
	if (!row) return;
	// #region agent log
	const snap = sortableRowSnapshot(row);
	sortableStory('C', 'visual.ts:clearPlaceholderRow', 'placeholder row cleared', () => ({
		story: [
			'Removing virtual gap margin from placeholder row after drag.',
			snap?.marginLeft || snap?.marginTop
				? `Had marginLeft=${snap.marginLeft} marginTop=${snap.marginTop}.`
				: 'Row margins already empty.',
		].join(' '),
		data: { row: snap },
	}));
	// #endregion
	for (const animation of row.getAnimations()) animation.cancel();
	row.style.transition = 'none';
	row.style.marginLeft = '';
	row.style.marginTop = '';
	void row.offsetWidth;
	row.style.transition = '';
}
