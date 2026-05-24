import { Neodrag } from './engine.ts';
import type { DragHandle } from './handles.ts';
import {
	hasReactiveSlots,
	PluginListResolver,
	resolvedPluginsUnchanged,
} from './resolve-plugins.ts';
import type { TransformApplier } from './apply-transform.ts';
import type { DragPlugin, DragPluginList } from './types.ts';

export type { TransformApplier };

export interface DraggableOptions {
	engine?: Neodrag;
	plugins: DragPluginList;
	applyTransform?: TransformApplier;
}

export class Draggable {
	readonly #engine: Neodrag;
	#resolver: PluginListResolver<DragPlugin>;
	#handle: DragHandle | null = null;
	#node: HTMLElement | SVGElement | null = null;
	#lastResolved: DragPlugin[] | null = null;

	readonly attachment: (node: HTMLElement | SVGElement) => () => void;
	readonly #applyTransform?: TransformApplier;

	constructor(options: DraggableOptions) {
		this.#engine = options.engine ?? Neodrag.shared;
		this.#applyTransform = options.applyTransform;
		this.#resolver = new PluginListResolver(options.plugins);

		this.attachment = (node) => {
			this.attach(node);
			return () => this.detach();
		};
	}

	get hasReactiveSlots() {
		return this.#resolver.hasReactive();
	}

	attach(node: HTMLElement | SVGElement) {
		this.detach();
		this.#node = node;
		const resolved = this.#resolver.resolveFull();
		this.#lastResolved = resolved;
		this.#handle = this.#engine.draggable(node, resolved, {
			applyTransform: this.#applyTransform,
		});
	}

	detach() {
		this.#handle?.destroy();
		this.#handle = null;
		this.#node = null;
		this.#lastResolved = null;
	}

	flushReactive() {
		if (!this.#handle || !this.#resolver.hasReactive()) return;

		const next = this.#resolver.resolveReactive();
		if (this.#lastResolved && resolvedPluginsUnchanged(this.#lastResolved, next)) return;

		this.#handle.update(next);
		this.#lastResolved = next;
	}

	update(slots?: DragPluginList) {
		if (slots) this.#resolver.setSlots(slots);
		if (!this.#handle) return;

		const next = this.#resolver.hasReactive()
			? this.#resolver.resolveReactive()
			: this.#resolver.resolveFull();

		if (this.#lastResolved && resolvedPluginsUnchanged(this.#lastResolved, next)) return;

		this.#handle.update(next);
		this.#lastResolved = next;
	}

	destroy() {
		this.detach();
	}
}

export class DroppableBinding {
	readonly #engine: Neodrag;
	#resolver: PluginListResolver<import('./types.ts').DropPlugin>;
	#handle: import('./handles.ts').DropHandle | null = null;

	readonly attachment: (node: HTMLElement | SVGElement) => () => void;

	constructor(options: { engine?: Neodrag; plugins: import('./types.ts').DropPluginList }) {
		this.#engine = options.engine ?? Neodrag.shared;
		this.#resolver = new PluginListResolver(options.plugins);

		this.attachment = (node) => {
			this.attach(node);
			return () => this.detach();
		};
	}

	get hasReactiveSlots() {
		return this.#resolver.hasReactive();
	}

	attach(node: HTMLElement | SVGElement) {
		this.detach();
		const resolved = this.#resolver.resolveFull();
		this.#lastResolved = resolved;
		this.#handle = this.#engine.droppable(node, resolved);
	}

	#lastResolved: import('./types.ts').DropPlugin[] | null = null;

	detach() {
		this.#handle?.destroy();
		this.#handle = null;
		this.#lastResolved = null;
	}

	flushReactive() {
		if (!this.#handle || !this.#resolver.hasReactive()) return;
		const next = this.#resolver.resolveReactive();
		if (this.#lastResolved && resolvedPluginsUnchanged(this.#lastResolved, next)) return;
		this.#handle.update(next);
		this.#lastResolved = next;
	}

	update(slots?: import('./types.ts').DropPluginList) {
		if (slots) this.#resolver.setSlots(slots);
		if (!this.#handle) return;
		const next = this.#resolver.hasReactive()
			? this.#resolver.resolveReactive()
			: this.#resolver.resolveFull();
		if (this.#lastResolved && resolvedPluginsUnchanged(this.#lastResolved, next)) return;
		this.#handle.update(next);
		this.#lastResolved = next;
	}

	destroy() {
		this.detach();
	}
}
