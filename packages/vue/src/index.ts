import { DEFAULTS, DraggableFactory } from '@neodrag/core';
import { Compartment, Plugin, type PluginInput } from '@neodrag/core/plugins';
import { onUnmounted, watchEffect, type Directive } from 'vue';

const factory = new DraggableFactory(DEFAULTS);
const CLEANUP = Symbol();

export const wrapper = (
	factory: DraggableFactory,
): Directive<HTMLElement | SVGElement, PluginInput | undefined> => {
	return {
		mounted: (el, { value = [] }) => {
			(el as any)[CLEANUP] = factory.draggable(el, value);
		},

		unmounted: (el) => (el as any)[CLEANUP](),
	};
};

export function useCompartment<T extends Plugin>(reactive: () => T) {
	const compartment = new Compartment(reactive);

	const stop_watcher = watchEffect(() => (compartment.current = reactive()), {
		flush: 'pre',
	});

	onUnmounted(stop_watcher);

	return compartment;
}

export const vDraggable = wrapper(factory);
export const instances = factory.instances;
export * from '@neodrag/core/plugins';
