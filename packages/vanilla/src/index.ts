import { DraggableFactory } from '@neodrag/core';
import type { PluginInput } from '@neodrag/core/plugins';

const core = new DraggableFactory();

export class Wrapper {
	#destroy: () => void;

	constructor(factory: DraggableFactory, node: HTMLElement, plugins: PluginInput = []) {
		this.#destroy = factory.draggable(node, plugins);
	}

	destroy() {
		this.#destroy();
	}
}

export class Draggable extends Wrapper {
	constructor(node: HTMLElement, plugins: PluginInput = []) {
		super(core, node, plugins);
	}
}

export * from '@neodrag/core/plugins';
export const instances = core.instances;
