import type { DragPlugin } from './types.ts';

export class Compartment {
	#current?: DragPlugin | null;
	#subscribers = new Set<(plugin: DragPlugin | null | undefined) => void>();
	#updating = false;

	constructor(initial?: null | undefined | (() => DragPlugin | null | undefined)) {
		this.#current = initial ? initial() : undefined;
	}

	get current(): DragPlugin | null | undefined {
		return this.#current;
	}

	set current(plugin: DragPlugin | null | undefined) {
		if (plugin === this.#current || this.#updating) return;
		this.#updating = true;
		this.#current = plugin;
		for (const callback of this.#subscribers) callback(plugin);
		this.#updating = false;
	}

	subscribe(callback: (plugin: DragPlugin | null | undefined) => void) {
		this.#subscribers.add(callback);
		return () => this.#subscribers.delete(callback);
	}
}
