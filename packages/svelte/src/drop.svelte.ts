import { untrack } from 'svelte';
import { createAttachmentKey } from 'svelte/attachments';
import type { DndNode } from '@neodrag/core';
import { Droppable as CoreDroppable, type DropEventData, type DropOptions } from '@neodrag/core/drop';
import type { Room } from '@neodrag/core/collab';
import type { AttachProps } from './_internal.ts';

/**
 * Class-based reactive Svelte wrapper around the core `Droppable`. Exposes `isOver`. Pass an `id`
 * and a `room` to sync remote-hover presence (drop carries no op — only the hover syncs); auto-joins
 * on mount and leaves on unmount.
 */
export class Droppable {
	#is_over = $state(false);
	#instance: CoreDroppable | null = null;
	#room_off: (() => void) | null = null;
	readonly #room: Room | undefined;
	readonly attach: AttachProps;

	constructor(options: DropOptions & { room?: Room } = {}) {
		this.#room = options.room;
		const build = (): DropOptions => ({
			...options,
			onEnter: (e: DropEventData) => {
				this.#is_over = true;
				options.onEnter?.(e);
			},
			onLeave: (e: DropEventData) => {
				this.#is_over = false;
				options.onLeave?.(e);
			},
			onDrop: (e: DropEventData) => {
				this.#is_over = false;
				options.onDrop?.(e);
			},
		});

		this.attach = {
			[createAttachmentKey()]: (node: DndNode) => {
				this.#instance = new CoreDroppable(node, untrack(build));
				if (this.#room) this.#room_off = this.#room.add(this.#instance, options.id);
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

	get isOver(): boolean {
		return this.#is_over;
	}
}

export {
	REMOTE_HOVER_ATTR,
	REMOTE_HOVER_MARKER_ATTR,
	type DropEventData,
	type DropOptions,
	type DropAcceptCtx,
	type CollisionPolicy,
} from '@neodrag/core/drop';
