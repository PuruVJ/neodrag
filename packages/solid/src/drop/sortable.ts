import { sortable, type SortableOptions } from '@neodrag/core/drop';
import type { DragPluginList } from '@neodrag/core';
import { useDraggable } from '../index.ts';

export function sortableItemPlugins<T>(
	list: ReturnType<typeof sortable<T>>,
	key: string,
	extra?: DragPluginList,
): DragPluginList {
	const plugins = list.item(key);
	return extra ? [...plugins, ...extra] : plugins;
}

export function useSortableItem<T>(
	list: ReturnType<typeof sortable<T>>,
	key: string,
	extra?: DragPluginList,
) {
	return useDraggable(sortableItemPlugins(list, key, extra));
}
