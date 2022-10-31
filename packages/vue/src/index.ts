import { type Directive } from 'vue';
import { draggable, type DragOptions } from '@neodrag/core';

const draggableMap = new WeakMap<HTMLElement, ReturnType<typeof draggable>>();

export const vDraggable: Directive<HTMLElement, DragOptions | undefined> = {
	mounted: (el, { value = {} }) =>
		!draggableMap.has(el) && draggableMap.set(el, draggable(el, value)),

	updated: (el, { value = {} }) => draggableMap.get(el)!.update(value),

	unmounted: (el) => {
		draggableMap.get(el)!.destroy();
		draggableMap.delete(el);
	},
};

export type {
	DragAxis,
	DragBounds,
	DragBoundsCoords,
	DragOptions,
	DragEventData,
} from '@neodrag/core';
