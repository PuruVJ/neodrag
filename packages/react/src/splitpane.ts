import { SplitPane, type SplitPaneOptions } from '@neodrag/core/splitpane';
import type { Room } from '@neodrag/core/collab';
import { useCallback, useRef, useState } from 'react';
import type { RefCallback } from './_internal.ts';

/**
 * Split-pane hook — a thin adapter over the core `SplitPane` binder. Put `container` on the wrapper's
 * `ref`, `pane(i)` on each pane's `ref`, and `gutter(i)` on each divider's `ref` (the gutter between
 * pane `i` and `i + 1`). `sizes` is the live array of weights. Nests: each hook is independent.
 */
export function useSplitPane(options: SplitPaneOptions & { room?: Room } = {}): {
	container: RefCallback;
	pane: (index: number) => RefCallback;
	gutter: (index: number) => RefCallback;
	sizes: number[];
	setSizes: (sizes: number[]) => void;
} {
	const instance = useRef<SplitPane | null>(null);
	const opts = useRef(options);
	opts.current = options;
	const [sizes, setSizes] = useState<number[]>(options.sizes ?? []);
	const pane_refs = useRef(new Map<number, RefCallback>());
	const gutter_refs = useRef(new Map<number, RefCallback>());

	if (!instance.current) {
		instance.current = new SplitPane({ ...opts.current, onChange: (s) => setSizes(s.slice()) });
	}

	const c_dispose = useRef<(() => void) | null>(null);
	const container = useCallback<RefCallback>((node) => {
		c_dispose.current?.();
		c_dispose.current = node ? instance.current!.container(node) : null;
	}, []);

	const make = (cache: Map<number, RefCallback>, kind: 'pane' | 'gutter', index: number): RefCallback => {
		let cb = cache.get(index);
		if (!cb) {
			let off: (() => void) | null = null;
			cb = (node) => {
				off?.();
				off = node
					? kind === 'pane'
						? instance.current!.pane(node, index)
						: instance.current!.gutter(node, index)
					: null;
			};
			cache.set(index, cb);
		}
		return cb;
	};

	const pane = useCallback((index: number) => make(pane_refs.current, 'pane', index), []);
	const gutter = useCallback((index: number) => make(gutter_refs.current, 'gutter', index), []);
	const setSizesFn = useCallback((s: number[]) => instance.current?.setSizes(s), []);

	return { container, pane, gutter, sizes, setSizes: setSizesFn };
}

export type { SplitAxis, SplitPaneOptions } from '@neodrag/core/splitpane';
