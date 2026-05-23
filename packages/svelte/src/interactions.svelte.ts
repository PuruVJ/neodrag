import {
	InteractionEngine,
	type DragPlugin,
	type DragPluginInput,
	type DropPlugin,
	type DropPluginInput,
	type EngineOptions,
} from '@neodrag/core/interactions';
import { Attachment } from 'svelte/attachments';

export type { EngineOptions, DragPlugin, DropPlugin, DragPluginInput, DropPluginInput };

export class Engine extends InteractionEngine {
	static readonly shared = new Engine({ dev: false });
}

export class Draggable {
	readonly #engine: Engine;
	readonly #plugins: DragPluginInput;
	#handle?: import('@neodrag/core/interactions').DragHandle;

	constructor(engine: Engine = Engine.shared, plugins: DragPluginInput = []) {
		this.#engine = engine;
		this.#plugins = plugins;
	}

	attach(element: HTMLElement | SVGElement) {
		this.detach();
		this.#handle = this.#engine.draggable(element, this.#plugins);
		return () => this.detach();
	}

	attachment(): Attachment<HTMLElement | SVGElement> {
		return (element) => this.attach(element);
	}

	update(plugins: DragPlugin[] | (() => DragPlugin[])) {
		this.#handle?.update(plugins);
	}

	detach() {
		this.#handle?.destroy();
		this.#handle = undefined;
	}
}

export class Droppable {
	readonly #engine: Engine;
	readonly #plugins: DropPluginInput;
	#handle?: import('@neodrag/core/interactions').DropHandle;

	constructor(engine: Engine = Engine.shared, plugins: DropPluginInput = []) {
		this.#engine = engine;
		this.#plugins = plugins;
	}

	attach(element: HTMLElement | SVGElement) {
		this.detach();
		this.#handle = this.#engine.droppable(element, this.#plugins);
		return () => this.detach();
	}

	attachment(): Attachment<HTMLElement | SVGElement> {
		return (element) => this.attach(element);
	}

	detach() {
		this.#handle?.destroy();
		this.#handle = undefined;
	}
}

export function draggable(plugins?: DragPluginInput): Attachment<HTMLElement | SVGElement> {
	return new Draggable(Engine.shared, plugins ?? []).attachment();
}

export function droppable(plugins?: DropPluginInput): Attachment<HTMLElement | SVGElement> {
	return new Droppable(Engine.shared, plugins ?? []).attachment();
}

export {
	Neodrag,
	DragHandle,
	DropHandle,
	createEngine,
	defineDragPlugin,
	defineDropPlugin,
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
