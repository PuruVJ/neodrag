import { ControlFrom, controls, threshold } from './plugins.ts';
import type { DragPlugin } from './types.ts';

export function presetDockHandle(): DragPlugin[] {
	return [controls({ allow: ControlFrom.selector('.handle') })];
}

export function presetListItem(options?: { handle?: string; distance?: number }): DragPlugin[] {
	const plugins: DragPlugin[] = [threshold({ distance: options?.distance ?? 4 })];
	if (options?.handle) {
		plugins.unshift(controls({ allow: ControlFrom.selector(options.handle) }));
	}
	return plugins;
}

export function presetKanbanCard(options?: { handle?: string }): DragPlugin[] {
	const handle = options?.handle ?? '.card-handle';
	return [
		controls({ allow: ControlFrom.selector(handle) }),
		threshold({ distance: 6 }),
	];
}
