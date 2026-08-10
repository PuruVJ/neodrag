import { untrack } from 'svelte';
import { createAttachmentKey } from 'svelte/attachments';
import type { DndNode } from '@neodrag/core';
import {
	Rotatable as CoreRotatable,
	ROTATE_HANDLE_ATTR,
	type RotateEventData,
	type RotateHandlePos,
	type RotateHandleProps,
	type RotateOptions,
} from '@neodrag/core/rotate';
import type { Room } from '@neodrag/core/collab';
import type { AttachProps } from './_internal.ts';

/**
 * Class-based reactive Svelte wrapper around the core `Rotatable`. Exposes `isRotating` + `angle`.
 * Collab: pass an `id` and a `room` option to auto-join.
 */
export class Rotatable {
	#is_rotating = $state(false);
	#angle = $state(0);
	#instance: CoreRotatable | null = null;
	#room_off: (() => void) | null = null;
	readonly #room: Room | undefined;
	readonly attach: AttachProps;

	constructor(options: RotateOptions & { room?: Room } = {}) {
		this.#room = options.room;
		// Two-way `angle`: if the caller defined a setter, write the live angle back each move. The
		// spread in `build` drops the accessor, so we write to the original `options`, which owns it.
		const angle_two_way = Boolean(Object.getOwnPropertyDescriptor(options, 'angle')?.set);
		const sync = () => {
			if (this.#instance) this.#angle = this.#instance.angle;
		};
		const build = (): RotateOptions => ({
			...options,
			onRotateStart: (e: RotateEventData) => {
				this.#is_rotating = true;
				sync();
				options.onRotateStart?.(e);
			},
			onRotate: (e: RotateEventData) => {
				if (angle_two_way) options.angle = e.angle;
				sync();
				options.onRotate?.(e);
			},
			onRotateEnd: (e: RotateEventData) => {
				this.#is_rotating = false;
				sync();
				options.onRotateEnd?.(e);
			},
		});

		this.attach = {
			[createAttachmentKey()]: (node: DndNode) => {
				this.#instance = new CoreRotatable(node, untrack(build));
				if (this.#room) this.#room_off = this.#room.add(this.#instance, options.id);
				this.#angle = this.#instance.angle;
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

	get isRotating(): boolean {
		return this.#is_rotating;
	}

	get angle(): number {
		return this.#angle;
	}

	/** Per-handle binding — spread onto the rotate grip (`{...rotate.handle('top')}`) instead of
	 * hand-writing `data-neodrag-rotate-handle`. */
	handle(pos: RotateHandlePos = 'top'): RotateHandleProps {
		return { [ROTATE_HANDLE_ATTR]: pos };
	}
}

export {
	ROTATE_HANDLE_ATTR,
	type RotateEventData,
	type RotateHandlePos,
	type RotateHandleProps,
	type RotateOptions,
	type RotateOrigin,
} from '@neodrag/core/rotate';
