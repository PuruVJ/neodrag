import { draggable as coreDraggable, type DragEventData, type DragOptions } from '@neodrag/core';
import type { Action } from 'svelte/action';

export const draggable = coreDraggable as Action<
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
