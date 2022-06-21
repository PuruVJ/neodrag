import { draggable, type DragOptions } from '@neodrag/svelte';
import { createEffect, onCleanup, type Accessor } from 'solid-js';

export const createDraggable = () => ({
	draggable: (node: HTMLElement | undefined, options: Accessor<DragOptions>) => {
		const { update, destroy } = draggable(node!, options());

		onCleanup(destroy);
		createEffect(() => update(options()));
	},
});

export type {
	DragAxis,
	DragBounds,
	DragBoundsCoords,
	DragEventData,
	DragOptions,
} from '@neodrag/svelte';
