import {
	placeholderRowShiftPx,
	siblingShiftPx,
	type SortableLayoutEntry,
} from '../visual/layout.ts';
import type { Transform } from './types.ts';

export function displacementFromVirtualSlots(
	preLayout: readonly SortableLayoutEntry[],
	currentLayout: readonly SortableLayoutEntry[],
	dragFrom: number,
	insertAt: number,
	index: number,
	strategy: 'horizontal' | 'vertical',
): Transform {
	const horizontal = strategy === 'horizontal';
	if (index === dragFrom) {
		const { x, y } = placeholderRowShiftPx(
			[...preLayout],
			[...currentLayout],
			dragFrom,
			insertAt,
			strategy,
		);
		return { x, y };
	}
	const shift = siblingShiftPx(
		[...preLayout],
		[...currentLayout],
		dragFrom,
		insertAt,
		index,
	);
	return horizontal ? { x: shift, y: 0 } : { x: 0, y: shift };
}

export function displacementsForLayout(
	preLayout: readonly SortableLayoutEntry[],
	currentLayout: readonly SortableLayoutEntry[],
	dragFrom: number,
	insertAt: number,
	strategy: 'horizontal' | 'vertical',
): Map<number, Transform> {
	const out = new Map<number, Transform>();
	for (const entry of currentLayout) {
		out.set(
			entry.index,
			displacementFromVirtualSlots(
				preLayout,
				currentLayout,
				dragFrom,
				insertAt,
				entry.index,
				strategy,
			),
		);
	}
	return out;
}
