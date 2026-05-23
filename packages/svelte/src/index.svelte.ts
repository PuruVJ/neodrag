import { DEFAULTS, DraggableFactory, type ErrorInfo } from '@neodrag/core';
import { Compartment as CoreCompartment, type PluginInput } from '@neodrag/core/plugins';
import { onDestroy } from 'svelte';
import { Attachment } from 'svelte/attachments';

export type NeodragOptions = {
	plugins?: (typeof DEFAULTS)['plugins'];
	delegate?: (typeof DEFAULTS)['delegate'];
	onError?: (error: ErrorInfo) => void;
};

export class Neodrag {
	readonly #factory: DraggableFactory;

	static readonly shared = new Neodrag();

	constructor(options: NeodragOptions = {}) {
		this.#factory = new DraggableFactory({
			plugins: options.plugins ?? DEFAULTS.plugins,
			delegate: options.delegate ?? DEFAULTS.delegate,
			onError: options.onError ?? DEFAULTS.onError,
		});
	}

	get instances() {
		return this.#factory.instances;
	}

	bind(node: HTMLElement | SVGElement, plugins: PluginInput = []) {
		return this.#factory.draggable(node, plugins);
	}

	draggable(plugins?: PluginInput): Draggable {
		return new Draggable(this, plugins);
	}

	dispose() {
		this.#factory.dispose();
	}
}

export class Draggable {
	readonly #engine: Neodrag;
	readonly #plugins: PluginInput;
	#destroy?: () => void;

	constructor(engine: Neodrag = Neodrag.shared, plugins: PluginInput = []) {
		this.#engine = engine;
		this.#plugins = plugins;
	}

	attach(element: HTMLElement | SVGElement) {
		this.detach();
		this.#destroy = this.#engine.bind(element, this.#plugins);
		return () => this.detach();
	}

	attachment(): Attachment<HTMLElement | SVGElement> {
		return (element) => this.attach(element);
	}

	detach() {
		this.#destroy?.();
		this.#destroy = undefined;
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

export function draggable(plugins?: PluginInput): Attachment<HTMLElement | SVGElement> {
	return new Draggable(Neodrag.shared, plugins).attachment();
}

export * from '@neodrag/core/plugins';

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
