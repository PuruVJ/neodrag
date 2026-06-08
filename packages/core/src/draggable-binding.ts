import { ensureDraggableEngineExtensions } from './draggable/engine-extensions.ts';
import { DragNeodrag } from './engine/drag-neodrag.ts';
import {
	appendDragCallbackSlots,
	type DragCallbackHandlers,
	type DragEventData,
} from './drag-callbacks.ts';
import { TargetBinding } from './target-binding.ts';
import type { TransformApplier } from './apply-transform.ts';
import type { LengthAdapter } from './length-runtime.ts';
import type { MarkupAdapter } from './markup-adapter.ts';
import type { DragPlugin, DragPluginList, PluginSlot } from './types.ts';
import type { DragThresholdInput } from './threshold.ts';

export type { DragEventData } from './drag-callbacks.ts';
export type { DragThresholdInput, DragThresholdOptions } from './threshold.ts';
export type { TransformApplier };

export interface DraggableOptions extends DragCallbackHandlers {
	engine?: DragNeodrag;
	plugins: DragPluginList;
	threshold?: DragThresholdInput;
	applyTransform?: TransformApplier;
	length?: LengthAdapter;
	markup?: MarkupAdapter;
}

export class Draggable extends TargetBinding<DragPlugin> {
	readonly #callbacks: DragCallbackHandlers;

	constructor(options: DraggableOptions) {
		if (options.plugins.length > 0) ensureDraggableEngineExtensions();
		const { onDragStart, onDrag, onDragEnd, plugins, ...rest } = options;
		const callbacks = { onDragStart, onDrag, onDragEnd };
		const threshold = options.threshold;
		super({
			engine: rest.engine,
			length: rest.length,
			markup: rest.markup,
			plugins: appendDragCallbackSlots(plugins, callbacks),
			sharedEngine: () => DragNeodrag.shared,
			register: (engine, node, resolved, ctx) =>
				engine.draggable(node, resolved, {
					applyTransform: rest.applyTransform,
					length: ctx.length,
					threshold,
					markup: ctx.markup,
				}),
		});
		this.#callbacks = callbacks;
	}

	override update(slots?: readonly PluginSlot<DragPlugin>[]) {
		super.update(slots ? appendDragCallbackSlots(slots, this.#callbacks) : undefined);
	}
}
