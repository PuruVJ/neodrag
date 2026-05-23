import { Neodrag, type DragPluginInput } from '@neodrag/core';
import { type Directive } from 'vue';

const engine = Neodrag.shared;
const CLEANUP = Symbol('neodrag.cleanup');
const HANDLE = Symbol('neodrag.handle');

export type ReactiveDragPluginInput = DragPluginInput | (() => DragPluginInput);

function resolvePlugins(plugins: ReactiveDragPluginInput | undefined): DragPluginInput {
	if (!plugins) return [];
	return typeof plugins === 'function' ? plugins() : plugins;
}

type ElementState = HTMLElement & {
	[CLEANUP]?: () => void;
	[HANDLE]?: ReturnType<typeof engine.draggable>;
};

export const vDraggable: Directive<ElementState, ReactiveDragPluginInput | undefined> = {
	mounted(el, { value }) {
		const handle = engine.draggable(el, resolvePlugins(value));
		el[HANDLE] = handle;
		el[CLEANUP] = () => handle.destroy();
	},

	updated(el, { value }) {
		el[HANDLE]?.update(resolvePlugins(value));
	},

	unmounted(el) {
		el[CLEANUP]?.();
		el[HANDLE] = undefined;
		el[CLEANUP] = undefined;
	},
};

export { Neodrag };
