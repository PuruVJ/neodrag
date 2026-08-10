import { createAttachmentKey } from 'svelte/attachments';
import { untrack } from 'svelte';
import type { DndNode } from '@neodrag/core';
import { SortableList as CoreSortableList, SORTABLE_KEY_ATTR, type SortableOptions } from '@neodrag/core/sortable';
import type { Room } from '@neodrag/core/collab';
import type { AttachProps } from './_internal.ts';

/**
 * Class-based reactive Svelte wrapper around the core `SortableList`. Spread `{...list.attach}` on
 * the container and `{...list.row(key)}` on each item — no hand-written `data-neodrag-sortable-key`.
 * Pass `items` (and any option) as a getter to keep it live.
 *
 * **Collab:** pass an `id` and a `room`; the list auto-joins that room on mount and leaves on
 * unmount — no `room.add` call needed.
 */
export class SortableList<T = unknown> {
	#instance: CoreSortableList<T> | null = null;
	#room_off: (() => void) | null = null;
	readonly #room: Room | undefined;
	readonly attach: AttachProps;
	// Attachments are cached per key so `{...list.row(id)}` hands Svelte the SAME attachment object
	// across renders — a fresh `createAttachmentKey()` each render would tear down and re-run the
	// registration on every update.
	readonly #row_attachments = new Map<string, AttachProps>();

	constructor(options: SortableOptions<T> & { room?: Room }) {
		this.#room = options.room;
		const build = (): SortableOptions<T> => ({ ...options });

		this.attach = {
			[createAttachmentKey()]: (node: DndNode) => {
				this.#instance = new CoreSortableList<T>(node as HTMLElement, untrack(build));
				// The core instance IS a CollabTarget — join the room (if any) once it exists; no buffering.
				if (this.#room) this.#room_off = this.#room.add(this.#instance, options.id);
				return () => {
					this.#room_off?.();
					this.#room_off = null;
					this.#instance?.destroy();
					this.#instance = null;
					this.#row_attachments.clear();
				};
			},
		};

		$effect(() => {
			const next = build();
			this.#instance?.update(next);
		});
	}

	/**
	 * Per-row binding — spread onto each item (`{...list.row(item.id)}`) instead of writing
	 * `data-neodrag-sortable-key` by hand. It's an attachment: on mount it registers the row with the
	 * list under its stable string key, and on removal it deregisters — so the list's view of its rows
	 * tracks the DOM exactly.
	 */
	row(key: string): AttachProps {
		let attachment = this.#row_attachments.get(key);
		if (!attachment) {
			attachment = {
				[createAttachmentKey()]: (node: DndNode) => {
					const el = node as HTMLElement;
					const off = this.#instance?.registerRow(el, key);
					// Instance not bound yet (row attached before container) — stamp the attr directly;
					// the engine reads it regardless, and the registry catches up on next mount.
					if (!off) el.setAttribute(SORTABLE_KEY_ATTR, key);
					return () => (off ? off() : el.removeAttribute(SORTABLE_KEY_ATTR));
				},
			};
			this.#row_attachments.set(key, attachment);
		}
		return attachment;
	}
}

export {
	SORTABLE_KEY_ATTR,
	type SortableOptions,
	type SortableRow,
	type TransferOp,
	type SortAxis,
	type SortStrategy,
	type MoveOp,
	type TransferContainer,
} from '@neodrag/core/sortable';
// `SortableOp` is a collab wire type — it lives under the collab grammar now.
export type { SortableOp } from '@neodrag/core/collab';
