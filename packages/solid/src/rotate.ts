import {
	Rotatable,
	ROTATE_HANDLE_ATTR,
	type RotateEventData,
	type RotateHandlePos,
	type RotateHandleProps,
	type RotateOptions,
} from '@neodrag/core/rotate';
import type { Room } from '@neodrag/core/collab';
import { createEffect, createSignal, onCleanup, type Accessor } from 'solid-js';
import type { Ref } from './_internal.ts';
import { useRoomBinding } from './_room-context.ts';

/**
 * Rotate primitive. Put `ref` on the element and spread `{...handle('top')}` on the rotate grip.
 * `angle` (degrees) + `isRotating` come back as accessors.
 *
 * **Collab:** pass an `id` (and a `room`, or mount a `<RoomProvider>`) and rotation syncs live.
 */
export function createRotatable(options: RotateOptions & { room?: Room } = {}): {
	ref: Ref;
	handle: (pos?: RotateHandlePos) => RotateHandleProps;
	isRotating: Accessor<boolean>;
	angle: Accessor<number>;
} {
	const [isRotating, set_rotating] = createSignal(false);
	const [angle, set_angle] = createSignal(0);
	let inst: Rotatable | null = null;
	const { join, leave } = useRoomBinding(options.room);
	const build = (): RotateOptions => ({
		...options,
		onRotateStart: (e: RotateEventData) => {
			set_rotating(true);
			set_angle(e.angle);
			options.onRotateStart?.(e);
		},
		onRotate: (e: RotateEventData) => {
			set_angle(e.angle);
			options.onRotate?.(e);
		},
		onRotateEnd: (e: RotateEventData) => {
			set_rotating(false);
			set_angle(e.angle);
			options.onRotateEnd?.(e);
		},
	});
	const ref: Ref = (node) => {
		leave();
		inst?.destroy();
		inst = new Rotatable(node, build());
		join(inst, options.id);
		onCleanup(() => {
			leave();
			inst?.destroy();
			inst = null;
		});
	};
	createEffect(() => {
		inst?.update(build());
	});
	return { ref, handle: (pos = 'top') => ({ [ROTATE_HANDLE_ATTR]: pos }), isRotating, angle };
}

export {
	Rotatable,
	ROTATE_HANDLE_ATTR,
	type RotateEventData,
	type RotateHandlePos,
	type RotateHandleProps,
	type RotateOptions,
	type RotateOrigin,
} from '@neodrag/core/rotate';
