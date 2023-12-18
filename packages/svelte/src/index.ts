import { draggable as coreDraggable, type DragEventData, type DragOptions } from '@neodrag/core';

export const draggable = coreDraggable as import('svelte/action').Action<
	HTMLElement,
	DragOptions,
	{
		'on:neodrag:start': (e: CustomEvent<DragEventData>) => void;
		'on:neodrag': (e: CustomEvent<DragEventData>) => void;
		'on:neodrag:end': (e: CustomEvent<DragEventData>) => void;
	}
>;

export type {
	DragAxis,
	DragBounds,
	DragBoundsCoords,
	DragEventData,
	DragOptions,
} from '@neodrag/core';
