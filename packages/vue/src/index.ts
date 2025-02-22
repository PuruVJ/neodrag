import { createDraggable } from '@neodrag/core';
import type { PluginInput } from '@neodrag/core/plugins';
import { type Directive } from 'vue';

const factory = createDraggable();

const draggable_map = new WeakMap<HTMLElement | SVGElement, ReturnType<typeof factory.draggable>>();

export const wrapper = (
	factory: ReturnType<typeof createDraggable>,
): Directive<HTMLElement | SVGElement, PluginInput | undefined> => {
	return {
		mounted: (el, { value = [] }) =>
			!draggable_map.has(el) && draggable_map.set(el, factory.draggable(el, value)),

		updated: (el, { value = [] }) => draggable_map.get(el)!.update(value),

		unmounted: (el) => {
			draggable_map.get(el)!.destroy();
			draggable_map.delete(el);
		},
	};
};

export const vDraggable = wrapper(factory);
export const instances = factory.instances;
export * from '@neodrag/core/plugins';
