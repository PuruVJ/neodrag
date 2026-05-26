import { numberStub, resolveSizeInput } from '../length-contract.ts';
import { lengthContext } from '../length/utils.ts';
import type { LengthAdapter, SizeInput } from '../length-runtime.ts';
import { dragData } from '../plugins.ts';
import { defineDropPlugin, defineDragPlugin } from '../types.ts';

const SORTABLE_DROP_KEY = Symbol('neodrag.sortable.container');

export type SortableStrategy = 'vertical' | 'horizontal';
export type SortableMode = 'insert' | 'swap';

export interface SortablePreviewMeta {
	from: number;
	to: number;
	item: unknown;
	mode: SortableMode;
}

export interface SortableReorderMeta<T> {
	from: number;
	to: number;
	item: T;
	mode?: SortableMode;
	phase?: 'preview' | 'commit';
}

export interface SortableOptions<T> {
	items: () => readonly T[];
	keyBy: (item: T) => string;
	onReorder: (next: T[], meta: SortableReorderMeta<T>) => void;
	onSortPreview?: (next: T[], meta: SortablePreviewMeta) => void;
	strategy?: SortableStrategy;
	mode?: SortableMode;
	keyboard?: boolean;
	group?: string;
	onAdd?: (item: T, meta: { fromIndex: number; toIndex: number }) => void;
	onRemove?: (item: T, meta: { toIndex: number }) => void;
	edgeThreshold?: SizeInput;
	length?: LengthAdapter;
}

interface SortableContext<T> {
	id: symbol;
	opts: SortableOptions<T>;
	nodesByKey: Map<string, HTMLElement | SVGElement>;
	midsCache: { mids: { key: string; mid: number; index: number }[]; itemsLen: number } | null;
}

const sortableById = new Map<symbol, SortableContext<unknown>>();
const sortableGroups = new Map<string, Set<symbol>>();

function registerSortable<T>(ctx: SortableContext<T>) {
	sortableById.set(ctx.id, ctx as SortableContext<unknown>);
	const group = ctx.opts.group;
	if (!group) return;
	let set = sortableGroups.get(group);
	if (!set) {
		set = new Set();
		sortableGroups.set(group, set);
	}
	set.add(ctx.id);
}

function invalidateMidsCache<T>(ctx: SortableContext<T>) {
	ctx.midsCache = null;
}

export function invalidateSortableLayoutForNode(node: HTMLElement | SVGElement) {
	for (const ctx of sortableById.values()) {
		for (const el of ctx.nodesByKey.values()) {
			if (el === node) {
				invalidateMidsCache(ctx);
				return;
			}
		}
	}
}

export function invalidateSortableLayout(invalidate: () => void) {
	invalidate();
}

export function applySortableReorder<T>(
	items: readonly T[],
	from: number,
	to: number,
	mode: SortableMode = 'insert',
): { next: T[]; insertAt: number } {
	const copy = [...items];
	if (from < 0 || from >= copy.length) return { next: copy, insertAt: to };
	if (mode === 'swap') {
		if (to < 0 || to >= copy.length || from === to) return { next: copy, insertAt: to };
		const a = copy[from]!;
		copy[from] = copy[to]!;
		copy[to] = a;
		return { next: copy, insertAt: to };
	}
	let target = to;
	if (target < 0) target = copy.length - 1;
	if (from === target) return { next: copy, insertAt: target };
	const [item] = copy.splice(from, 1);
	if (!item) return { next: copy, insertAt: target };
	const insertAt = target > from ? target - 1 : target;
	copy.splice(insertAt, 0, item);
	return { next: copy, insertAt };
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

	let edgeThresholdPx = 0;
	if (ctx.opts.edgeThreshold != null) {
		const adapter = ctx.opts.length ?? numberStub;
		const ref = ctx.nodesByKey.get(list[0]?.key ?? '') ?? document.documentElement;
		const axis = strategy === 'horizontal' ? 'x' : 'y';
		edgeThresholdPx = resolveSizeInput(
			adapter,
			ctx.opts.edgeThreshold,
			lengthContext(ref, axis),
			0,
		);
	}

	for (let i = lo; i < n; i++) {
		const entry = list[i]!;
		if (entry.key === excludeKey) continue;
		if (pos < entry.mid - edgeThresholdPx) return entry.index;
	}
	return len;
}

function dragPayload<T>(ctx: SortableContext<T>, key: string, data?: () => T) {
	if (ctx.opts.group) {
		return data
			? { key, sortableId: ctx.id, value: data() }
			: { key, sortableId: ctx.id };
	}
	return data ? { key, value: data() } : { key };
}

function isForeignDrag<T>(ctx: SortableContext<T>, data: unknown): boolean {
	if (!ctx.opts.group || !data || typeof data !== 'object') return false;
	const sortableId = (data as { sortableId?: symbol }).sortableId;
	if (!sortableId || sortableId === ctx.id) return false;
	return sortableGroups.get(ctx.opts.group)?.has(sortableId) ?? false;
}

export function sortable<T>(opts: SortableOptions<T>) {
	const ctx: SortableContext<T> = {
		id: Symbol('neodrag.sortable'),
		opts,
		nodesByKey: new Map(),
		midsCache: null,
	};
	registerSortable(ctx);

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
		phase: 'resolve',

		init() {
			return {
				hoverIndex: -1,
				dragKey: '',
				lastX: NaN,
				lastY: NaN,
				lastIndex: -1,
				previewFrom: -1,
				previewTo: -1,
			};
		},

		over(dropCtx, state, input) {
			const x = input.clientX;
			const y = input.clientY;
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

			if (!dragKey || !opts.onSortPreview || isForeignDrag(ctx, dropCtx.session.data)) return;

			const items = opts.items();
			const from = items.findIndex((i) => opts.keyBy(i) === dragKey);
			if (from < 0) return;
			let to = nextIndex;
			if (to < 0) to = items.length - 1;
			if (from === to) return;
			if (state.previewFrom === from && state.previewTo === to) return;

			state.previewFrom = from;
			state.previewTo = to;
			const mode = opts.mode ?? 'insert';
			const { next } = applySortableReorder(items, from, to, mode);
			opts.onSortPreview(next, { from, to, item: items[from]!, mode });
		},

		drop(dropCtx, state) {
			const sessionData = dropCtx.session.data;
			const dragKey = (sessionData as { key?: string } | undefined)?.key ?? state.dragKey;

			if (isForeignDrag(ctx, sessionData) && dragKey) {
				const sortableId = (sessionData as { sortableId: symbol }).sortableId;
				const source = sortableById.get(sortableId) as SortableContext<T> | undefined;
				if (!source) return;
				const sourceItems = [...source.opts.items()];
				const from = sourceItems.findIndex((i) => source.opts.keyBy(i) === dragKey);
				if (from < 0) return;
				const item = sourceItems[from]!;
				let to = state.hoverIndex;
				if (to < 0) to = opts.items().length;
				source.opts.onRemove?.(item, { toIndex: to });
				opts.onAdd?.(item, { fromIndex: from, toIndex: to });
				const targetItems = [...opts.items()];
				targetItems.splice(to, 0, item);
				invalidateMidsCache(ctx);
				opts.onReorder(targetItems, {
					from,
					to,
					item,
					mode: opts.mode ?? 'insert',
					phase: 'commit',
				});
				return;
			}

			const items = [...opts.items()];
			const from = items.findIndex((i) => opts.keyBy(i) === dragKey);
			if (from < 0) return;
			let to = state.hoverIndex;
			if (to < 0) to = items.length - 1;
			if (from === to) return;

			const mode = opts.mode ?? 'insert';
			const { next, insertAt } = applySortableReorder(items, from, to, mode);
			invalidateMidsCache(ctx);
			opts.onReorder(next, {
				from,
				to: insertAt,
				item: items[from]!,
				mode,
				phase: 'commit',
			});
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
					phase: 'pre',

					init(dragCtx) {
						dragCtx.rootNode.setAttribute('data-sortable-key', key);
						ctx.nodesByKey.set(key, dragCtx.rootNode);
					},

					destroy(dragCtx) {
						ctx.nodesByKey.delete(key);
						itemKeys.delete(key);
						invalidateMidsCache(ctx);
						dragCtx.rootNode.removeAttribute('data-sortable-key');
					},
				}))(),
			];

			plugins.unshift(dragData(() => dragPayload(ctx, key, data)));

			if (opts.keyboard) {
				plugins.push(...sortableKeyboardForItem(ctx, key));
			}

			return plugins;
		},
	};
}

function sortableKeyboardForItem<T>(
	ctx: SortableContext<T>,
	key: string,
): import('../types.ts').DragPlugin[] {
	return [
		defineDragPlugin(() => ({
			key: Symbol(`neodrag.sortable.keyboard.${key}`),
			phase: 'pre',

			init(dragCtx) {
				const root = dragCtx.rootNode;
				const onKeydown = (e: KeyboardEvent) => {
					if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')
						return;
					const strategy = ctx.opts.strategy ?? 'vertical';
					const horizontal = strategy === 'horizontal';
					if (horizontal && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
					if (!horizontal && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
					e.preventDefault();

					const items = [...ctx.opts.items()];
					const from = items.findIndex((i) => ctx.opts.keyBy(i) === key);
					if (from < 0) return;
					const delta = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
					const to = from + delta;
					if (to < 0 || to >= items.length) return;
					const mode = ctx.opts.mode ?? 'insert';
					const { next, insertAt } = applySortableReorder(items, from, to, mode);
					invalidateMidsCache(ctx);
					ctx.opts.onReorder(next, { from, to: insertAt, item: items[from]!, mode, phase: 'commit' });
					root.focus();
				};

				root.addEventListener('keydown', onKeydown);
				if (!root.hasAttribute('tabindex')) root.setAttribute('tabindex', '0');

				return { onKeydown };
			},

			destroy(dragCtx, state) {
				if (state?.onKeydown) dragCtx.rootNode.removeEventListener('keydown', state.onKeydown);
			},
		}))(),
	];
}
