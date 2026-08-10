import { Selectable, type SelectableOptions } from '@neodrag/core/select';
import { useCallback, useRef, useState } from 'react';
import type { RefCallback } from './_internal.ts';

/**
 * Rubber-band multi-select hook — a thin adapter over the core `Selectable` binder (the region is a
 * `Draggable` running the `marqueeSelect` plugin). Put `container` on the region's `ref` and
 * `item(value)` on each child's `ref`. `selected` is the live array of selected values; selected items
 * also carry a `data-neodrag-selected` attribute to style.
 */
export function useSelect<V = string>(options: SelectableOptions<V> = {}): {
	container: RefCallback;
	item: (value: V) => RefCallback;
	selected: V[];
	clear: () => void;
} {
	const instance = useRef<Selectable<V> | null>(null);
	const opts = useRef(options);
	opts.current = options;
	const [selected, setSelected] = useState<V[]>([]);
	const item_refs = useRef(new Map<V, RefCallback>());

	// One persistent core instance shared by the container + item refs (they bind independently).
	if (!instance.current) {
		instance.current = new Selectable<V>({ ...opts.current, onChange: (list) => setSelected(list) });
	}

	const c_dispose = useRef<(() => void) | null>(null);
	const container = useCallback<RefCallback>((node) => {
		c_dispose.current?.();
		c_dispose.current = node ? instance.current!.container(node) : null;
	}, []);

	const item = useCallback((value: V): RefCallback => {
		let cb = item_refs.current.get(value);
		if (!cb) {
			let off: (() => void) | null = null;
			cb = (node) => {
				off?.();
				off = node ? instance.current!.item(value, node) : null;
			};
			item_refs.current.set(value, cb);
		}
		return cb;
	}, []);

	const clear = useCallback(() => instance.current?.clear(), []);

	return { container, item, selected, clear };
}

export { rectsOverlap, type MarqueeOptions, type SelectableOptions } from '@neodrag/core/select';
