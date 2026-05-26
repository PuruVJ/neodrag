import { sortable, type SortableOptions } from '@neodrag/core/drop';
import type { DragPluginList } from '@neodrag/core';
import { useDroppable, useDraggable } from '../index.ts';

export type SortableList<T> = ReturnType<typeof sortable<T>>;

export function useSortable<T>(options: SortableOptions<T>) {
	const list = sortable(options);
	const [, dropRef] = useDroppable(list.container());
	return { list, dropRef };
}

export function sortableItemPlugins<T>(
	list: SortableList<T>,
	key: string,
	extra?: DragPluginList,
): DragPluginList {
	const plugins = list.item(key);
	return extra ? [...plugins, ...extra] : plugins;
}

export function useSortableItem<T>(
	list: SortableList<T>,
	key: string,
	extra?: DragPluginList,
) {
	return useDraggable(sortableItemPlugins(list, key, extra));
}
