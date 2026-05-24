import { Neodrag, type DropPluginInput, type EngineOptions } from '@neodrag/core';
import { Attachment } from 'svelte/attachments';

export type NeodragDropOptions = EngineOptions;
export type ReactiveDropPluginInput = DropPluginInput;

export { Neodrag };

function resolvePlugins(plugins: DropPluginInput) {
	return typeof plugins === 'function' ? plugins() : plugins;
}

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
		if (typeof this.#plugins === 'function') {
			return $effect.root(() => {
				$effect.pre(() => {
					this.#handle?.update(resolvePlugins(this.#plugins));
				});
				return () => this.detach();
			});
		}
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

export function droppable(plugins: DropPluginInput = []): Attachment<HTMLElement | SVGElement> {
	return (element) => {
		const engine = Neodrag.shared;
		const handle = engine.droppable(element, plugins);

		if (typeof plugins !== 'function') {
			return () => handle.destroy();
		}

		return $effect.root(() => {
			$effect.pre(() => {
				handle.update(resolvePlugins(plugins));
			});
			return () => handle.destroy();
		});
	};
}

export { sortable, type SortableOptions, type SortableStrategy } from '@neodrag/core/drop';
export { sortableItemFor } from './sortable.svelte';
