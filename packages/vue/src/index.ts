import {
	Draggable,
	DroppableBinding,
	Neodrag,
	hasReactiveSlots,
	type DragPluginList,
	type DropPluginList,
} from '@neodrag/core';
import { type Directive, type ShallowRef, onScopeDispose, shallowRef, watchEffect } from 'vue';

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

function attachDraggable(el: DragElementState, binding: Draggable) {
	el[CLEANUP]?.();
	binding.attach(el);
	el[HANDLE] = binding;
	el[CLEANUP] = () => binding.detach();
}

function attachDroppable(el: DropElementState, binding: DroppableBinding) {
	el[DROP_CLEANUP]?.();
	binding.attach(el);
	el[DROP_HANDLE] = binding;
	el[DROP_CLEANUP] = () => binding.detach();
}

export function useDraggable(
	bindingOrPlugins: Draggable | DragPluginList = [],
): ShallowRef<Draggable> {
	const binding = shallowRef(
		bindingOrPlugins instanceof Draggable
			? bindingOrPlugins
			: new Draggable({ plugins: bindingOrPlugins }),
	);

	watchEffect(() => {
		if (binding.value.hasReactiveSlots) binding.value.flushReactive();
	});

	onScopeDispose(() => binding.value.destroy());

	return binding;
}

export function useDroppable(
	bindingOrPlugins: DroppableBinding | DropPluginList = [],
): ShallowRef<DroppableBinding> {
	const binding = shallowRef(
		bindingOrPlugins instanceof DroppableBinding
			? bindingOrPlugins
			: new DroppableBinding({ plugins: bindingOrPlugins }),
	);

	watchEffect(() => {
		if (binding.value.hasReactiveSlots) binding.value.flushReactive();
	});

	onScopeDispose(() => binding.value.destroy());

	return binding;
}

export const vDraggable: Directive<DragElementState, Draggable | undefined> = {
	mounted(el, { value }) {
		attachDraggable(el, value ?? new Draggable({ plugins: [] }));
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

export const vDroppable: Directive<DropElementState, DroppableBinding | undefined> = {
	mounted(el, { value }) {
		attachDroppable(el, value ?? new DroppableBinding({ plugins: [] }));
	},

	updated(el, { value, oldValue }) {
		if (value !== oldValue) {
			el[DROP_HANDLE]?.destroy();
			attachDroppable(el, value ?? new DroppableBinding({ plugins: [] }));
			return;
		}
		el[DROP_HANDLE]?.flushReactive();
	},

	unmounted(el) {
		el[DROP_CLEANUP]?.();
		el[DROP_HANDLE]?.destroy();
		el[DROP_HANDLE] = undefined;
		el[DROP_CLEANUP] = undefined;
	},
};
