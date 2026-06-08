import { Neodrag } from './engine/neodrag.ts';
import { TargetBinding } from './target-binding.ts';
import type { ResizeApplier } from './apply-resize.ts';
import type { LengthAdapter } from './length-runtime.ts';
import type { MarkupAdapter } from './markup-adapter.ts';
import { composeResizePluginList, type ResizeSizeBoundsInput } from './resize-bounds.ts';
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
	markup?: MarkupAdapter;
}

export class Resizable extends TargetBinding<ResizePlugin> {
	constructor(options: ResizableOptions) {
		const { engine, plugins, applyResize, length, markup, minSize, maxSize, parent, ...rest } =
			options;
		if (Object.keys(rest).length > 0) {
			throw new Error(`Unknown Resizable option(s): ${Object.keys(rest).join(', ')}`);
		}

		super({
			engine,
			length,
			markup,
			plugins: composeResizePluginList(plugins, { minSize, maxSize, parent }),
			sharedEngine: () => Neodrag.shared,
			register: (engine, node, resolved, ctx) =>
				engine.resizable(node, resolved, {
					applyResize,
					length: ctx.length,
				}),
		});
	}
}
