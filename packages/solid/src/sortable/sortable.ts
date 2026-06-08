import { Sortable, type SortableOptions, type SortableReorderMeta } from '@neodrag/core/sortable';
import type { Accessor } from 'solid-js';
import type { DragPluginList } from '@neodrag/core';
import { createDroppable, createDraggable } from '../index.ts';

export type SortableList<T> = Sortable<T>;

export type CreateSortableOptions<T> = Omit<
	SortableOptions<T>,
	'items' | 'keyBy' | 'onReorder' | 'onSortPreview' | 'onIntentChange' | 'onTransfer'
> & {
	items: Accessor<readonly T[]>;
	keyBy: (item: T) => string;
	onReorder: (next: T[], meta: SortableReorderMeta<T>) => void;
	onSortPreview?: SortableOptions<T>['onSortPreview'];
	onIntentChange?: SortableOptions<T>['onIntentChange'];
	onTransfer?: SortableOptions<T>['onTransfer'];
};

export function createSortable<T>(options: CreateSortableOptions<T>) {
	const list = new Sortable({
		...options,
		items: options.items,
		keyBy: options.keyBy,
		onReorder: options.onReorder,
	});
	const [, dropRef] = createDroppable(list.container());
	return { list, dropRef };
}

export function withSortableItemPlugins<T>(
	list: SortableList<T>,
	key: string,
	extra?: DragPluginList,
): DragPluginList {
	const plugins = list.item(key);
	return extra ? [...plugins, ...extra] : plugins;
}

export function createSortableItem<T>(
	list: SortableList<T>,
	key: string,
	extra?: DragPluginList,
) {
	return createDraggable(withSortableItemPlugins(list, key, extra));
}
