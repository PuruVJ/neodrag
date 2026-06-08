import type {
	SortableIntentMeta,
	SortableOptions,
	SortablePreviewMeta,
	SortablePreviewMode,
	SortableReorderMeta,
	SortableTransferMeta,
} from '@neodrag/core/sortable';
import { useMemo, useRef } from 'react';
import { targetSpreadProps } from './attachments.ts';
import { Sortable } from './drop/sortable.ts';
import { useDraggableBinding } from './use-neodrag-binding.ts';

export type SortableList<T> = Sortable<T>;

export type UseSortableOptions<T> = Omit<
	SortableOptions<T>,
	'items' | 'onReorder' | 'onSortPreview' | 'onIntentChange' | 'onTransfer'
> & {
	items: T[];
	onReorder: (next: T[], meta: SortableReorderMeta<T>) => void;
	preview?: SortablePreviewMode;
	onSortPreview?: (next: T[], meta: SortablePreviewMeta) => void;
	onIntentChange?: (intent: SortableIntentMeta<T>) => void;
	onTransfer?: (item: T, meta: SortableTransferMeta) => void;
};

export type { SortableIntentMeta, SortablePreviewMode };

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

	const onIntentChangeRef = useRef(options.onIntentChange);
	onIntentChangeRef.current = options.onIntentChange;

	const onTransferRef = useRef(options.onTransfer);
	onTransferRef.current = options.onTransfer;

	if (!listRef.current) {
		const {
			items: _items,
			onReorder: _onReorder,
			onSortPreview: _onSortPreview,
			onIntentChange: _onIntentChange,
			onTransfer: _onTransfer,
			keyBy: _keyBy,
			...rest
		} = options;
		listRef.current = new Sortable({
			...rest,
			items: () => itemsRef.current,
			keyBy: (item) => keyByRef.current(item),
			onReorder: (next, meta) => onReorderRef.current(next, meta),
			...(_onSortPreview
				? { onSortPreview: (next, meta) => onSortPreviewRef.current?.(next, meta) }
				: {}),
			...(_onIntentChange
				? {
						onIntentChange: (intent) => onIntentChangeRef.current?.(intent),
					}
				: {}),
			...(_onTransfer
				? { onTransfer: (item, meta) => onTransferRef.current?.(item, meta) }
				: {}),
		});
	}

	const list = listRef.current;

	return {
		list,
		container: list.container,
		containerSpread: targetSpreadProps(list.container),
	};
}

export function useSortableItem<T>(list: SortableList<T>, key: string) {
	const chip = useMemo(() => list.item(key), [list, key]);
	return useDraggableBinding(chip);
}
