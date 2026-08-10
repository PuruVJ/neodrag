import {
	Rotatable,
	ROTATE_HANDLE_ATTR,
	type RotateEventData,
	type RotateHandlePos,
	type RotateHandleProps,
	type RotateOptions,
} from '@neodrag/core/rotate';
import type { Room } from '@neodrag/core/collab';
import { onScopeDispose, ref, watch, watchEffect, type Ref } from 'vue';
import { useRoomBinding } from './_room-context.ts';

/**
 * Rotate composable. Bind `:ref="ref"` on the element and `v-bind="handle('top')"` on the grip.
 * `angle` (degrees) + `isRotating` come back as refs.
 *
 * **Collab:** pass an `id` (and a `room`, or call `provideRoom()` in an ancestor) and rotation syncs.
 */
export function useRotatable(options: RotateOptions & { room?: Room } = {}): {
	ref: Ref<HTMLElement | null>;
	handle: (pos?: RotateHandlePos) => RotateHandleProps;
	isRotating: Ref<boolean>;
	angle: Ref<number>;
} {
	const target = ref<HTMLElement | null>(null);
	const isRotating = ref(false);
	const angle = ref(0);
	let inst: Rotatable | null = null;
	const { join, leave } = useRoomBinding(options.room);
	const build = (): RotateOptions => ({
		...options,
		onRotateStart: (e: RotateEventData) => {
			isRotating.value = true;
			angle.value = e.angle;
			options.onRotateStart?.(e);
		},
		onRotate: (e: RotateEventData) => {
			angle.value = e.angle;
			options.onRotate?.(e);
		},
		onRotateEnd: (e: RotateEventData) => {
			isRotating.value = false;
			angle.value = e.angle;
			options.onRotateEnd?.(e);
		},
	});

	watch(target, (node) => {
		leave();
		inst?.destroy();
		if (node) {
			inst = new Rotatable(node, build());
			join(inst, options.id);
		} else {
			inst = null;
		}
	});
	watchEffect(() => {
		inst?.update(build());
	});
	onScopeDispose(() => inst?.destroy());

	return { ref: target, handle: (pos = 'top') => ({ [ROTATE_HANDLE_ATTR]: pos }), isRotating, angle };
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
