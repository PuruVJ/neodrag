import type { DragPluginList, DropPluginList } from './types.ts';

export interface NeodragHost {
	update(node: HTMLElement | SVGElement, plugins: DragPluginList): void;
	updateDrop(node: HTMLElement | SVGElement, plugins: DropPluginList): void;
}

export class BindingHandle {
	readonly node: HTMLElement | SVGElement;
	readonly #dispose: () => void;
	readonly #engine: NeodragHost;
	readonly #kind: 'drag' | 'drop';

	constructor(
		kind: 'drag' | 'drop',
		engine: NeodragHost,
		node: HTMLElement | SVGElement,
		dispose: () => void,
	) {
		this.#kind = kind;
		this.#engine = engine;
		this.node = node;
		this.#dispose = dispose;
	}

	update(plugins: DragPluginList | DropPluginList) {
		if (this.#kind === 'drag') {
			this.#engine.update(this.node, plugins as DragPluginList);
		} else {
			this.#engine.updateDrop(this.node, plugins as DropPluginList);
		}
	}

	destroy() {
		this.#dispose();
	}
}

export class DragHandle extends BindingHandle {
	constructor(engine: NeodragHost, node: HTMLElement | SVGElement, dispose: () => void) {
		super('drag', engine, node, dispose);
	}
}

export class DropHandle extends BindingHandle {
	constructor(engine: NeodragHost, node: HTMLElement | SVGElement, dispose: () => void) {
		super('drop', engine, node, dispose);
	}
}
