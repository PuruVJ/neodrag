import { Neodrag, type EngineOptions, type DropPluginInput } from '@neodrag/core';
import { Attachment } from 'svelte/attachments';

export type NeodragDropOptions = EngineOptions;

export { Neodrag };

export class Droppable {
	readonly #engine: Neodrag;
	readonly #plugins: DropPluginInput;
	#handle?: import('@neodrag/core').DropHandle;

	constructor(engine: Neodrag = Neodrag.shared, plugins: DropPluginInput = []) {
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

export function droppable(plugins?: DropPluginInput): Attachment<HTMLElement | SVGElement> {
	return new Droppable(Neodrag.shared, plugins ?? []).attachment();
}

export * from '@neodrag/core/drop/plugins';
export { sortable, type SortableOptions, type SortableStrategy } from '@neodrag/core/drop';
export { sortableItemFor } from './sortable.svelte';
