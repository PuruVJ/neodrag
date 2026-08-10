import {
	Resizable,
	RESIZE_HANDLE_ATTR,
	type ResizeEdge,
	type ResizeEventData,
	type ResizeHandleProps,
	type ResizeOptions,
} from '@neodrag/core/resize';
import type { Room } from '@neodrag/core/collab';
import { onScopeDispose, ref, watch, watchEffect, type Ref } from 'vue';
import { useRoomBinding } from './_room-context.ts';

export function useResizable(options: ResizeOptions & { room?: Room } = {}): {
	ref: Ref<HTMLElement | null>;
	handle: (edge: ResizeEdge) => ResizeHandleProps;
	isResizing: Ref<boolean>;
	size: Ref<{ width: number; height: number } | undefined>;
	position: Ref<{ x: number; y: number } | undefined>;
} {
	const target = ref<HTMLElement | null>(null);
	const isResizing = ref(false);
	const size = ref<{ width: number; height: number } | undefined>(undefined);
	// A `w`/`n` resize moves the top-left to pin the far edge; `position` reports that shift in the
	// same offset space as a draggable's `position`. Drive it back via a controlled `position` option.
	const position = ref<{ x: number; y: number } | undefined>(undefined);
	let inst: Resizable | null = null;
	const { join, leave } = useRoomBinding(options.room);
	const build = (): ResizeOptions => ({
		...options,
		onResizeStart: (e: ResizeEventData) => {
			isResizing.value = true;
			size.value = { width: e.width, height: e.height };
			position.value = { x: e.x, y: e.y };
			options.onResizeStart?.(e);
		},
		onResize: (e: ResizeEventData) => {
			size.value = { width: e.width, height: e.height };
			position.value = { x: e.x, y: e.y };
			options.onResize?.(e);
		},
		onResizeEnd: (e: ResizeEventData) => {
			isResizing.value = false;
			size.value = { width: e.width, height: e.height };
			position.value = { x: e.x, y: e.y };
			options.onResizeEnd?.(e);
		},
	});

	watch(target, (node) => {
		leave();
		inst?.destroy();
		if (node) {
			inst = new Resizable(node, build());
			join(inst, options.id);
		} else {
			inst = null;
		}
	});
	watchEffect(() => {
		inst?.update(build());
	});
	onScopeDispose(() => inst?.destroy());

	return {
		ref: target,
		handle: (edge) => ({ [RESIZE_HANDLE_ATTR]: edge }),
		isResizing,
		size,
		position,
	};
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
