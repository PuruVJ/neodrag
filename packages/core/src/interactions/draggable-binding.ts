import { Neodrag } from './engine.ts';
import { PluginBinding } from './plugin-binding.ts';
import type { TransformApplier } from './apply-transform.ts';
import type { DragPlugin, DragPluginList, DropPlugin, DropPluginList } from './types.ts';

export type { TransformApplier };

export interface DraggableOptions {
	engine?: Neodrag;
	plugins: DragPluginList;
	applyTransform?: TransformApplier;
}

export class Draggable extends PluginBinding<DragPlugin> {
	constructor(options: DraggableOptions) {
		super({
			engine: options.engine,
			plugins: options.plugins,
			attachIdempotency: 'node-and-handle',
			register: (engine, node, resolved) =>
				engine.draggable(node, resolved, { applyTransform: options.applyTransform }),
		});
	}
}

export class DroppableBinding extends PluginBinding<DropPlugin> {
	constructor(options: { engine?: Neodrag; plugins: DropPluginList }) {
		super({
			engine: options.engine,
			plugins: options.plugins,
			register: (engine, node, resolved) => engine.droppable(node, resolved),
		});
	}
}
