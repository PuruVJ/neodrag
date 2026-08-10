import { Droppable, type DropEventData, type DropOptions } from '@neodrag/core/drop';
import type { Room } from '@neodrag/core/collab';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefCallback } from './_internal.ts';
import { useRoomBinding } from './_room-context.ts';

export function useDroppable(
	options: DropOptions & { room?: Room } = {},
): { ref: RefCallback; isOver: boolean } {
	const instance = useRef<Droppable | null>(null);
	const opts = useRef(options);
	opts.current = options;
	const [isOver, set_over] = useState(false);
	const { join, leave } = useRoomBinding(options.room);

	const wrapped = useCallback(
		(): DropOptions => ({
			...opts.current,
			onEnter: (e: DropEventData) => {
				set_over(true);
				opts.current.onEnter?.(e);
			},
			onLeave: (e: DropEventData) => {
				set_over(false);
				opts.current.onLeave?.(e);
			},
		}),
		[],
	);

	const ref = useCallback<RefCallback>(
		(node) => {
			leave();
			instance.current?.destroy();
			if (node) {
				instance.current = new Droppable(node, wrapped());
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
