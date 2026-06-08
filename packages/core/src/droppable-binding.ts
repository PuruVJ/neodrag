import { Neodrag } from './engine/neodrag.ts';
import { TargetBinding } from './target-binding.ts';
import type { LengthAdapter } from './length-runtime.ts';
import type { MarkupAdapter } from './markup-adapter.ts';
import type { DropPlugin, DropPluginList } from './types.ts';

export interface DroppableOptions {
	engine?: Neodrag;
	plugins: DropPluginList;
	length?: LengthAdapter;
	markup?: MarkupAdapter;
}

export class Droppable extends TargetBinding<DropPlugin> {
	constructor(options: DroppableOptions) {
		super({
			engine: options.engine,
			length: options.length,
			markup: options.markup,
			plugins: options.plugins,
			sharedEngine: () => Neodrag.shared,
			register: (engine, node, resolved, ctx) =>
				engine.droppable(node, resolved, {
					length: ctx.length,
					markup: ctx.markup,
				}),
		});
	}
}
