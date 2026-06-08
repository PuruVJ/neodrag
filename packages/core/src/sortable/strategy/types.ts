import type { SortableLayoutEntry } from '../visual/layout.ts';

export type SortableAxis = 'x' | 'y' | 'xy';

export interface MeasuredRect {
	left: number;
	top: number;
	width: number;
	height: number;
	right: number;
	bottom: number;
}

export interface Transform {
	x: number;
	y: number;
	scaleX?: number;
	scaleY?: number;
}

export interface StrategyContext {
	rects: readonly MeasuredRect[];
	activeIndex: number;
	overIndex: number;
	insertAt: number;
	index: number;
	axis: SortableAxis;
}

export type SortingStrategy = (ctx: StrategyContext) => Transform | null;

export type SortablePreset = 'vertical' | 'horizontal' | 'grid';

export type SortableStrategyInput = SortablePreset | SortingStrategy;

export function layoutEntryToRect(
	entry: SortableLayoutEntry,
	axis: 'horizontal' | 'vertical',
	crossSpan = 37,
): MeasuredRect {
	if (axis === 'horizontal') {
		return {
			left: entry.start,
			top: 0,
			width: entry.size,
			height: crossSpan,
			right: entry.end,
			bottom: crossSpan,
		};
	}
	return {
		left: 0,
		top: entry.start,
		width: crossSpan,
		height: entry.size,
		right: crossSpan,
		bottom: entry.end,
	};
}

export function rectsFromLayout(
	entries: readonly SortableLayoutEntry[],
	axis: 'horizontal' | 'vertical',
): MeasuredRect[] {
	return entries.map((entry) => layoutEntryToRect(entry, axis));
}
