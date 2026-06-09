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
import { createEffect, createSignal, onCleanup, type Accessor } from 'solid-js';

type Ref = (node: HTMLElement) => void;

// Each primitive re-reads its options through `build()` inside a `createEffect`, so reactive
// option values passed as getters (e.g. `createDraggable({ get axis() { return axis(); } })`) are
// tracked and pushed to the live instance via `.update()` — no recreation. `build()` is evaluated
// unconditionally before the `inst?.update` guard so its signals are tracked even before bind.

/** Solid v3 — `create*` primitives returning a `ref` setter + reactive state accessors. */
export function createDraggable(options: DragOptions = {}): {
	ref: Ref;
	isDragging: Accessor<boolean>;
} {
	const [isDragging, setDragging] = createSignal(false);
	let inst: Draggable | null = null;
	// Two-way `position`: a `set position(v)` accessor gets the live offset written back each move.
	const positionTwoWay = Boolean(Object.getOwnPropertyDescriptor(options, 'position')?.set);
	const build = (): DragOptions => ({
		...options,
		onDragStart: (e: DragEventData) => {
			setDragging(true);
			options.onDragStart?.(e);
		},
		onDrag: (e: DragEventData) => {
			if (positionTwoWay) options.position = e.offset;
			options.onDrag?.(e);
		},
		onDragEnd: (e: DragEventData) => {
			setDragging(false);
			options.onDragEnd?.(e);
		},
	});
	const ref: Ref = (node) => {
		inst?.destroy();
		inst = new Draggable(node, build());
		onCleanup(() => {
			inst?.destroy();
			inst = null;
		});
	};
	createEffect(() => {
		const next = build();
		inst?.update(next);
	});
	return { ref, isDragging };
}

export function createDroppable(options: DropOptions = {}): { ref: Ref; isOver: Accessor<boolean> } {
	const [isOver, setOver] = createSignal(false);
	let inst: Droppable | null = null;
	const build = (): DropOptions => ({
		...options,
		onEnter: (e: DropEventData) => {
			setOver(true);
			options.onEnter?.(e);
		},
		onLeave: (e: DropEventData) => {
			setOver(false);
			options.onLeave?.(e);
		},
	});
	const ref: Ref = (node) => {
		inst?.destroy();
		inst = new Droppable(node, build());
		onCleanup(() => {
			inst?.destroy();
			inst = null;
		});
	};
	createEffect(() => {
		const next = build();
		inst?.update(next);
	});
	return { ref, isOver };
}

export function createResizable(options: ResizeOptions = {}): { ref: Ref } {
	let inst: Resizable | null = null;
	const ref: Ref = (node) => {
		inst?.destroy();
		inst = new Resizable(node, options);
		onCleanup(() => {
			inst?.destroy();
			inst = null;
		});
	};
	createEffect(() => {
		const next = { ...options };
		inst?.update(next);
	});
	return { ref };
}

/**
 * Sortable primitive. Put `ref` on the container and spread `{...row(key)}` on each item instead
 * of hand-writing `data-sortable-key`. Pass `items` (and any option) as a getter to keep it live.
 */
export function createSortable<T = unknown>(options: SortableOptions<T>): {
	ref: Ref;
	row: (item: T) => SortableRow;
} {
	let inst: SortableList<T> | null = null;
	const ref: Ref = (node) => {
		inst?.destroy();
		inst = new SortableList(node, { ...options });
		onCleanup(() => {
			inst?.destroy();
			inst = null;
		});
	};
	createEffect(() => {
		const next = { ...options };
		inst?.update(next);
	});
	return { ref, row: (item) => ({ [SORTABLE_KEY_ATTR]: sortableKey(item) }) as SortableRow };
}

export * from '@neodrag/core';
