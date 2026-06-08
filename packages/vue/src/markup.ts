import { MarkupAdapter, type NeodragMarkupAttrs } from '@neodrag/core/internal';
import { reactive } from 'vue';

export class ReactiveMarkupAdapter extends MarkupAdapter {
	readonly #attrs: NeodragMarkupAttrs;

	constructor(attrs: NeodragMarkupAttrs) {
		super();
		this.#attrs = attrs;
	}

	setAttr(name: string, value: string): void {
		if (this.#attrs[name] === value) return;
		this.#attrs[name] = value;
	}

	removeAttr(name: string): void {
		if (!(name in this.#attrs)) return;
		delete this.#attrs[name];
	}
}

export function createReactiveMarkup(initial: NeodragMarkupAttrs): {
	readonly attrs: NeodragMarkupAttrs;
	readonly adapter: ReactiveMarkupAdapter;
} {
	const attrs = reactive({ ...initial }) as NeodragMarkupAttrs;
	const adapter = new ReactiveMarkupAdapter(attrs);
	return { attrs, adapter };
}
