import type { MeasuredRect, SortingStrategy, Transform } from './types.ts';

function rectCenter(rect: MeasuredRect): { x: number; y: number } {
	return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function distance(a: MeasuredRect, b: MeasuredRect): number {
	const ca = rectCenter(a);
	const cb = rectCenter(b);
	const dx = ca.x - cb.x;
	const dy = ca.y - cb.y;
	return dx * dx + dy * dy;
}

export const rectSortingStrategy: SortingStrategy = (ctx) => {
	const { rects, activeIndex, overIndex, index } = ctx;
	if (activeIndex < 0 || overIndex < 0 || index < 0) return null;
	if (activeIndex === overIndex) return { x: 0, y: 0 };

	const active = rects[activeIndex];
	const over = rects[overIndex];
	const current = rects[index];
	if (!active || !over || !current) return null;

	if (index === activeIndex) {
		return {
			x: over.left - active.left,
			y: over.top - active.top,
		};
	}

	const activeCenter = rectCenter(active);
	const overCenter = rectCenter(over);
	const currentCenter = rectCenter(current);

	const activeRow = active.top;
	const overRow = over.top;
	const activeCol = active.left;
	const overCol = over.left;

	const sameRow = Math.abs(activeRow - overRow) < 1;
	const sameCol = Math.abs(activeCol - overCol) < 1;

	if (sameRow && activeIndex < overIndex && index > activeIndex && index <= overIndex) {
		return { x: -(active.width + (rects[activeIndex + 1]?.left ?? over.left) - active.right), y: 0 };
	}
	if (sameRow && activeIndex > overIndex && index < activeIndex && index >= overIndex) {
		return { x: active.width + (over.right - over.left), y: 0 };
	}
	if (sameCol && activeIndex < overIndex && index > activeIndex && index <= overIndex) {
		return { x: 0, y: -(active.height + (over.top - active.bottom)) };
	}
	if (sameCol && activeIndex > overIndex && index < activeIndex && index >= overIndex) {
		return { x: 0, y: active.height + (over.top - active.bottom) };
	}

	const towardOver = {
		x: overCenter.x - activeCenter.x,
		y: overCenter.y - activeCenter.y,
	};
	const fromCurrent = {
		x: over.left - current.left,
		y: over.top - current.top,
	};

	if (index !== activeIndex && index !== overIndex) {
		const dActive = distance(current, active);
		const dOver = distance(current, over);
		if (dOver < dActive) {
			return {
				x: fromCurrent.x * 0.5,
				y: fromCurrent.y * 0.5,
			};
		}
	}

	void towardOver;
	return null;
};
