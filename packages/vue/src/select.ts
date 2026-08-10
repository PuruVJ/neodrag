import { Selectable, type SelectableOptions } from '@neodrag/core/select';
import { onScopeDispose, ref, type Ref } from 'vue';

type FnRef = (el: HTMLElement | null) => void;

/**
 * Vue v3 rubber-band multi-select composable — a thin adapter over the core `Selectable` binder (the
 * region is a `Draggable` running the `marqueeSelect` plugin). Bind `:ref="container"` on the region and
 * `:ref="item(value)"` on each child. `selected` is the live reactive array of selected values; selected
 * items also carry a `data-neodrag-selected` attribute to style.
 */
export function useSelect<V = string>(options: SelectableOptions<V> = {}): {
	container: FnRef;
	item: (value: V) => FnRef;
	selected: Ref<V[]>;
	clear: () => void;
} {
	const selected = ref<V[]>([]) as Ref<V[]>;
	const item_refs = new Map<V, FnRef>();

	// One persistent core instance shared by the container + item refs (they bind independently).
	const inst = new Selectable<V>({ ...options, onChange: (list) => (selected.value = list) });

	let c_dispose: (() => void) | null = null;
	const container: FnRef = (node) => {
		c_dispose?.();
		c_dispose = node ? inst.container(node) : null;
	};

	const item = (value: V): FnRef => {
		let cb = item_refs.get(value);
		if (!cb) {
			let off: (() => void) | null = null;
			cb = (node) => {
				off?.();
				off = node ? inst.item(value, node) : null;
			};
			item_refs.set(value, cb);
		}
		return cb;
	};

	const clear = () => inst.clear();

	onScopeDispose(() => c_dispose?.());

	return { container, item, selected, clear };
}

export { rectsOverlap, type MarqueeOptions, type SelectableOptions } from '@neodrag/core/select';
