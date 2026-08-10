import { SplitPane, type SplitPaneOptions } from '@neodrag/core/splitpane';
import type { Room } from '@neodrag/core/collab';
import { createSignal, onCleanup, type Accessor } from 'solid-js';

type RefSetter = (node: HTMLElement | null) => void;

/**
 * Split-pane primitive — a thin adapter over the core `SplitPane` binder. Put `container` on the
 * wrapper's `ref`, `pane(i)` on each pane's `ref`, and `gutter(i)` on each divider's `ref` (the
 * gutter between pane `i` and `i + 1`). `sizes()` is the live array of weights. Nests: each call is
 * independent. Pass a `room` to sync the layout.
 */
export function createSplitPane(options: SplitPaneOptions & { room?: Room } = {}): {
	container: RefSetter;
	pane: (index: number) => RefSetter;
	gutter: (index: number) => RefSetter;
	sizes: Accessor<number[]>;
	setSizes: (sizes: number[]) => void;
} {
	const [sizes, set_sizes] = createSignal<number[]>(options.sizes ?? []);
	const pane_refs = new Map<number, RefSetter>();
	const gutter_refs = new Map<number, RefSetter>();

	// One persistent core instance shared by the container + pane/gutter refs (they bind independently).
	const inst = new SplitPane({ ...options, onChange: (s) => set_sizes(s.slice()) });

	let c_dispose: (() => void) | null = null;
	const container: RefSetter = (node) => {
		c_dispose?.();
		c_dispose = node ? inst.container(node) : null;
	};

	const make = (cache: Map<number, RefSetter>, kind: 'pane' | 'gutter', index: number): RefSetter => {
		let cb = cache.get(index);
		if (!cb) {
			let off: (() => void) | null = null;
			cb = (node) => {
				off?.();
				off = node ? (kind === 'pane' ? inst.pane(node, index) : inst.gutter(node, index)) : null;
			};
			cache.set(index, cb);
		}
		return cb;
	};

	const pane = (index: number) => make(pane_refs, 'pane', index);
	const gutter = (index: number) => make(gutter_refs, 'gutter', index);
	const setSizes = (s: number[]) => inst.setSizes(s);

	onCleanup(() => {
		c_dispose?.();
		c_dispose = null;
	});

	return { container, pane, gutter, sizes, setSizes };
}

export type { SplitAxis, SplitPaneOptions } from '@neodrag/core/splitpane';
