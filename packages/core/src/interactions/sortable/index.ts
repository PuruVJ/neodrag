import { dragData } from '../plugins.ts';
import { createSessionKey } from '../session-key.ts';
import { defineDropPlugin, defineDragPlugin } from '../types.ts';

const SORTABLE_CTX_KEY = createSessionKey<SortableContext<unknown>>();
const SORTABLE_DROP_KEY = Symbol('neodrag.sortable.drop');

export type SortableStrategy = 'vertical' | 'horizontal';

export interface SortableOptions<T> {
	items: () => readonly T[];
	keyBy: (item: T) => string;
	onReorder: (next: T[], meta: { from: number; to: number; item: T }) => void;
	strategy?: SortableStrategy;
}

interface SortableContext<T> {
	opts: SortableOptions<T>;
	nodesByKey: Map<string, HTMLElement | SVGElement>;
	midsCache: { mids: { key: string; mid: number; index: number }[]; itemsLen: number } | null;
}

function invalidateMidsCache<T>(ctx: SortableContext<T>) {
	ctx.midsCache = null;
}

function computeIndex<T>(
	ctx: SortableContext<T>,
	pointerX: number,
	pointerY: number,
	strategy: SortableStrategy,
	excludeKey: string,
): number {
	const items = ctx.opts.items();
	const len = items.length;
	if (len === 0) return 0;

	let mids = ctx.midsCache?.mids;
	if (!ctx.midsCache || ctx.midsCache.itemsLen !== len) {
		mids = [];
		for (let i = 0; i < len; i++) {
			const key = ctx.opts.keyBy(items[i]!);
			const el = ctx.nodesByKey.get(key);
			if (!el) continue;
			const rect = el.getBoundingClientRect();
			const mid =
				strategy === 'horizontal' ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
			mids.push({ key, mid, index: i });
		}
		mids.sort((a, b) => a.mid - b.mid);
		ctx.midsCache = { mids, itemsLen: len };
	}

	const pos = strategy === 'horizontal' ? pointerX : pointerY;
	const list = mids!;
	const n = list.length;
	if (n === 0) return 0;

	let lo = 0;
	let hi = n;
	while (lo < hi) {
		const mid = (lo + hi) >> 1;
		if (list[mid]!.mid < pos) lo = mid + 1;
		else hi = mid;
	}

	for (let i = lo; i < n; i++) {
		const entry = list[i]!;
		if (entry.key === excludeKey) continue;
		if (pos < entry.mid) return entry.index;
	}
	return len;
}

export function sortable<T>(opts: SortableOptions<T>) {
	const ctx: SortableContext<T> = {
		opts,
		nodesByKey: new Map(),
		midsCache: null,
	};
	const itemKeys = new Map<string, symbol>();
	const itemKey = (id: string) => {
		let sym = itemKeys.get(id);
		if (!sym) {
			sym = Symbol(id);
			itemKeys.set(id, sym);
		}
		return sym;
	};

	const containerDrop = defineDropPlugin(() => ({
		key: SORTABLE_DROP_KEY,
		name: 'sortable-container',
		phase: 'resolve',

		init(dropCtx) {
			dropCtx.session.private.set(SORTABLE_CTX_KEY, ctx as SortableContext<unknown>);
			return {
				hoverIndex: -1,
				dragKey: '',
				lastX: NaN,
				lastY: NaN,
				lastIndex: -1,
			};
		},

		over(dropCtx, state, e) {
			const x = e.clientX;
			const y = e.clientY;
			if (x === state.lastX && y === state.lastY) return;

			const dragKey = (dropCtx.session.data as { key?: string } | undefined)?.key ?? '';
			const nextIndex = computeIndex(
				ctx,
				x,
				y,
				opts.strategy ?? 'vertical',
				dragKey,
			);

			if (dragKey === state.dragKey && nextIndex === state.lastIndex) {
				state.lastX = x;
				state.lastY = y;
				return;
			}

			state.dragKey = dragKey;
			state.hoverIndex = nextIndex;
			state.lastIndex = nextIndex;
			state.lastX = x;
			state.lastY = y;
		},

		drop(dropCtx, state) {
			const dragKey =
				(dropCtx.session.data as { key?: string } | undefined)?.key ?? state.dragKey;
			const items = [...opts.items()];
			const from = items.findIndex((i) => opts.keyBy(i) === dragKey);
			if (from < 0) return;
			let to = state.hoverIndex;
			if (to < 0) to = items.length - 1;
			if (from === to) return;
			const [item] = items.splice(from, 1);
			if (!item) return;
			const insertAt = to > from ? to - 1 : to;
			items.splice(insertAt, 0, item);
			invalidateMidsCache(ctx);
			opts.onReorder(items, { from, to: insertAt, item });
		},
	}))();

	return {
		container(): import('../types.ts').DropPlugin[] {
			return [containerDrop];
		},

		item(key: string, data?: () => T): import('../types.ts').DragPlugin[] {
			const plugins: import('../types.ts').DragPlugin[] = [
				defineDragPlugin(() => ({
					key: itemKey(key),
					name: `sortable-item:${key}`,
					phase: 'pre',

					init(dragCtx) {
						dragCtx.rootNode.setAttribute('data-sortable-key', key);
						ctx.nodesByKey.set(key, dragCtx.rootNode);
					},

					destroy(dragCtx) {
						ctx.nodesByKey.delete(key);
						invalidateMidsCache(ctx);
						dragCtx.rootNode.removeAttribute('data-sortable-key');
					},
				}))(),
			];

			if (data) {
				plugins.unshift(
					dragData(() => ({ key, value: data() })),
				);
			} else {
				plugins.unshift(dragData(() => ({ key })));
			}

			return plugins;
		},
	};
}
