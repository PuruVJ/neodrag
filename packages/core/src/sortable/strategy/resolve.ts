import type { SortableOptions } from '../types.ts';
import type { SortablePreset, SortableStrategyInput, SortingStrategy } from './types.ts';
import { rectSortingStrategy } from './grid.ts';
import { horizontalListSortingStrategy, verticalListSortingStrategy } from './list.ts';

export function isSortingStrategy(input: SortableStrategyInput): input is SortingStrategy {
	return typeof input === 'function';
}

export function resolveStrategyInput(
	strategy: SortableOptions<unknown>['strategy'],
): SortableStrategyInput {
	if (typeof strategy === 'function') return strategy();
	return strategy ?? 'vertical';
}

export function resolvePreset(input: SortableStrategyInput): SortablePreset | null {
	if (isSortingStrategy(input)) return null;
	return input;
}

export function strategyForPreset(preset: SortablePreset): SortingStrategy {
	switch (preset) {
		case 'horizontal':
			return horizontalListSortingStrategy;
		case 'vertical':
			return verticalListSortingStrategy;
		case 'grid':
			return rectSortingStrategy;
	}
}

export function resolveSortingStrategy(
	input: SortableStrategyInput,
): SortingStrategy {
	if (isSortingStrategy(input)) return input;
	return strategyForPreset(input);
}

export function axisForPreset(preset: SortablePreset): 'x' | 'y' | 'xy' {
	switch (preset) {
		case 'horizontal':
			return 'x';
		case 'vertical':
			return 'y';
		case 'grid':
			return 'xy';
	}
}

export function listAxisForPreset(
	preset: SortablePreset,
): 'horizontal' | 'vertical' | null {
	if (preset === 'horizontal') return 'horizontal';
	if (preset === 'vertical') return 'vertical';
	return null;
}
