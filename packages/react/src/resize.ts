import {
	Resizable,
	RESIZE_HANDLE_ATTR,
	type ResizeEdge,
	type ResizeEventData,
	type ResizeHandleProps,
	type ResizeOptions,
} from '@neodrag/core/resize';
import type { Room } from '@neodrag/core/collab';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefCallback } from './_internal.ts';
import { useRoomBinding } from './_room-context.ts';

export function useResizable(options: ResizeOptions & { room?: Room } = {}): {
	ref: RefCallback;
	handle: (edge: ResizeEdge) => ResizeHandleProps;
	isResizing: boolean;
	size: { width: number; height: number } | undefined;
	position: { x: number; y: number } | undefined;
} {
	const instance = useRef<Resizable | null>(null);
	const opts = useRef(options);
	opts.current = options;
	const [isResizing, set_resizing] = useState(false);
	const [size, set_size] = useState<{ width: number; height: number } | undefined>(undefined);
	// A `w`/`n` resize moves the top-left to pin the far edge; `position` reports that shift in the
	// same offset space as a draggable's `position`. Drive it back via a controlled `position` prop.
	const [position, set_position] = useState<{ x: number; y: number } | undefined>(undefined);
	const { join, leave } = useRoomBinding(options.room);

	const wrapped = useCallback(
		(): ResizeOptions => ({
			...opts.current,
			onResizeStart: (e: ResizeEventData) => {
				set_resizing(true);
				set_size({ width: e.width, height: e.height });
				set_position({ x: e.x, y: e.y });
				opts.current.onResizeStart?.(e);
			},
			onResize: (e: ResizeEventData) => {
				set_size({ width: e.width, height: e.height });
				set_position({ x: e.x, y: e.y });
				opts.current.onResize?.(e);
			},
			onResizeEnd: (e: ResizeEventData) => {
				set_resizing(false);
				set_size({ width: e.width, height: e.height });
				set_position({ x: e.x, y: e.y });
				opts.current.onResizeEnd?.(e);
			},
		}),
		[],
	);

	const ref = useCallback<RefCallback>(
		(node) => {
			leave();
			instance.current?.destroy();
			if (node) {
				instance.current = new Resizable(node, wrapped());
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

	return { ref, handle: (edge) => ({ [RESIZE_HANDLE_ATTR]: edge }), isResizing, size, position };
}

export {
	Resizable,
	RESIZE_HANDLE_ATTR,
	RESIZE_EDGES,
	preserveUnits,
	type ResizeEdge,
	type ResizeEventData,
	type ResizeHandleProps,
	type ResizeOptions,
	type ResizeBoundsInput,
} from '@neodrag/core/resize';
