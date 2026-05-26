import { ControlFrom, controls } from './plugins.ts';
import type { DragPlugin } from './types.ts';
import type { DragThresholdOptions } from './threshold.ts';

export function presetDockHandle(): DragPlugin[] {
	return [controls({ allow: ControlFrom.selector('.handle') })];
}

export function presetListItem(options?: {
	handle?: string;
	distance?: number;
}): { plugins: DragPlugin[]; threshold: DragThresholdOptions } {
	const plugins: DragPlugin[] = [];
	if (options?.handle) {
		plugins.push(controls({ allow: ControlFrom.selector(options.handle) }));
	}
	return {
		plugins,
		threshold: { distance: options?.distance ?? 4 },
	};
}

export function presetKanbanCard(options?: { handle?: string }): {
	plugins: DragPlugin[];
	threshold: DragThresholdOptions;
} {
	const handle = options?.handle ?? '.card-handle';
	return {
		plugins: [controls({ allow: ControlFrom.selector(handle) })],
		threshold: { distance: 6 },
	};
}
