import type { ResizeInstance } from '../resize-instance.ts';
import type { DragInstance } from '../instance.ts';
import type { ResizePlugin } from '../resize/types.ts';
import type { DragPlugin, DropPlugin, EndReason, ErrorInfo } from '../types.ts';
import type { InteractionInput } from '../interaction-input.ts';
import type { ResizeEndReason } from '../resize/types.ts';
import { DragEngine, type DragEngineBindings } from './drag-engine.ts';
import { DropInteraction } from './drop-interaction.ts';
import { createResizeInteraction } from './resize-slot.ts';
import type {
	ResizeInteraction,
	ResizeInteractionDeps,
} from './resize-interaction.ts';

export type FullEngineBindings = DragEngineBindings & {
	defaultDropPlugins: () => DropPlugin[];
	defaultResizePlugins: () => ResizePlugin[];
	getActiveResizeSource: () => ResizeInstance | null;
	finishResize: (reason: ResizeEndReason, input: InteractionInput) => void;
};

export class FullEngine extends DragEngine {
	readonly drop: DropInteraction;
	readonly #resizeDeps: ResizeInteractionDeps;
	#resize: ResizeInteraction | null = null;

	constructor(bindings: FullEngineBindings) {
		super(bindings);

		this.drop = new DropInteraction({
			engine: bindings.engine,
			plugins: this.plugins,
			extensions: this.extensions,
			dev: bindings.dev,
			defaultPlugins: bindings.defaultDropPlugins,
		});

		this.#resizeDeps = {
			engine: bindings.engine,
			plugins: this.plugins,
			extensions: this.extensions,
			dev: bindings.dev,
			defaultPlugins: bindings.defaultResizePlugins,
			endActiveInteraction: bindings.endActiveInteraction,
			getActiveResizeSource: bindings.getActiveResizeSource,
			finishResize: bindings.finishResize,
		};
	}

	get resize(): ResizeInteraction {
		if (!this.#resize) {
			this.#resize = createResizeInteraction(this.#resizeDeps);
		}
		return this.#resize;
	}
}

export type EngineBindings = FullEngineBindings;
export const Engine = FullEngine;
