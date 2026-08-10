import { untrack } from 'svelte';
import { createAttachmentKey } from 'svelte/attachments';
import type { DndNode } from '@neodrag/core';
import {
	Resizable as CoreResizable,
	RESIZE_HANDLE_ATTR,
	type ResizeEdge,
	type ResizeEventData,
	type ResizeHandleProps,
	type ResizeOptions,
} from '@neodrag/core/resize';
import type { Room } from '@neodrag/core/collab';
import type { AttachProps } from './_internal.ts';

/**
 * Class-based reactive Svelte wrapper around the core `Resizable`. Exposes `isResizing` + `size`.
 * Collab: pass an `id` and a `room` to auto-join (the panel's size syncs).
 */
export class Resizable {
	#is_resizing = $state(false);
	#size = $state<{ width: number; height: number } | undefined>(undefined);
	#position = $state<{ x: number; y: number } | undefined>(undefined);
	#instance: CoreResizable | null = null;
	#room_off: (() => void) | null = null;
	readonly #room: Room | undefined;
	readonly attach: AttachProps;

	constructor(options: ResizeOptions & { room?: Room } = {}) {
		this.#room = options.room;
		// Two-way `size`/`position`: if the caller defined a setter, write the live value back to it
		// each move. The spread in `build` drops the accessor, so we write to the original `options`
		// object, which still owns the setter. Getter-only stays one-way. (A `w`/`n` resize moves the
		// top-left, so `position` tracks that shift in the same offset space as a draggable.)
		const size_two_way = Boolean(Object.getOwnPropertyDescriptor(options, 'size')?.set);
		const position_two_way = Boolean(Object.getOwnPropertyDescriptor(options, 'position')?.set);
		const sync = () => {
			if (!this.#instance) return;
			this.#size = this.#instance.size;
			this.#position = this.#instance.position;
		};
		const build = (): ResizeOptions => ({
			...options,
			onResizeStart: (e: ResizeEventData) => {
				this.#is_resizing = true;
				sync();
				options.onResizeStart?.(e);
			},
			onResize: (e: ResizeEventData) => {
				if (size_two_way) options.size = { width: e.width, height: e.height };
				if (position_two_way) options.position = { x: e.x, y: e.y };
				sync();
				options.onResize?.(e);
			},
			onResizeEnd: (e: ResizeEventData) => {
				this.#is_resizing = false;
				sync();
				options.onResizeEnd?.(e);
			},
		});

		this.attach = {
			[createAttachmentKey()]: (node: DndNode) => {
				this.#instance = new CoreResizable(node, untrack(build));
				if (this.#room) this.#room_off = this.#room.add(this.#instance, options.id);
				this.#size = this.#instance.size;
				this.#position = this.#instance.position;
				return () => {
					this.#room_off?.();
					this.#room_off = null;
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
		return this.#is_resizing;
	}

	get size(): { width: number; height: number } | undefined {
		return this.#size;
	}

	/** Live position offset (px) — the translate a `w`/`n` resize induced to pin the far edge. Same
	 * offset space as a draggable's `position`. */
	get position(): { x: number; y: number } | undefined {
		return this.#position;
	}

	/** Per-handle binding — spread onto a handle element (`{...resize.handle('se')}`) instead of
	 * hand-writing `data-neodrag-resize-handle`. `edge` is type-checked; iterate `RESIZE_EDGES`. */
	handle(edge: ResizeEdge): ResizeHandleProps {
		return { [RESIZE_HANDLE_ATTR]: edge };
	}
}

export {
	RESIZE_HANDLE_ATTR,
	RESIZE_EDGES,
	preserveUnits,
	type ResizeEdge,
	type ResizeEventData,
	type ResizeHandleProps,
	type ResizeOptions,
	type ResizeBoundsInput,
} from '@neodrag/core/resize';
