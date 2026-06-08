import { MarkupAdapter, type NeodragMarkupAttrs } from '@neodrag/core/internal';

export class ReactiveMarkupAdapter extends MarkupAdapter {
	#attrs: NeodragMarkupAttrs;

	constructor(initial: NeodragMarkupAttrs) {
		super();
		this.#attrs = $state({ ...initial });
	}

	get attrs(): NeodragMarkupAttrs {
		return this.#attrs;
	}

	setAttr(name: string, value: string): void {
		this.#attrs[name] = value;
	}

	removeAttr(name: string): void {
		delete this.#attrs[name];
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
