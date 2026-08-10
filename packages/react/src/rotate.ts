import {
	Rotatable,
	ROTATE_HANDLE_ATTR,
	type RotateEventData,
	type RotateHandlePos,
	type RotateHandleProps,
	type RotateOptions,
} from '@neodrag/core/rotate';
import type { Room } from '@neodrag/core/collab';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefCallback } from './_internal.ts';
import { useRoomBinding } from './_room-context.ts';

/**
 * Rotate hook. Put `ref` on the element and spread `{...handle('top')}` on the rotate grip. `angle`
 * (degrees) and `isRotating` come back as state.
 *
 * **Collab:** pass an `id` (and a `room`, or mount a `<RoomProvider>`) and rotation syncs live.
 */
export function useRotatable(options: RotateOptions & { room?: Room } = {}): {
	ref: RefCallback;
	handle: (pos?: RotateHandlePos) => RotateHandleProps;
	isRotating: boolean;
	angle: number;
} {
	const instance = useRef<Rotatable | null>(null);
	const opts = useRef(options);
	opts.current = options;
	const [isRotating, set_rotating] = useState(false);
	const [angle, set_angle] = useState(0);
	const { join, leave } = useRoomBinding(options.room);

	const wrapped = useCallback(
		(): RotateOptions => ({
			...opts.current,
			onRotateStart: (e: RotateEventData) => {
				set_rotating(true);
				set_angle(e.angle);
				opts.current.onRotateStart?.(e);
			},
			onRotate: (e: RotateEventData) => {
				set_angle(e.angle);
				opts.current.onRotate?.(e);
			},
			onRotateEnd: (e: RotateEventData) => {
				set_rotating(false);
				set_angle(e.angle);
				opts.current.onRotateEnd?.(e);
			},
		}),
		[],
	);

	const ref = useCallback<RefCallback>(
		(node) => {
			leave();
			instance.current?.destroy();
			if (node) {
				instance.current = new Rotatable(node, wrapped());
				join(instance.current, opts.current.id);
			} else {
				instance.current = null;
			}
		},
		[wrapped, join, leave],
	);

	useEffect(() => {
		instance.current?.update(wrapped());
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
