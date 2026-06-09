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
import { onScopeDispose, ref, watch, watchEffect, type Ref } from 'vue';

// Each composable re-reads its options through `build()` inside a `watchEffect`, so reactive
// option values passed as getters (e.g. `useDraggable({ get axis() { return axis.value } })`) are
// tracked and pushed to the live instance via `.update()` — no recreation. `build()` is evaluated
// unconditionally so its reactive reads are tracked even before the node binds.

/** Vue v3 — composables returning a template `ref` + reactive state. Bind via `:ref`. */
export function useDraggable(options: DragOptions = {}): {
	ref: Ref<HTMLElement | null>;
	isDragging: Ref<boolean>;
} {
	const target = ref<HTMLElement | null>(null);
	const isDragging = ref(false);
	let inst: Draggable | null = null;
	// Two-way `position`: a `set position(v)` accessor gets the live offset written back each move.
	const positionTwoWay = Boolean(Object.getOwnPropertyDescriptor(options, 'position')?.set);
	const build = (): DragOptions => ({
		...options,
		onDragStart: (e: DragEventData) => {
			isDragging.value = true;
			options.onDragStart?.(e);
		},
		onDrag: (e: DragEventData) => {
			if (positionTwoWay) options.position = e.offset;
			options.onDrag?.(e);
		},
		onDragEnd: (e: DragEventData) => {
			isDragging.value = false;
			options.onDragEnd?.(e);
		},
	});

	watch(target, (node) => {
		inst?.destroy();
		inst = node ? new Draggable(node, build()) : null;
	});
	watchEffect(() => {
		const next = build();
		inst?.update(next);
	});
	onScopeDispose(() => inst?.destroy());

	return { ref: target, isDragging };
}

export function useDroppable(options: DropOptions = {}): {
	ref: Ref<HTMLElement | null>;
	isOver: Ref<boolean>;
} {
	const target = ref<HTMLElement | null>(null);
	const isOver = ref(false);
	let inst: Droppable | null = null;
	const build = (): DropOptions => ({
		...options,
		onEnter: (e: DropEventData) => {
			isOver.value = true;
			options.onEnter?.(e);
		},
		onLeave: (e: DropEventData) => {
			isOver.value = false;
			options.onLeave?.(e);
		},
	});

	watch(target, (node) => {
		inst?.destroy();
		inst = node ? new Droppable(node, build()) : null;
	});
	watchEffect(() => {
		const next = build();
		inst?.update(next);
	});
	onScopeDispose(() => inst?.destroy());

	return { ref: target, isOver };
}

export function useResizable(options: ResizeOptions = {}): { ref: Ref<HTMLElement | null> } {
	const target = ref<HTMLElement | null>(null);
	let inst: Resizable | null = null;

	watch(target, (node) => {
		inst?.destroy();
		inst = node ? new Resizable(node, options) : null;
	});
	watchEffect(() => {
		const next = { ...options };
		inst?.update(next);
	});
	onScopeDispose(() => inst?.destroy());

	return { ref: target };
}

/**
 * Sortable composable. Bind `:ref="ref"` on the container and `v-bind="row(key)"` on each item
 * instead of hand-writing `data-sortable-key`. Pass `items` (and any option) as a getter to keep
 * it live.
 */
export function useSortable<T = unknown>(options: SortableOptions<T>): {
	ref: Ref<HTMLElement | null>;
	row: (item: T) => SortableRow;
} {
	const target = ref<HTMLElement | null>(null);
	let inst: SortableList<T> | null = null;

	watch(target, (node) => {
		inst?.destroy();
		inst = node ? new SortableList(node, { ...options }) : null;
	});
	watchEffect(() => {
		const next = { ...options };
		inst?.update(next);
	});
	onScopeDispose(() => inst?.destroy());

	return { ref: target, row: (item) => ({ [SORTABLE_KEY_ATTR]: sortableKey(item) }) as SortableRow };
}

export * from '@neodrag/core';
