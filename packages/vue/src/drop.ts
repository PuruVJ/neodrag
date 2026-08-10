import { Droppable, type DropEventData, type DropOptions } from '@neodrag/core/drop';
import type { Room } from '@neodrag/core/collab';
import { onScopeDispose, ref, watch, watchEffect, type Ref } from 'vue';
import { useRoomBinding } from './_room-context.ts';

export function useDroppable(options: DropOptions & { room?: Room } = {}): {
	ref: Ref<HTMLElement | null>;
	isOver: Ref<boolean>;
} {
	const target = ref<HTMLElement | null>(null);
	const isOver = ref(false);
	let inst: Droppable | null = null;
	const { join, leave } = useRoomBinding(options.room);
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
		leave();
		inst?.destroy();
		if (node) {
			inst = new Droppable(node, build());
			join(inst, options.id);
		} else {
			inst = null;
		}
	});
	watchEffect(() => {
		const next = build();
		inst?.update(next);
	});
	onScopeDispose(() => inst?.destroy());

	return { ref: target, isOver };
}

export {
	Droppable,
	REMOTE_HOVER_ATTR,
	REMOTE_HOVER_MARKER_ATTR,
	type DropEventData,
	type DropOptions,
	type DropAcceptCtx,
	type CollisionPolicy,
} from '@neodrag/core/drop';
