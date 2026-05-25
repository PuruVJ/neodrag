import { Neodrag } from './engine.ts';
import type { DragHandle } from './handles.ts';
import { PluginListResolver, resolvedPluginsUnchanged } from './resolve-plugins.ts';
import type { TransformApplier } from './apply-transform.ts';
import type { DragPlugin, DragPluginList, DropPlugin, DropPluginList } from './types.ts';
import type { DropHandle } from './handles.ts';

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

	readonly attachment: (node: HTMLElement | SVGElement) => void | (() => void);
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
		if (this.#node === node && this.#handle) return;

		this.detach();
		this.#node = node;
		const resolved = this.#resolver.hasReactive()
			? this.#resolver.resolveAttach()
			: this.#resolver.resolveFull();
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
	#resolver: PluginListResolver<DropPlugin>;
	#handle: DropHandle | null = null;
	#lastResolved: DropPlugin[] | null = null;

	readonly attachment: (node: HTMLElement | SVGElement) => void | (() => void);

	constructor(options: { engine?: Neodrag; plugins: DropPluginList }) {
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
		if (this.#handle?.node === node) return;

		this.detach();
		const resolved = this.#resolver.hasReactive()
			? this.#resolver.resolveAttach()
			: this.#resolver.resolveFull();
		this.#lastResolved = resolved;
		this.#handle = this.#engine.droppable(node, resolved);
	}

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

	update(slots?: DropPluginList) {
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
