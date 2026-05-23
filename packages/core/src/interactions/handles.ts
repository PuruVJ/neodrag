import type { DragPlugin, DragPluginInput } from './types.ts';

export interface NeodragHost {
	update(node: HTMLElement | SVGElement, plugins: DragPlugin[]): void;
}

export class DragHandle {
	readonly node: HTMLElement | SVGElement;
	readonly #dispose: () => void;
	readonly #engine: NeodragHost;

	constructor(engine: NeodragHost, node: HTMLElement | SVGElement, dispose: () => void) {
		this.#engine = engine;
		this.node = node;
		this.#dispose = dispose;
	}

	update(plugins: DragPlugin[] | (() => DragPlugin[])) {
		const list = typeof plugins === 'function' ? plugins() : plugins;
		this.#engine.update(this.node, list);
	}

	destroy() {
		this.#dispose();
	}
}

export class DropHandle {
	readonly node: HTMLElement | SVGElement;
	readonly #dispose: () => void;

	constructor(node: HTMLElement | SVGElement, dispose: () => void) {
		this.node = node;
		this.#dispose = dispose;
	}

	destroy() {
		this.#dispose();
	}
}

export type { DragPluginInput };
