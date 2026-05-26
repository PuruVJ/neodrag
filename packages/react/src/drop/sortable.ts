import {
	sortable,
	type SortableOptions,
	type SortablePreviewMeta,
	type SortableReorderMeta,
} from '@neodrag/core/drop';
import type { DragPluginList } from '@neodrag/core';
import { useRef } from 'react';
import { useDraggable, useDroppable } from '../index.ts';

export type SortableList<T> = ReturnType<typeof sortable<T>>;

export type UseSortableOptions<T> = Omit<
	SortableOptions<T>,
	'items' | 'onReorder' | 'onSortPreview' | 'onAdd' | 'onRemove'
> & {
	items: T[];
	onReorder: (next: T[], meta: SortableReorderMeta<T>) => void;
	onSortPreview?: (next: T[], meta: SortablePreviewMeta) => void;
	onAdd?: SortableOptions<T>['onAdd'];
	onRemove?: SortableOptions<T>['onRemove'];
};

export function useSortable<T>(options: UseSortableOptions<T>) {
	const listRef = useRef<SortableList<T> | null>(null);

	const itemsRef = useRef(options.items);
	itemsRef.current = options.items;

	const keyByRef = useRef(options.keyBy);
	keyByRef.current = options.keyBy;

	const onReorderRef = useRef(options.onReorder);
	onReorderRef.current = options.onReorder;

	const onSortPreviewRef = useRef(options.onSortPreview);
	onSortPreviewRef.current = options.onSortPreview;

	const onAddRef = useRef(options.onAdd);
	onAddRef.current = options.onAdd;

	const onRemoveRef = useRef(options.onRemove);
	onRemoveRef.current = options.onRemove;

	if (!listRef.current) {
		const {
			items: _items,
			onReorder: _onReorder,
			onSortPreview: _onSortPreview,
			onAdd: _onAdd,
			onRemove: _onRemove,
			keyBy: _keyBy,
			...rest
		} = options;
		listRef.current = sortable({
			...rest,
			items: () => itemsRef.current,
			keyBy: (item) => keyByRef.current(item),
			onReorder: (next, meta) => onReorderRef.current(next, meta),
			...( _onSortPreview
				? { onSortPreview: (next, meta) => onSortPreviewRef.current?.(next, meta) }
				: {}),
			...(_onAdd ? { onAdd: (item, meta) => onAddRef.current?.(item, meta) } : {}),
			...(_onRemove ? { onRemove: (item, meta) => onRemoveRef.current?.(item, meta) } : {}),
		});
	}

	const list = listRef.current;
	const { ref: dropRef } = useDroppable(list.container());

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
