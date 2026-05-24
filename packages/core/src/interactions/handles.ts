import type { DragPluginList, DropPluginList } from './types.ts';

export interface NeodragHost {
	update(node: HTMLElement | SVGElement, plugins: DragPluginList): void;
	updateDrop(node: HTMLElement | SVGElement, plugins: DropPluginList): void;
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

	update(plugins: DragPluginList) {
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

	update(plugins: DropPluginList) {
		this.#engine.updateDrop(this.node, plugins);
	}

	destroy() {
		this.#dispose();
	}
}

export type { DragPluginList };
