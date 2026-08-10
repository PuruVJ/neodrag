import { Droppable, type DropEventData, type DropOptions } from '@neodrag/core/drop';
import type { Room } from '@neodrag/core/collab';
import { createEffect, createSignal, onCleanup, type Accessor } from 'solid-js';
import type { Ref } from './_internal.ts';
import { useRoomBinding } from './_room-context.ts';

export function createDroppable(
	options: DropOptions & { room?: Room } = {},
): { ref: Ref; isOver: Accessor<boolean> } {
	const [isOver, set_over] = createSignal(false);
	let inst: Droppable | null = null;
	const { join, leave } = useRoomBinding(options.room);
	const build = (): DropOptions => ({
		...options,
		onEnter: (e: DropEventData) => {
			set_over(true);
			options.onEnter?.(e);
		},
		onLeave: (e: DropEventData) => {
			set_over(false);
			options.onLeave?.(e);
		},
	});
	const ref: Ref = (node) => {
		leave();
		inst?.destroy();
		inst = new Droppable(node, build());
		join(inst, options.id);
		onCleanup(() => {
			leave();
			inst?.destroy();
			inst = null;
		});
	};
	createEffect(() => {
		const next = build();
		inst?.update(next);
	});
	return { ref, isOver };
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
