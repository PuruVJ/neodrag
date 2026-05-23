import {
	Neodrag,
	type DragPlugin,
	type DragPluginInput,
	type DropPlugin,
	type DropPluginInput,
	type EngineOptions,
} from '@neodrag/core/interactions';

export type { EngineOptions, DragPlugin, DropPlugin, DragPluginInput, DropPluginInput };

export class Draggable {
	readonly node: HTMLElement | SVGElement;
	readonly #handle: import('@neodrag/core/interactions').DragHandle;

	constructor(
		node: HTMLElement | SVGElement,
		plugins: DragPluginInput = [],
		engine: Neodrag = Neodrag.shared,
	) {
		this.node = node;
		this.#handle = engine.draggable(node, plugins);
	}

	update(plugins: DragPlugin[] | (() => DragPlugin[])) {
		this.#handle.update(plugins);
	}

	destroy() {
		this.#handle.destroy();
	}
}

export class Droppable {
	readonly node: HTMLElement | SVGElement;
	readonly #handle: import('@neodrag/core/interactions').DropHandle;

	constructor(
		node: HTMLElement | SVGElement,
		plugins: DropPluginInput = [],
		engine: Neodrag = Neodrag.shared,
	) {
		this.node = node;
		this.#handle = engine.droppable(node, plugins);
	}

	destroy() {
		this.#handle.destroy();
	}
}

export {
	Neodrag,
	DragHandle,
	DropHandle,
	defineDragPlugin,
	defineDropPlugin,
	DragPluginBase,
	DropPluginBase,
	DEFAULT_DRAG_PLUGINS,
	transform,
	threshold,
	position,
	bounds,
	grid,
	axis,
	events,
	disabled,
	controls,
	dragData,
	accepts,
	highlight,
	onDrop,
	sortable,
} from '@neodrag/core/interactions';
