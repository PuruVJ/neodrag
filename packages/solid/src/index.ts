import { Accessor, createSignal, onCleanup, onMount, createEffect, on } from 'solid-js';
import { DragEventData, draggable, DragOptions } from '@neodrag/svelte';

type DragState = DragEventData;

type updateRef = undefined | ((options: DragOptions) => void);

export const createDraggable = (
	node: Accessor<HTMLElement | undefined>,
	options: Accessor<DragOptions>
) => {
	let updateRef: updateRef = undefined;

	const [isDragging, setIsDragging] = createSignal(false);

	const [dragState, setDragState] = createSignal<DragState>();

	let { onDragStart, onDrag, onDragEnd } = options();

	function callEvent(arg: DragState, cb: DragOptions['onDrag']) {
		setDragState(arg);
		cb?.(arg);
	}

	function customOnDragStart(arg: DragState) {
		setIsDragging(true);
		callEvent(arg, onDragStart);
	}

	function customOnDrag(arg: DragState) {
		callEvent(arg, onDrag);
	}

	function customOnDragEnd(arg: DragState) {
		setIsDragging(false);
		callEvent(arg, onDragEnd);
	}

	onMount(() => {
		if (!node()) return;

		// Update callbacks
		({ onDragStart, onDrag, onDragEnd } = options());

		const { update, destroy } = draggable(node() as any, {
			...options(),
			onDragStart: customOnDragStart,
			onDrag: customOnDrag,
			onDragEnd: customOnDragEnd,
		});

		updateRef = update;

		onCleanup(() => {
			destroy();
		});
	});

	createEffect(
		on(
			options,
			(v) => {
				if (updateRef) {
					updateRef({
						...v,
						onDragStart: customOnDragStart,
						onDrag: customOnDrag,
						onDragEnd: customOnDragEnd,
					});
				}
			},
			{ defer: true }
		)
	);
	return { isDragging, dragState };
};

export type {
	DragAxis,
	DragBounds,
	DragBoundsCoords,
	DragOptions,
	DragEventData,
} from '@neodrag/svelte';
