import { createDraggable } from '@neodrag/core';
import type { PluginInput } from '@neodrag/core/plugins';

const core = createDraggable();

export class Wrapper {
	#drag_instance: ReturnType<ReturnType<typeof createDraggable>['draggable']>;
	#plugins: PluginInput = [];

	get plugins() {
		return this.#plugins;
	}

	constructor(
		factory: ReturnType<typeof createDraggable>,
		node: HTMLElement,
		plugins: PluginInput = [],
	) {
		this.#drag_instance = factory.draggable(node, (this.#plugins = plugins));
	}

	destroy() {
		this.#drag_instance.destroy();
	}
}

export class Draggable extends Wrapper {
	constructor(node: HTMLElement, plugins: PluginInput = []) {
		super(core, node, plugins);
	}
}

export * from '@neodrag/core/plugins';
export const instances = core.instances;
