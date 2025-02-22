import { createDraggable, PluginResolver } from '@neodrag/core';
import type { Plugin } from '@neodrag/core/plugins';

const core = createDraggable();

export class Wrapper {
	#drag_instance: ReturnType<ReturnType<typeof createDraggable>['draggable']>;
	#plugins: Plugin[] | PluginResolver = [];

	get plugins() {
		return this.#plugins;
	}

	constructor(
		factory: ReturnType<typeof createDraggable>,
		node: HTMLElement,
		plugins: Plugin[] | PluginResolver = [],
	) {
		this.#drag_instance = factory.draggable(node, (this.#plugins = plugins));
	}

	destroy() {
		this.#drag_instance.destroy();
	}
}

export class Draggable extends Wrapper {
	constructor(node: HTMLElement, plugins: Plugin[] | PluginResolver = []) {
		super(core, node, plugins);
	}
}

export { Compartment } from '@neodrag/core';
export * from '@neodrag/core/plugins';
export const instances = core.instances;
