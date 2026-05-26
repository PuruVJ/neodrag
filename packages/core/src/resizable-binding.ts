import { Neodrag } from './engine.ts';
import { PluginBinding } from './plugin-binding.ts';
import type { ResizeApplier } from './apply-resize.ts';
import type { ResizePlugin, ResizePluginList } from './resize/types.ts';

export type { ResizeApplier };

export interface ResizableOptions {
	engine?: Neodrag;
	plugins: ResizePluginList;
	applyResize?: ResizeApplier;
}

export class Resizable extends PluginBinding<ResizePlugin> {
	constructor(options: ResizableOptions) {
		super({
			engine: options.engine,
			plugins: options.plugins,
			attachIdempotency: 'node-and-handle',
			register: (engine, node, resolved) =>
				engine.resizable(node, resolved, { applyResize: options.applyResize }),
		});
	}
}
