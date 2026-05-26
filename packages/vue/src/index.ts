import {
	Draggable,
	DroppableBinding,
	Resizable,
	Neodrag,
	hasReactiveSlots,
	type DragPluginList,
	type DropPluginList,
	type ResizeApplier,
	type ResizePluginList,
} from '@neodrag/core';
import { type Directive, type ShallowRef, onScopeDispose, shallowRef, watchEffect } from 'vue';

export type { DragPluginList, DropPluginList, ResizeApplier, ResizePluginList };
export { Neodrag, Draggable, DroppableBinding as Droppable, Resizable };

const CLEANUP = Symbol('neodrag.cleanup');
const HANDLE = Symbol('neodrag.handle');
const DROP_CLEANUP = Symbol('neodrag.drop.cleanup');
const DROP_HANDLE = Symbol('neodrag.drop.handle');
const RESIZE_CLEANUP = Symbol('neodrag.resize.cleanup');
const RESIZE_HANDLE = Symbol('neodrag.resize.handle');

type DragElementState = HTMLElement & {
	[CLEANUP]?: () => void;
	[HANDLE]?: Draggable;
};

type DropElementState = HTMLElement & {
	[DROP_CLEANUP]?: () => void;
	[DROP_HANDLE]?: DroppableBinding;
};

type ResizeElementState = HTMLElement & {
	[RESIZE_CLEANUP]?: () => void;
	[RESIZE_HANDLE]?: Resizable;
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

function attachResizable(el: ResizeElementState, binding: Resizable) {
	el[RESIZE_CLEANUP]?.();
	binding.attach(el);
	el[RESIZE_HANDLE] = binding;
	el[RESIZE_CLEANUP] = () => binding.detach();
}

export function useResizable(
	bindingOrPlugins: Resizable | ResizePluginList = [],
): ShallowRef<Resizable> {
	const binding = shallowRef(
		bindingOrPlugins instanceof Resizable
			? bindingOrPlugins
			: new Resizable({ plugins: bindingOrPlugins }),
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

export const vResizable: Directive<ResizeElementState, Resizable | undefined> = {
	mounted(el, { value }) {
		attachResizable(el, value ?? new Resizable({ plugins: [] }));
	},

	updated(el, { value, oldValue }) {
		if (value !== oldValue) {
			el[RESIZE_HANDLE]?.destroy();
			attachResizable(el, value ?? new Resizable({ plugins: [] }));
			return;
		}
		el[RESIZE_HANDLE]?.flushReactive();
	},

	unmounted(el) {
		el[RESIZE_CLEANUP]?.();
		el[RESIZE_HANDLE]?.destroy();
		el[RESIZE_HANDLE] = undefined;
		el[RESIZE_CLEANUP] = undefined;
	},
};
