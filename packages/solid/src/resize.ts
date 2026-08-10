import {
	Resizable,
	RESIZE_HANDLE_ATTR,
	type ResizeEdge,
	type ResizeEventData,
	type ResizeHandleProps,
	type ResizeOptions,
} from '@neodrag/core/resize';
import type { Room } from '@neodrag/core/collab';
import { createEffect, createSignal, onCleanup, type Accessor } from 'solid-js';
import type { Ref } from './_internal.ts';
import { useRoomBinding } from './_room-context.ts';

export function createResizable(options: ResizeOptions & { room?: Room } = {}): {
	ref: Ref;
	handle: (edge: ResizeEdge) => ResizeHandleProps;
	isResizing: Accessor<boolean>;
	size: Accessor<{ width: number; height: number } | undefined>;
	position: Accessor<{ x: number; y: number } | undefined>;
} {
	const [isResizing, set_resizing] = createSignal(false);
	const [size, set_size] = createSignal<{ width: number; height: number } | undefined>(undefined);
	// A `w`/`n` resize moves the top-left to pin the far edge; `position` reports that shift in the
	// same offset space as a draggable's `position`. Drive it back via a controlled `position` option.
	const [position, set_position] = createSignal<{ x: number; y: number } | undefined>(undefined);
	let inst: Resizable | null = null;
	const { join, leave } = useRoomBinding(options.room);
	const build = (): ResizeOptions => ({
		...options,
		onResizeStart: (e: ResizeEventData) => {
			set_resizing(true);
			set_size({ width: e.width, height: e.height });
			set_position({ x: e.x, y: e.y });
			options.onResizeStart?.(e);
		},
		onResize: (e: ResizeEventData) => {
			set_size({ width: e.width, height: e.height });
			set_position({ x: e.x, y: e.y });
			options.onResize?.(e);
		},
		onResizeEnd: (e: ResizeEventData) => {
			set_resizing(false);
			set_size({ width: e.width, height: e.height });
			set_position({ x: e.x, y: e.y });
			options.onResizeEnd?.(e);
		},
	});
	const ref: Ref = (node) => {
		leave();
		inst?.destroy();
		inst = new Resizable(node, build());
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
