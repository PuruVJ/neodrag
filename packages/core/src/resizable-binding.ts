import { Neodrag } from './engine.ts';
import { PluginBinding } from './plugin-binding.ts';
import type { ResizeApplier } from './apply-resize.ts';
import type { LengthAdapter } from './length-runtime.ts';
import {
	composeResizePluginList,
	type ResizeSizeBoundsInput,
} from './resize-bounds.ts';
import type { ResizePlugin, ResizePluginList } from './resize/types.ts';

export type { ResizeApplier };
export type {
	ResizeDimensions,
	ResizeSizeBoundsInput,
	ResizeSizeInput,
	ResolvedResizeSizeBounds,
} from './resize-bounds.ts';
export { composeResizePluginList, resolveResizeSizeBounds } from './resize-bounds.ts';

export interface ResizableOptions extends ResizeSizeBoundsInput {
	engine?: Neodrag;
	plugins: ResizePluginList;
	applyResize?: ResizeApplier;
	length?: LengthAdapter;
}

export class Resizable extends PluginBinding<ResizePlugin> {
	constructor(options: ResizableOptions) {
		const { engine, plugins, applyResize, length, minSize, maxSize, parent, ...rest } =
			options;
		if (Object.keys(rest).length > 0) {
			throw new Error(`Unknown Resizable option(s): ${Object.keys(rest).join(', ')}`);
		}

		super({
			engine,
			length,
			plugins: composeResizePluginList(plugins, { minSize, maxSize, parent }),
			attachIdempotency: 'node-and-handle',
			register: (engine, node, resolved, binding) =>
				engine.resizable(node, resolved, {
					applyResize,
					length: binding.length,
				}),
		});
	}
}
