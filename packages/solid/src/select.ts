import { Selectable, type SelectableOptions } from '@neodrag/core/select';
import { createSignal, onCleanup, type Accessor } from 'solid-js';

type RefSetter = (node: HTMLElement | null) => void;

/**
 * Rubber-band multi-select primitive — a thin adapter over the core `Selectable` binder (the region
 * is a `Draggable` running the `marqueeSelect` plugin). Put `container` on the region's `ref` and
 * `item(value)` on each child's `ref`. `selected()` is the live array of selected values; selected
 * items also carry a `data-neodrag-selected` attribute to style.
 */
export function createSelect<V = string>(options: SelectableOptions<V> = {}): {
	container: RefSetter;
	item: (value: V) => RefSetter;
	selected: Accessor<V[]>;
	clear: () => void;
} {
	const [selected, set_selected] = createSignal<V[]>([]);
	const item_refs = new Map<V, RefSetter>();

	// One persistent core instance shared by the container + item refs (they bind independently).
	const inst = new Selectable<V>({ ...options, onChange: (list) => set_selected(list) });

	let c_dispose: (() => void) | null = null;
	const container: RefSetter = (node) => {
		c_dispose?.();
		c_dispose = node ? inst.container(node) : null;
	};

	const item = (value: V): RefSetter => {
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

	onCleanup(() => {
		c_dispose?.();
		c_dispose = null;
	});

	return { container, item, selected, clear };
}

export { rectsOverlap, type MarqueeOptions, type SelectableOptions } from '@neodrag/core/select';
