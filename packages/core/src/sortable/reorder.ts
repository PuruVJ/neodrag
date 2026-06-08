import type { SortableMode } from './types.ts';

export function insertAtFromTargetIndex(from: number, targetIndex: number, len: number): number {
	if (from < 0 || len <= 0) return from;
	let target = targetIndex;
	if (target < 0) target = len - 1;
	if (from === target) {
		if (len === 2) return 1;
		return from;
	}
	return target > from ? target - 1 : target;
}

export function reorderForInsert<T>(
	items: readonly T[],
	from: number,
	to: number,
	mode: SortableMode = 'insert',
) {
	let { next, insertAt } = applySortableReorder(items, from, to, mode);
	if (mode === 'insert' && insertAt === from && to > from) {
		const retry = applySortableReorder(items, from, Math.min(to + 1, items.length), mode);
		if (retry.insertAt !== from) return retry;
	}
	if (mode === 'insert' && insertAt === from && to === from && items.length === 2) {
		const retry = applySortableReorder(items, from, items.length, mode);
		if (retry.insertAt !== from) return retry;
	}
	return { next, insertAt };
}

export function applySortableReorder<T>(
	items: readonly T[],
	from: number,
	to: number,
	mode: SortableMode = 'insert',
): { next: T[]; insertAt: number } {
	const copy = [...items];
	if (from < 0 || from >= copy.length) return { next: copy, insertAt: to };
	if (mode === 'swap') {
		if (to < 0 || to >= copy.length || from === to) return { next: copy, insertAt: to };
		const a = copy[from]!;
		copy[from] = copy[to]!;
		copy[to] = a;
		return { next: copy, insertAt: to };
	}
	let target = to;
	if (target < 0) target = copy.length - 1;
	if (from === target) return { next: copy, insertAt: target };
	const [item] = copy.splice(from, 1);
	if (!item) return { next: copy, insertAt: target };
	const insertAt = target > from ? target - 1 : target;
	copy.splice(insertAt, 0, item);
	return { next: copy, insertAt };
}

export function buildCommittedOrder<T>(
	snapshot: readonly T[],
	from: number,
	insertAt: number,
	mode: SortableMode,
): T[] {
	const copy = [...snapshot];
	if (from === insertAt) return copy;
	if (mode === 'swap') {
		const a = copy[from]!;
		copy[from] = copy[insertAt]!;
		copy[insertAt] = a;
		return copy;
	}
	const [item] = copy.splice(from, 1);
	copy.splice(insertAt, 0, item!);
	return copy;
}
