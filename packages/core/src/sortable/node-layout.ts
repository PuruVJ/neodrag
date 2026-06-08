import { sortableRegistry } from './context.ts';
import { invalidateMidsCache } from './mids.ts';
import { resetSortableChipDragStyles } from './visual.ts';

export class SortableNodeLayout {
	invalidateForNode(node: HTMLElement | SVGElement): void {
		const ctx = sortableRegistry.findContextForNode(node);
		if (ctx) invalidateMidsCache(ctx);
	}

	clearVisualTransformsForNode(node: HTMLElement): void {
		const ctx = sortableRegistry.findContextForNode(node);
		if (!ctx) return;
		for (const el of ctx.nodesByKey.values()) {
			if (el instanceof HTMLElement) resetSortableChipDragStyles(el);
		}
	}
}

export const sortableNodeLayout = new SortableNodeLayout();

export function invalidateSortableLayoutForNode(node: HTMLElement | SVGElement): void {
	sortableNodeLayout.invalidateForNode(node);
}

export function clearSortableVisualTransformsForNode(node: HTMLElement): void {
	sortableNodeLayout.clearVisualTransformsForNode(node);
}
