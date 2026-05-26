import { resizeAxis, resizeHandles, sizeBounds } from './plugins.ts';
import type { ResizePlugin } from './types.ts';

export function presetPanel(): ResizePlugin[] {
	return [resizeHandles({ edges: ['e', 'w'] }), sizeBounds({ minWidth: 80 })];
}

export function presetCornerBox(): ResizePlugin[] {
	return [resizeHandles({ edges: 'all' }), sizeBounds({ minWidth: 40, minHeight: 40 })];
}

export function presetSplitPane(axis: 'x' | 'y'): ResizePlugin[] {
	const edges = axis === 'x' ? (['e'] as const) : (['s'] as const);
	return [
		resizeHandles({ edges: [...edges], size: 6 }),
		resizeAxis(axis),
		sizeBounds({ minWidth: 40, minHeight: 40 }),
	];
}
