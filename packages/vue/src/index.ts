import { Neodrag, type DragPluginInput, type DropPluginInput } from '@neodrag/core';
import { type Directive } from 'vue';

const engine = Neodrag.shared;
const CLEANUP = Symbol('neodrag.cleanup');
const HANDLE = Symbol('neodrag.handle');
const DROP_CLEANUP = Symbol('neodrag.drop.cleanup');
const DROP_HANDLE = Symbol('neodrag.drop.handle');

export type ReactiveDragPluginInput = DragPluginInput;
export type ReactiveDropPluginInput = DropPluginInput;

function resolveDragPlugins(plugins: DragPluginInput | undefined) {
	if (!plugins) return [];
	return typeof plugins === 'function' ? plugins() : plugins;
}

function resolveDropPlugins(plugins: DropPluginInput | undefined) {
	if (!plugins) return [];
	return typeof plugins === 'function' ? plugins() : plugins;
}

type DragElementState = HTMLElement & {
	[CLEANUP]?: () => void;
	[HANDLE]?: ReturnType<typeof engine.draggable>;
};

type DropElementState = HTMLElement & {
	[DROP_CLEANUP]?: () => void;
	[DROP_HANDLE]?: ReturnType<typeof engine.droppable>;
};

export const vDraggable: Directive<DragElementState, ReactiveDragPluginInput | undefined> = {
	mounted(el, { value }) {
		const handle = engine.draggable(el, resolveDragPlugins(value));
		el[HANDLE] = handle;
		el[CLEANUP] = () => handle.destroy();
	},

	updated(el, { value }) {
		el[HANDLE]?.update(resolveDragPlugins(value));
	},

	unmounted(el) {
		el[CLEANUP]?.();
		el[HANDLE] = undefined;
		el[CLEANUP] = undefined;
	},
};

export const vDroppable: Directive<DropElementState, ReactiveDropPluginInput | undefined> = {
	mounted(el, { value }) {
		const handle = engine.droppable(el, resolveDropPlugins(value));
		el[DROP_HANDLE] = handle;
		el[DROP_CLEANUP] = () => handle.destroy();
	},

	updated(el, { value }) {
		el[DROP_HANDLE]?.update(resolveDropPlugins(value));
	},

	unmounted(el) {
		el[DROP_CLEANUP]?.();
		el[DROP_HANDLE] = undefined;
		el[DROP_CLEANUP] = undefined;
	},
};

export { Neodrag };
