import type { DropPluginInput } from './types.ts';
import type { DragPluginInput } from './types.ts';

export interface NeodragHost {
	update(node: HTMLElement | SVGElement, plugins: DragPluginInput): void;
	updateDrop(node: HTMLElement | SVGElement, plugins: DropPluginInput): void;
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

	update(plugins: DragPluginInput) {
		this.#engine.update(this.node, plugins);
	}

	destroy() {
		this.#dispose();
	}
}

export class DropHandle {
	readonly node: HTMLElement | SVGElement;
	readonly #dispose: () => void;
	readonly #engine: NeodragHost;

	constructor(engine: NeodragHost, node: HTMLElement | SVGElement, dispose: () => void) {
		this.#engine = engine;
		this.node = node;
		this.#dispose = dispose;
	}

	update(plugins: DropPluginInput) {
		this.#engine.updateDrop(this.node, plugins);
	}

	destroy() {
		this.#dispose();
	}
}

export type { DragPluginInput };
