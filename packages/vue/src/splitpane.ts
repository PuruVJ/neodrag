import { SplitPane, type SplitPaneOptions } from '@neodrag/core/splitpane';
import type { Room } from '@neodrag/core/collab';
import { onScopeDispose, ref, type Ref } from 'vue';

type FnRef = (el: HTMLElement | null) => void;

/**
 * Vue v3 split-pane composable — a thin adapter over the core `SplitPane` binder. Bind `:ref="container"`
 * on the wrapper, `:ref="pane(i)"` on each pane, and `:ref="gutter(i)"` on each divider (the gutter between
 * pane `i` and `i + 1`). `sizes` is the live reactive array of weights. Nests: each composable is independent.
 */
export function useSplitPane(options: SplitPaneOptions & { room?: Room } = {}): {
	container: FnRef;
	pane: (index: number) => FnRef;
	gutter: (index: number) => FnRef;
	sizes: Ref<number[]>;
	setSizes: (sizes: number[]) => void;
} {
	const sizes = ref<number[]>(options.sizes ?? []) as Ref<number[]>;
	const pane_refs = new Map<number, FnRef>();
	const gutter_refs = new Map<number, FnRef>();

	// One persistent core instance shared by the container + pane/gutter refs (they bind independently).
	const inst = new SplitPane({ ...options, onChange: (s) => (sizes.value = s.slice()) });

	let c_dispose: (() => void) | null = null;
	const container: FnRef = (node) => {
		c_dispose?.();
		c_dispose = node ? inst.container(node) : null;
	};

	const make = (cache: Map<number, FnRef>, kind: 'pane' | 'gutter', index: number): FnRef => {
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

	onScopeDispose(() => c_dispose?.());

	return { container, pane, gutter, sizes, setSizes };
}

export type { SplitAxis, SplitPaneOptions } from '@neodrag/core/splitpane';
