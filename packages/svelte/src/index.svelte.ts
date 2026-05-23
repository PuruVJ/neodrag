import {
	Neodrag,
	Compartment as CoreCompartment,
	type EngineOptions,
	type DragPluginInput,
} from '@neodrag/core';
import { onDestroy } from 'svelte';
import { Attachment } from 'svelte/attachments';

export type NeodragOptions = EngineOptions;

export { Neodrag };

export class Draggable {
	readonly #engine: Neodrag;
	readonly #plugins: DragPluginInput;
	#handle?: import('@neodrag/core').DragHandle;

	constructor(engine: Neodrag = Neodrag.shared, plugins: DragPluginInput = []) {
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

	update(plugins: DragPluginInput) {
		this.#handle?.update(plugins);
	}

	detach() {
		this.#handle?.destroy();
		this.#handle = undefined;
	}
}

export function auto_destroy_effect_root(fn: () => void | VoidFunction) {
	let cleanup: VoidFunction | null = $effect.root(fn);

	function destroy() {
		if (cleanup === null) return;
		cleanup();
		cleanup = null;
	}

	try {
		onDestroy(destroy);
	} catch {}

	return destroy;
}

export function draggable(plugins?: DragPluginInput): Attachment<HTMLElement | SVGElement> {
	return new Draggable(Neodrag.shared, plugins ?? []).attachment();
}

export * from '@neodrag/core/plugins';
export {
	DragHandle,
	DropHandle,
	defineDropPlugin,
	DropPluginBase,
	accepts,
	highlight,
	onDrop,
	sortable,
} from '@neodrag/core';

export class Compartment extends CoreCompartment {
	static of(reactive: ConstructorParameters<typeof CoreCompartment>[0]) {
		const compartment = new CoreCompartment(reactive);

		auto_destroy_effect_root(() => {
			$effect.pre(() => {
				compartment.current = reactive?.();
			});
		});

		return compartment;
	}
}
