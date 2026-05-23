import { dragData } from '../plugins/drag-data.ts';
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

	let index = len;
	for (let i = 0; i < len; i++) {
		const key = ctx.opts.keyBy(items[i]!);
		if (key === excludeKey) continue;
		const el = ctx.nodesByKey.get(key);
		if (!el) continue;
		const rect = el.getBoundingClientRect();
		const mid =
			strategy === 'horizontal' ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
		const pos = strategy === 'horizontal' ? pointerX : pointerY;
		if (pos < mid) {
			index = i;
			break;
		}
	}
	return index;
}

export function sortable<T>(opts: SortableOptions<T>) {
	const ctx: SortableContext<T> = {
		opts,
		nodesByKey: new Map(),
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
			return { hoverIndex: -1, dragKey: '' };
		},

		over(dropCtx, state, e) {
			const dragKey = (dropCtx.session.data as { key?: string } | undefined)?.key ?? '';
			state.dragKey = dragKey;
			state.hoverIndex = computeIndex(
				ctx,
				e.clientX,
				e.clientY,
				opts.strategy ?? 'vertical',
				dragKey,
			);
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
