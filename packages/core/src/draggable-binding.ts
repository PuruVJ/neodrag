import { Neodrag } from './engine.ts';
import { PluginBinding } from './plugin-binding.ts';
import type { TransformApplier } from './apply-transform.ts';
import type { LengthAdapter } from './length-runtime.ts';
import type { DragPlugin, DragPluginList, DropPlugin, DropPluginList } from './types.ts';
import type { DragThresholdInput } from './threshold.ts';

export type { DragThresholdInput, DragThresholdOptions } from './threshold.ts';
export type { TransformApplier };

export interface DraggableOptions {
	engine?: Neodrag;
	plugins: DragPluginList;
	threshold?: DragThresholdInput;
	applyTransform?: TransformApplier;
	length?: LengthAdapter;
}

export class Draggable extends PluginBinding<DragPlugin> {
	constructor(options: DraggableOptions) {
		const threshold = options.threshold;
		super({
			engine: options.engine,
			length: options.length,
			plugins: options.plugins,
			attachIdempotency: 'node-and-handle',
			register: (engine, node, resolved, binding) =>
				engine.draggable(node, resolved, {
					applyTransform: options.applyTransform,
					length: binding.length,
					threshold,
				}),
		});
	}
}

export class DroppableBinding extends PluginBinding<DropPlugin> {
	constructor(options: { engine?: Neodrag; plugins: DropPluginList; length?: LengthAdapter }) {
		super({
			engine: options.engine,
			length: options.length,
			plugins: options.plugins,
			register: (engine, node, resolved, binding) =>
				engine.droppable(node, resolved, { length: binding.length }),
		});
	}
}
