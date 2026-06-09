import {
	Draggable,
	Droppable,
	Resizable,
	SortableList,
	SORTABLE_KEY_ATTR,
	sortableKey,
	type DragEventData,
	type DragOptions,
	type DropEventData,
	type DropOptions,
	type ResizeOptions,
	type SortableOptions,
	type SortableRow,
} from '@neodrag/core';
import { useCallback, useEffect, useRef, useState } from 'react';

type RefCallback = (node: HTMLElement | null) => void;

/**
 * React wrapper for the v3 core — thin (~one hook per capability). The instance lives in a
 * ref; the latest options live in a ref so callbacks stay stable; each render pushes a
 * fine-grained `update()`. `isDragging`/`isOver` come back as state.
 */
export function useDraggable(options: DragOptions = {}): { ref: RefCallback; isDragging: boolean } {
	const instance = useRef<Draggable | null>(null);
	const opts = useRef(options);
	opts.current = options;
	const [isDragging, setDragging] = useState(false);

	const wrapped = useCallback(
		(): DragOptions => ({
			...opts.current,
			onDragStart: (e: DragEventData) => {
				setDragging(true);
				opts.current.onDragStart?.(e);
			},
			onDrag: (e: DragEventData) => {
				// Two-way `position`: write the live offset back if the caller defined a setter.
				if (Object.getOwnPropertyDescriptor(opts.current, 'position')?.set) {
					opts.current.position = e.offset;
				}
				opts.current.onDrag?.(e);
			},
			onDragEnd: (e: DragEventData) => {
				setDragging(false);
				opts.current.onDragEnd?.(e);
			},
		}),
		[],
	);

	const ref = useCallback<RefCallback>(
		(node) => {
			instance.current?.destroy();
			instance.current = node ? new Draggable(node, wrapped()) : null;
		},
		[wrapped],
	);

	useEffect(() => {
		instance.current?.update(wrapped());
	});

	return { ref, isDragging };
}

export function useDroppable(options: DropOptions = {}): { ref: RefCallback; isOver: boolean } {
	const instance = useRef<Droppable | null>(null);
	const opts = useRef(options);
	opts.current = options;
	const [isOver, setOver] = useState(false);

	const wrapped = useCallback(
		(): DropOptions => ({
			...opts.current,
			onEnter: (e: DropEventData) => {
				setOver(true);
				opts.current.onEnter?.(e);
			},
			onLeave: (e: DropEventData) => {
				setOver(false);
				opts.current.onLeave?.(e);
			},
		}),
		[],
	);

	const ref = useCallback<RefCallback>(
		(node) => {
			instance.current?.destroy();
			instance.current = node ? new Droppable(node, wrapped()) : null;
		},
		[wrapped],
	);

	useEffect(() => {
		instance.current?.update(wrapped());
	});

	return { ref, isOver };
}

export function useResizable(options: ResizeOptions = {}): { ref: RefCallback } {
	const instance = useRef<Resizable | null>(null);
	const opts = useRef(options);
	opts.current = options;

	const ref = useCallback<RefCallback>((node) => {
		instance.current?.destroy();
		instance.current = node ? new Resizable(node, opts.current) : null;
	}, []);

	useEffect(() => {
		instance.current?.update(opts.current);
	});

	return { ref };
}

/**
 * Sortable hook. Put `ref` on the container and spread `{...row(key)}` on each item instead of
 * hand-writing `data-sortable-key`. Pass the latest `items` each render; the hook reconciles.
 */
export function useSortable<T = unknown>(options: SortableOptions<T>): {
	ref: RefCallback;
	row: (item: T) => SortableRow;
} {
	const instance = useRef<SortableList<T> | null>(null);
	const opts = useRef(options);
	opts.current = options;

	const ref = useCallback<RefCallback>((node) => {
		instance.current?.destroy();
		instance.current = node ? new SortableList(node, opts.current) : null;
	}, []);

	useEffect(() => {
		instance.current?.update(opts.current);
	});

	return { ref, row: (item) => ({ [SORTABLE_KEY_ATTR]: sortableKey(item) }) as SortableRow };
}

// Unified surface: the hooks above plus the full class-based core — Draggable/Droppable/
// Resizable/SortableList, every option type, the `use: []` extensions and the collab/CRDT
// layer. All tree-shakeable.
export * from '@neodrag/core';
