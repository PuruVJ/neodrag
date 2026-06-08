import type { DragPluginList, DropPluginList } from './types.ts';
import type { ResizePluginList } from './resize/types.ts';

export interface DragHost {
	update(node: HTMLElement | SVGElement, plugins: DragPluginList): void;
}

export interface NeodragHost extends DragHost {
	updateDrop(node: HTMLElement | SVGElement, plugins: DropPluginList): void;
	updateResize(node: HTMLElement | SVGElement, plugins: ResizePluginList): void;
}

export class BindingHandle {
	readonly node: HTMLElement | SVGElement;
	readonly #dispose: () => void;
	readonly #engine: NeodragHost;
	readonly #kind: 'drag' | 'drop' | 'resize';

	constructor(
		kind: 'drag' | 'drop' | 'resize',
		engine: NeodragHost,
		node: HTMLElement | SVGElement,
		dispose: () => void,
	) {
		this.#kind = kind;
		this.#engine = engine;
		this.node = node;
		this.#dispose = dispose;
	}

	update(plugins: DragPluginList | DropPluginList | ResizePluginList) {
		if (this.#kind === 'drag') {
			this.#engine.update(this.node, plugins as DragPluginList);
		} else if (this.#kind === 'drop') {
			this.#engine.updateDrop(this.node, plugins as DropPluginList);
		} else {
			this.#engine.updateResize(this.node, plugins as ResizePluginList);
		}
	}

	destroy() {
		this.#dispose();
	}
}

export class DragHandle extends BindingHandle {
	constructor(engine: DragHost, node: HTMLElement | SVGElement, dispose: () => void) {
		super('drag', engine as NeodragHost, node, dispose);
	}
}

export class DropHandle extends BindingHandle {
	constructor(engine: NeodragHost, node: HTMLElement | SVGElement, dispose: () => void) {
		super('drop', engine, node, dispose);
	}
}

export class ResizeHandle extends BindingHandle {
	constructor(engine: NeodragHost, node: HTMLElement | SVGElement, dispose: () => void) {
		super('resize', engine, node, dispose);
	}
}
