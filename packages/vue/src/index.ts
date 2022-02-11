import { draggable, type DragOptions } from '@neodrag/svelte';
import { Ref, ref, watch } from 'vue';

type DragState = Parameters<Exclude<DragOptions['onDrag'], undefined>>[number];

export function useDraggable(node: Ref<HTMLElement | undefined>, options: DragOptions = {}) {
	const isDragging = ref(false);
	const dragState = ref<DragState>();

	let updateInternal: (options: DragOptions) => void;

	let { onDragStart, onDrag, onDragEnd } = options;

	function callEvent(arg: DragState, cb: DragOptions['onDrag']) {
		dragState.value = arg;
		cb?.(arg);
	}

	function customOnDragStart(arg: DragState) {
		isDragging.value = true;
		callEvent(arg, onDragStart);
	}

	function customOnDrag(arg: DragState) {
		callEvent(arg, onDrag);
	}

	function customOnDragEnd(arg: DragState) {
		isDragging.value = false;
		callEvent(arg, onDragEnd);
	}

	watch(node, () => {
		if (typeof window === 'undefined') return;
		if (!node?.value) return;

		({ onDragStart, onDrag, onDragEnd } = options);

		const { update, destroy } = draggable(node.value, {
			...options,
			onDragStart: customOnDragStart,
			onDrag: customOnDrag,
			onDragEnd: customOnDragEnd,
		});

		updateInternal = update;

		return destroy;
	});

	watch(options, () => {
		updateInternal?.({
			...options,
			onDragStart: customOnDragStart,
			onDrag: customOnDrag,
			onDragEnd: customOnDragEnd,
		});
	});

	return { isDragging, dragState };
}

export type { DragAxis, DragBounds, DragBoundsCoords, DragOptions } from '@neodrag/svelte';
