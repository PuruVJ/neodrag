import { draggable, type DragOptions } from '@neodrag/svelte';
import { reactive, Ref, ref, toRefs, watch } from 'vue';

type Nullish<T> = {
	[key: string]: T[keyof T] | null;
};

type DragState = Parameters<Exclude<DragOptions['onDrag'], undefined>>[number];

export function useDraggable(node: Ref<HTMLElement | undefined>, options: DragOptions = {}) {
	const isDragging = ref(false);
	const dragState = reactive<Nullish<DragState>>({
		domRect: null,
		offsetX: null,
		offsetY: null,
	});
	const { domRect, offsetX, offsetY } = toRefs(dragState);

	let updateInternal: (options: DragOptions) => void;

	let { onDragStart, onDrag, onDragEnd } = options;

	function callEvent(arg: DragState, cb: DragOptions['onDrag']) {
		domRect.value = arg.domRect;
		offsetX.value = arg.offsetX;
		offsetY.value = arg.offsetY;
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

	const customEvents = {
		onDragStart: customOnDragStart,
		onDrag: customOnDrag,
		onDragEnd: customOnDragEnd,
	};

	watch(node, () => {
		if (typeof window === 'undefined') return;
		if (!node?.value) return;

		({ onDragStart, onDrag, onDragEnd } = options);

		const { update, destroy } = draggable(node.value, {
			...options,
			...customEvents,
		});

		updateInternal = update;

		return destroy;
	});

	watch(options, () => {
		updateInternal?.({
			...options,
			...customEvents,
		});
	});

	return { isDragging, domRect, offsetX, offsetY };
}

export type { DragAxis, DragBounds, DragBoundsCoords, DragOptions } from '@neodrag/svelte';
