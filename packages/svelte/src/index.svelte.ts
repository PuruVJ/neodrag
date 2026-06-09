import { untrack } from 'svelte';
import { createAttachmentKey, type Attachment } from 'svelte/attachments';
import {
	Draggable as CoreDraggable,
	Droppable as CoreDroppable,
	Resizable as CoreResizable,
	SortableList as CoreSortableList,
	SORTABLE_KEY_ATTR,
	sortableKey,
	type DragEventData,
	type DragOptions,
	type DropEventData,
	type DropOptions,
	type ResizeEventData,
	type ResizeOptions,
	type SortableOptions,
	type SortableRow,
	type DndNode,
} from '@neodrag/core';

type AttachProps = { [key: symbol]: Attachment<DndNode> };

/**
 * Class-based, reactive Svelte 5 wrapper around the core `Draggable`. Spread `{...drag.attach}`
 * on the element; read `drag.isDragging`. Pass reactive options as getters — `new Draggable({ get
 * axis() { return axis; } })` — and they update live.
 *
 * Reactivity model: the attachment runs inside an effect, so the initial instance is created with
 * options read **untracked** (otherwise an option change would re-run the attachment and recreate
 * the instance). A separate `$effect` tracks the option getters and pushes `update()`.
 */
export class Draggable {
	#isDragging = $state(false);
	#instance: CoreDraggable | null = null;
	readonly attach: AttachProps;

	constructor(options: DragOptions = {}) {
		// Two-way `position`: if the caller defined a setter (`set position(v)`), write the live
		// offset back to it each move. The spread below drops the accessor, so we write to the
		// original `options` object, which still owns the setter. Getter-only stays one-way.
		const positionTwoWay = Boolean(Object.getOwnPropertyDescriptor(options, 'position')?.set);
		const build = (): DragOptions => ({
			...options,
			onDragStart: (e: DragEventData) => {
				this.#isDragging = true;
				options.onDragStart?.(e);
			},
			onDrag: (e: DragEventData) => {
				if (positionTwoWay) options.position = e.offset;
				options.onDrag?.(e);
			},
			onDragEnd: (e: DragEventData) => {
				this.#isDragging = false;
				options.onDragEnd?.(e);
			},
		});

		this.attach = {
			[createAttachmentKey()]: (node: DndNode) => {
				this.#instance = new CoreDraggable(node, untrack(build));
				return () => {
					this.#instance?.destroy();
					this.#instance = null;
				};
			},
		};

		$effect(() => {
			const next = build();
			this.#instance?.update(next);
		});
	}

	get isDragging(): boolean {
		return this.#isDragging;
	}
}

/** Class-based reactive Svelte wrapper around the core `Droppable`. Exposes `isOver`. */
export class Droppable {
	#isOver = $state(false);
	#instance: CoreDroppable | null = null;
	readonly attach: AttachProps;

	constructor(options: DropOptions = {}) {
		const build = (): DropOptions => ({
			...options,
			onEnter: (e: DropEventData) => {
				this.#isOver = true;
				options.onEnter?.(e);
			},
			onLeave: (e: DropEventData) => {
				this.#isOver = false;
				options.onLeave?.(e);
			},
			onDrop: (e: DropEventData) => {
				this.#isOver = false;
				options.onDrop?.(e);
			},
		});

		this.attach = {
			[createAttachmentKey()]: (node: DndNode) => {
				this.#instance = new CoreDroppable(node, untrack(build));
				return () => {
					this.#instance?.destroy();
					this.#instance = null;
				};
			},
		};

		$effect(() => {
			const next = build();
			this.#instance?.update(next);
		});
	}

	get isOver(): boolean {
		return this.#isOver;
	}
}

/** Class-based reactive Svelte wrapper around the core `Resizable`. Exposes `isResizing` + `size`. */
export class Resizable {
	#isResizing = $state(false);
	#size = $state<{ width: number; height: number } | undefined>(undefined);
	#instance: CoreResizable | null = null;
	readonly attach: AttachProps;

	constructor(options: ResizeOptions = {}) {
		const sync = () => {
			if (this.#instance) this.#size = this.#instance.size;
		};
		const build = (): ResizeOptions => ({
			...options,
			onResizeStart: (e: ResizeEventData) => {
				this.#isResizing = true;
				sync();
				options.onResizeStart?.(e);
			},
			onResize: (e: ResizeEventData) => {
				sync();
				options.onResize?.(e);
			},
			onResizeEnd: (e: ResizeEventData) => {
				this.#isResizing = false;
				sync();
				options.onResizeEnd?.(e);
			},
		});

		this.attach = {
			[createAttachmentKey()]: (node: DndNode) => {
				this.#instance = new CoreResizable(node, untrack(build));
				this.#size = this.#instance.size;
				return () => {
					this.#instance?.destroy();
					this.#instance = null;
				};
			},
		};

		$effect(() => {
			const next = build();
			this.#instance?.update(next);
		});
	}

	get isResizing(): boolean {
		return this.#isResizing;
	}

	get size(): { width: number; height: number } | undefined {
		return this.#size;
	}
}

/**
 * Class-based reactive Svelte wrapper around the core `SortableList`. Spread `{...list.attach}` on
 * the container and `{...list.row(key)}` on each item — no hand-written `data-sortable-key`. Pass
 * `items` (and any option) as a getter to keep it live.
 */
export class SortableList<T = unknown> {
	#instance: CoreSortableList<T> | null = null;
	readonly attach: AttachProps;

	constructor(options: SortableOptions<T>) {
		const build = (): SortableOptions<T> => ({ ...options });

		this.attach = {
			[createAttachmentKey()]: (node: DndNode) => {
				this.#instance = new CoreSortableList<T>(node as HTMLElement, untrack(build));
				return () => {
					this.#instance?.destroy();
					this.#instance = null;
				};
			},
		};

		$effect(() => {
			const next = build();
			this.#instance?.update(next);
		});
	}

	/** Per-row binding — spread onto each item instead of writing `data-sortable-key` by hand. */
	row(item: T): SortableRow {
		return { [SORTABLE_KEY_ATTR]: sortableKey(item) } as SortableRow;
	}
}

// Unified surface: the reactive Svelte classes above (which shadow the core node-first classes of
// the same name) plus everything else from the core — the `Interactions` engine, capabilities, every option
// type, the `use: []` extensions (scrollLock, controls, magnetic, …) and the collab/CRDT layer.
// All tree-shakeable.
export * from '@neodrag/core';
