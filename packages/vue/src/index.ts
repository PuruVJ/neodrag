import { type Directive } from 'vue';
import { draggable, type DragOptions } from '@neodrag/core';

const draggable_map = new WeakMap<HTMLElement, ReturnType<typeof draggable>>();

export const vDraggable: Directive<HTMLElement, DragOptions | undefined> = {
	mounted: (el, { value = {} }) =>
		!draggable_map.has(el) && draggable_map.set(el, draggable(el, value)),

	updated: (el, { value = {} }) => draggable_map.get(el)!.update(value),

	unmounted: (el) => {
		draggable_map.get(el)!.destroy();
		draggable_map.delete(el);
	},
};

export type {
	DragAxis,
	DragBounds,
	DragBoundsCoords,
	DragOptions,
	DragEventData,
} from '@neodrag/core';
