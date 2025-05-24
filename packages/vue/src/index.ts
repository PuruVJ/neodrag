import { createDraggable } from '@neodrag/core';
import { Compartment, Plugin, type PluginInput } from '@neodrag/core/plugins';
import { onUnmounted, watchEffect, type Directive } from 'vue';

const factory = createDraggable();

const draggable_map = new WeakMap<HTMLElement | SVGElement, ReturnType<typeof factory.draggable>>();

export const wrapper = (
	factory: ReturnType<typeof createDraggable>,
): Directive<HTMLElement | SVGElement, PluginInput | undefined> => {
	return {
		mounted: (el, { value = [] }) =>
			!draggable_map.has(el) && draggable_map.set(el, factory.draggable(el, value)),

		unmounted: (el) => {
			draggable_map.get(el)!.destroy();
			draggable_map.delete(el);
		},
	};
};

export function useCompartment<T extends Plugin>(reactive: () => T) {
	const compartment = new Compartment(reactive);

	const stop_watcher = watchEffect(() => (compartment.current = reactive()), {
		flush: 'pre',
	});

	// Cleanup on unmount
	onUnmounted(() => {
		stop_watcher();
	});

	return compartment;
}

export const vDraggable = wrapper(factory);
export const instances = factory.instances;
export * from '@neodrag/core/plugins';
