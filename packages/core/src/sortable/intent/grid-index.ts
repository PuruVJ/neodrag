import type { MeasuredRect } from '../strategy/types.ts';
import type { SortableCollision } from '../types.ts';

function rectCenter(rect: MeasuredRect): { x: number; y: number } {
	return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function pointerWithin(rect: MeasuredRect, x: number, y: number): boolean {
	return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

export function computeGridOverIndex(
	rects: readonly MeasuredRect[],
	pointerX: number,
	pointerY: number,
	collision: SortableCollision = 'closestCenter',
): number {
	if (rects.length === 0) return 0;

	if (collision === 'pointerWithin') {
		for (let i = 0; i < rects.length; i++) {
			if (pointerWithin(rects[i]!, pointerX, pointerY)) return i;
		}
	}

	let best = 0;
	let bestDist = Infinity;
	for (let i = 0; i < rects.length; i++) {
		const c = rectCenter(rects[i]!);
		const dx = pointerX - c.x;
		const dy = pointerY - c.y;
		const dist = dx * dx + dy * dy;
		if (dist < bestDist) {
			bestDist = dist;
			best = i;
		}
	}
	return best;
}
