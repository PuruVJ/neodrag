import { Neodrag, type EngineOptions, type DragPluginInput } from '@neodrag/core';

export type NeodragOptions = EngineOptions;

export { Neodrag };

export class Draggable {
	readonly node: HTMLElement | SVGElement;
	readonly #handle: import('@neodrag/core').DragHandle;

	constructor(
		node: HTMLElement | SVGElement,
		plugins: DragPluginInput = [],
		engine: Neodrag = Neodrag.shared,
	) {
		this.node = node;
		this.#handle = engine.draggable(node, plugins);
	}

	update(plugins: DragPluginInput) {
		this.#handle.update(plugins);
	}

	destroy() {
		this.#handle.destroy();
	}
}

export class Droppable {
	readonly node: HTMLElement | SVGElement;
	readonly #handle: import('@neodrag/core').DropHandle;

	constructor(
		node: HTMLElement | SVGElement,
		plugins: import('@neodrag/core').DropPluginInput = [],
		engine: Neodrag = Neodrag.shared,
	) {
		this.node = node;
		this.#handle = engine.droppable(node, plugins);
	}

	destroy() {
		this.#handle.destroy();
	}
}

export * from '@neodrag/core/plugins';
