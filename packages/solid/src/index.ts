import { draggable, type DragOptions } from '@neodrag/svelte';
import { createEffect, onCleanup, onMount, type Accessor } from 'solid-js';

type UpdateRef = undefined | ((options: DragOptions) => void);

export const createDraggable = () => ({
	draggable: (node: HTMLElement | undefined, options: Accessor<DragOptions>) => {
		let updateRef: UpdateRef = undefined;

		onMount(() => {
			if (!node) return;

			const { update, destroy } = draggable(node, options());

			updateRef = update;

			onCleanup(destroy);
		});

		createEffect(() => updateRef?.(options()));
	},
});

export type {
	DragAxis,
	DragBounds,
	DragBoundsCoords,
	DragEventData,
	DragOptions,
} from '@neodrag/svelte';
