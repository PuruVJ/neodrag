import { MarkupAdapter, type NeodragMarkupAttrs } from '@neodrag/core/internal';

export class ReactiveMarkupAdapter extends MarkupAdapter {
	#attrs: NeodragMarkupAttrs;
	#version = 0;
	readonly #listeners = new Set<() => void>();

	constructor(initial: NeodragMarkupAttrs) {
		super();
		this.#attrs = { ...initial };
	}

	get attrs(): NeodragMarkupAttrs {
		return this.#attrs;
	}

	get version(): number {
		return this.#version;
	}

	subscribe(listener: () => void): () => void {
		this.#listeners.add(listener);
		return () => this.#listeners.delete(listener);
	}

	#bump(): void {
		this.#version += 1;
		for (const listener of this.#listeners) listener();
	}

	setAttr(name: string, value: string): void {
		if (this.#attrs[name] === value) return;
		this.#attrs[name] = value;
		this.#bump();
	}

	removeAttr(name: string): void {
		if (!(name in this.#attrs)) return;
		delete this.#attrs[name];
		this.#bump();
	}
}

export function createReactiveMarkup(initial: NeodragMarkupAttrs): {
	readonly attrs: NeodragMarkupAttrs;
	readonly adapter: ReactiveMarkupAdapter;
} {
	const adapter = new ReactiveMarkupAdapter(initial);
	return {
		get attrs() {
			return adapter.attrs;
		},
		adapter,
	};
}
