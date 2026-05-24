import { Draggable, DroppableBinding, Neodrag, type DragPluginList, type DropPluginList } from '@neodrag/core';
import { type Directive } from 'vue';

export type { DragPluginList, DropPluginList };
export { Neodrag, Draggable, DroppableBinding as Droppable };

const CLEANUP = Symbol('neodrag.cleanup');
const HANDLE = Symbol('neodrag.handle');
const DROP_CLEANUP = Symbol('neodrag.drop.cleanup');
const DROP_HANDLE = Symbol('neodrag.drop.handle');

type DragElementState = HTMLElement & {
	[CLEANUP]?: () => void;
	[HANDLE]?: Draggable;
};

type DropElementState = HTMLElement & {
	[DROP_CLEANUP]?: () => void;
	[DROP_HANDLE]?: DroppableBinding;
};

export const vDraggable: Directive<DragElementState, Draggable | undefined> = {
	mounted(el, { value }) {
		const binding = value ?? new Draggable({ plugins: [] });
		binding.attach(el);
		el[HANDLE] = binding;
		el[CLEANUP] = () => binding.detach();
	},

	updated(el) {
		el[HANDLE]?.flushReactive();
	},

	unmounted(el) {
		el[CLEANUP]?.();
		el[HANDLE]?.destroy();
		el[HANDLE] = undefined;
		el[CLEANUP] = undefined;
	},
};

export const vDroppable: Directive<DropElementState, DroppableBinding | undefined> = {
	mounted(el, { value }) {
		const binding = value ?? new DroppableBinding({ plugins: [] });
		binding.attach(el);
		el[DROP_HANDLE] = binding;
		el[DROP_CLEANUP] = () => binding.detach();
	},

	updated(el) {
		el[DROP_HANDLE]?.flushReactive();
	},

	unmounted(el) {
		el[DROP_CLEANUP]?.();
		el[DROP_HANDLE]?.destroy();
		el[DROP_HANDLE] = undefined;
		el[DROP_CLEANUP] = undefined;
	},
};
