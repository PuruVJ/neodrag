import { Neodrag, type DragPluginList, type DropPluginList, type ResizePluginList } from '@neodrag/core';
import { type Directive } from 'vue';
import { Draggable, type DraggableOptions, type DragEventData } from './draggable.ts';
import { Droppable } from './droppable.ts';
import { Resizable } from './resizable-binding.ts';
import { useDraggable, type UseDraggableReturn } from './use-draggable.ts';
import { useDroppable, type UseDroppableReturn } from './use-droppable.ts';
import { useResizable, type UseResizableReturn } from './use-resizable.ts';

export type { DragPluginList, DropPluginList, ResizePluginList, DragEventData, DraggableOptions };
export type { UseDraggableReturn, UseDroppableReturn, UseResizableReturn };
export { Neodrag, Draggable, Droppable, Resizable };
export {
	NEODRAG_ATTACH_KEY,
	propsWithAttachment,
	bindingProps,
	toTargetBind,
	type NeodragElementProps,
	type NeodragTargetBind,
} from './attachments.ts';
export { createReactiveMarkup, ReactiveMarkupAdapter } from './markup.ts';
export { useDraggable, useDroppable, useResizable };

const CLEANUP = Symbol('neodrag.cleanup');
const HANDLE = Symbol('neodrag.handle');

type DragElementState = HTMLElement & {
	[CLEANUP]?: () => void;
	[HANDLE]?: Draggable;
};

function attachDraggable(el: DragElementState, binding: Draggable) {
	el[CLEANUP]?.();
	binding.attach(el);
	el[HANDLE] = binding;
	el[CLEANUP] = () => binding.detach();
}

export const vDraggable: Directive<DragElementState, Draggable | undefined> = {
	mounted(el, { value }) {
		const binding = value ?? new Draggable({ plugins: [] });
		attachDraggable(el, binding);
		if (binding.hasReactiveSlots) binding.flushReactive();
	},

	updated(el, { value, oldValue }) {
		if (value !== oldValue) {
			el[HANDLE]?.destroy();
			attachDraggable(el, value ?? new Draggable({ plugins: [] }));
			return;
		}
		el[HANDLE]?.flushReactive();
	},

	unmounted(el) {
		el[CLEANUP]?.();
		el[HANDLE]?.destroy();
		el[HANDLE] = undefined;
		el[CLEANUP] = undefined;
	},
};
