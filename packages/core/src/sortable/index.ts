import { resolvePluginList } from '../resolve-plugins.ts';
import type { DragPluginList, DropPluginList } from '../types.ts';
import { createSortableContainerDrop } from './container-drop.ts';
import { createSortableContext, registerSortable, unregisterSortable } from './context.ts';
import type { SortableContext } from './context.ts';
import { SortableEngineExtensions } from './engine-extensions.ts';
import { createSortableItemPlugins } from './item-drag.ts';
import { sortableRowAttrs } from './visual.ts';

export { sortableRowAttrs, SORTABLE_ROW_ATTR, findSortableRow } from './visual.ts';
export { SORTABLE_KEY_ATTR, sortableItemAttrs } from '../element-props.ts';

export type {
	SortableStrategy,
	SortablePreset,
	SortableMode,
	SortablePreviewMode,
	SortableCollision,
	SortableTransition,
	OverlayOptions,
	SortablePreviewMeta,
	SortableIntentMeta,
	SortableReorderMeta,
	SortableTransferMeta,
	GroupSourcePreview,
	SortableOptions,
	SortableStrategyInput,
	SortingStrategy,
} from './types.ts';

export { presets } from './strategy/index.ts';

export { applySortableReorder, reorderForInsert, insertAtFromTargetIndex } from './reorder.ts';

export function applyGroupedSortableTransfer<T extends { id: string }, C extends string>(
	all: readonly T[],
	item: T,
	options: {
		toIndex: number;
		column: C;
		columnOf: (row: T) => C;
		withColumn: (row: T, column: C) => T;
	},
): T[] {
	const placed = options.withColumn(item, options.column);
	const without = all.filter((row) => row.id !== item.id);
	const column_rows = without.filter((row) => options.columnOf(row) === options.column);
	column_rows.splice(options.toIndex, 0, placed);
	return [
		...without.filter((row) => options.columnOf(row) !== options.column),
		...column_rows,
	];
}

export class Sortable<T> {
	readonly #ctx: SortableContext<T>;
	readonly #itemKeys = new Map<string, symbol>();
	readonly #containerDrop;

	constructor(opts: import('./types.ts').SortableOptions<T>) {
		SortableEngineExtensions.ensureInstalled();
		this.#ctx = createSortableContext(opts);
		registerSortable(this.#ctx);
		this.#containerDrop = createSortableContainerDrop(this.#ctx, opts);
	}

	destroy(): void {
		unregisterSortable(this.#ctx);
		this.#ctx.clearIntent();
	}

	container(): DropPluginList {
		const extra = this.#ctx.opts.containerPlugins?.() ?? [];
		return extra.length
			? [...resolvePluginList(extra), this.#containerDrop]
			: [this.#containerDrop];
	}

	rowAttrs(): ReturnType<typeof sortableRowAttrs> {
		return sortableRowAttrs();
	}

	#itemKey(id: string): symbol {
		let sym = this.#itemKeys.get(id);
		if (!sym) {
			sym = Symbol(id);
			this.#itemKeys.set(id, sym);
		}
		return sym;
	}

	item(key: string, data?: () => T): DragPluginList {
		return createSortableItemPlugins(
			this.#ctx,
			this.#ctx.opts,
			key,
			this.#itemKeys,
			(id) => this.#itemKey(id),
			data,
		);
	}
}
