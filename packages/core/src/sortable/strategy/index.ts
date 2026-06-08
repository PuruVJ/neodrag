export type {
	MeasuredRect,
	SortableAxis,
	SortablePreset,
	SortableStrategyInput,
	SortingStrategy,
	StrategyContext,
	Transform,
} from './types.ts';
export { layoutEntryToRect, rectsFromLayout } from './types.ts';
export {
	horizontalListSortingStrategy,
	verticalListSortingStrategy,
	listSortingStrategy,
} from './list.ts';
export { rectSortingStrategy } from './grid.ts';
export {
	axisForPreset,
	isSortingStrategy,
	listAxisForPreset,
	resolvePreset,
	resolveSortingStrategy,
	resolveStrategyInput,
	strategyForPreset,
} from './resolve.ts';
export { displacementFromVirtualSlots, displacementsForLayout } from './virtual-shift.ts';

import { horizontalListSortingStrategy } from './list.ts';
import { rectSortingStrategy } from './grid.ts';
import { verticalListSortingStrategy } from './list.ts';

export const presets = {
	strategy: {
		horizontal: horizontalListSortingStrategy,
		vertical: verticalListSortingStrategy,
		grid: rectSortingStrategy,
	},
};
