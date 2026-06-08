import {
	ControlFrom,
	accepts,
	collisionPriority,
	controls,
	dropHitExpand,
	ghost,
	highlight,
	onDrop,
} from '../plugins.ts';
import type { DragPlugin, DropPlugin } from '../types.ts';
import type { DragThresholdOptions } from '../threshold.ts';

export function presetDockHandle(): DragPlugin[] {
	return [controls({ allow: ControlFrom.selector('.handle') })];
}

export function presetListItem(options?: { handle?: string; distance?: number }): {
	plugins: DragPlugin[];
	threshold: DragThresholdOptions;
} {
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

export function presetLiftedDrag(): DragPlugin[] {
	return [ghost({ opacity: 1 })];
}

export function presetSlotDrop<T>(options: {
	accept: (data: T) => boolean;
	onDrop: (data: T) => void;
	overClass?: string;
	priority?: number;
	expand?: {
		top?: import('../length-runtime.ts').SizeInput;
		left?: import('../length-runtime.ts').SizeInput;
		right?: import('../length-runtime.ts').SizeInput;
		bottom?: import('../length-runtime.ts').SizeInput;
	};
}): DropPlugin[] {
	const plugins: DropPlugin[] = [
		collisionPriority(options.priority ?? 10),
		highlight({ overClass: options.overClass ?? 'drop-over' }),
	];
	if (options.expand) plugins.push(dropHitExpand(options.expand));
	plugins.push(accepts(options.accept), onDrop(options.onDrop));
	return plugins;
}
