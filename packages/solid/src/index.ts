import { draggable, type DragOptions } from '@neodrag/core';
import { createEffect, onCleanup, type Accessor } from 'solid-js';

export const createDraggable = () => ({
	draggable: (node: HTMLElement, options: Accessor<DragOptions>) => {
		const { update, destroy } = draggable(node, options());

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
} from '@neodrag/core';
