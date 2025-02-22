import { createDraggable } from '@neodrag/core';
import type { Plugin } from '@neodrag/core/plugins';

const core = createDraggable();

export class Compartment<T extends Plugin> {
	#plugin: T;
	#subscribers = new Set<(plugin: T) => void>();

	constructor(plugin: T) {
		this.#plugin = plugin;
	}

	subscribe(callback: (plugin: T) => void) {
		this.#subscribers.add(callback);
		return () => this.#subscribers.delete(callback);
	}

	set current(newPlugin: T) {
		this.#plugin = newPlugin;
		this.#subscribers.forEach((cb) => cb(newPlugin));
	}

	get current() {
		return this.#plugin;
	}
}

type CompartmentInput<T extends Plugin> = T | Compartment<T>;

export class BaseDraggable {
	#drag_instance: ReturnType<ReturnType<typeof createDraggable>['draggable']>;
	#plugins: CompartmentInput<Plugin>[] = [];
	#unsubscribers: (() => void)[] = [];

	get plugins() {
		return this.#plugins;
	}

	set plugins(plugins: CompartmentInput<Plugin>[]) {
		this.#plugins = plugins;
		this.#drag_instance.update(this.#resolve_plugins());
	}

	constructor(
		factory: ReturnType<typeof createDraggable>,
		node: HTMLElement,
		plugins: CompartmentInput<Plugin>[] = [],
	) {
		this.#plugins = plugins;
		this.#setup_compartment_subscriptions();
		this.#drag_instance = factory.draggable(node, this.#resolve_plugins());
	}

	#resolve_plugins() {
		return this.#plugins.map((p) => (p instanceof Compartment ? p.current : p));
	}

	#setup_compartment_subscriptions() {
		const arr: (() => void)[] = [];

		for (const plugin of this.#plugins) {
			if (plugin instanceof Compartment) {
				arr.push(
					plugin.subscribe(() => {
						this.#drag_instance.update(this.#resolve_plugins());
					}),
				);
			}
		}
		this.#unsubscribers = arr;
	}

	destroy() {
		this.#unsubscribers.forEach((unsub) => unsub());
		this.#drag_instance.destroy();
	}
}

export class Draggable extends BaseDraggable {
	constructor(node: HTMLElement, plugins: CompartmentInput<Plugin>[] = []) {
		super(core, node, plugins);
	}
}

export * from '@neodrag/core/plugins';
export const instances = core.instances;
