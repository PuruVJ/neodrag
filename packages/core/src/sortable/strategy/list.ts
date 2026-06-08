import type { MeasuredRect, SortingStrategy, StrategyContext, Transform } from './types.ts';

function gapBetween(rects: readonly MeasuredRect[], axis: 'x' | 'y'): number {
	const sorted = [...rects].sort((a, b) => (axis === 'x' ? a.left - b.left : a.top - b.top));
	let total = 0;
	let count = 0;
	for (let i = 0; i < sorted.length - 1; i++) {
		const a = sorted[i]!;
		const b = sorted[i + 1]!;
		const gap =
			axis === 'x' ? b.left - a.right : b.top - (a.top + a.height);
		if (gap >= 0) {
			total += gap;
			count++;
		}
	}
	return count > 0 ? total / count : 0;
}

export function listSortingStrategy(axis: 'x' | 'y'): SortingStrategy {
	return (ctx: StrategyContext): Transform | null => {
		const { rects, activeIndex, overIndex, index } = ctx;
		if (activeIndex < 0 || overIndex < 0 || index < 0) return null;
		if (activeIndex === overIndex) return { x: 0, y: 0 };

		const active = rects[activeIndex];
		const over = rects[overIndex];
		const current = rects[index];
		if (!active || !over || !current) return null;

		const gap = gapBetween(rects, axis);

		if (index === activeIndex) {
			if (axis === 'x') {
				const x =
					activeIndex < overIndex
						? over.left + over.width - active.left
						: over.left - active.left;
				return { x, y: 0 };
			}
			const y =
				activeIndex < overIndex
					? over.top + over.height - active.top
					: over.top - active.top;
			return { x: 0, y };
		}

		if (axis === 'x') {
			if (index > activeIndex && index <= overIndex) {
				return { x: -(active.width + gap), y: 0 };
			}
			if (index < activeIndex && index >= overIndex) {
				return { x: active.width + gap, y: 0 };
			}
			return null;
		}

		if (index > activeIndex && index <= overIndex) {
			return { x: 0, y: -(active.height + gap) };
		}
		if (index < activeIndex && index >= overIndex) {
			return { x: 0, y: active.height + gap };
		}
		return null;
	};
}

export const horizontalListSortingStrategy = listSortingStrategy('x');
export const verticalListSortingStrategy = listSortingStrategy('y');
