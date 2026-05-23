import { DEFAULTS, DraggableFactory, type ErrorInfo } from '@neodrag/core';
import type { PluginInput } from '@neodrag/core/plugins';

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

	draggable(node: HTMLElement | SVGElement, plugins: PluginInput = []): Draggable {
		const destroy = this.#factory.draggable(node, plugins);
		return new Draggable(node, destroy);
	}

	dispose() {
		this.#factory.dispose();
	}
}

export class Draggable {
	readonly node: HTMLElement | SVGElement;
	readonly #destroy: () => void;

	constructor(node: HTMLElement | SVGElement, destroy: () => void) {
		this.node = node;
		this.#destroy = destroy;
	}

	destroy() {
		this.#destroy();
	}
}

export class Droppable {
	readonly node: HTMLElement | SVGElement;
	readonly #destroy: () => void;

	constructor(node: HTMLElement | SVGElement, destroy: () => void) {
		this.node = node;
		this.#destroy = destroy;
	}

	destroy() {
		this.#destroy();
	}
}

export * from '@neodrag/core/plugins';
