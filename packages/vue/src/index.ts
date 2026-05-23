import { Neodrag, Compartment, type DragPluginInput } from '@neodrag/core';
import { onUnmounted, watchEffect, type Directive } from 'vue';

const engine = Neodrag.shared;
const CLEANUP = Symbol('neodrag.cleanup');

export const vDraggable: Directive<HTMLElement | SVGElement, DragPluginInput | undefined> = {
	mounted(el, { value = [] }) {
		const handle = engine.draggable(el, value);
		(el as HTMLElement & { [CLEANUP]?: () => void })[CLEANUP] = () => handle.destroy();
	},

	unmounted(el) {
		(el as HTMLElement & { [CLEANUP]?: () => void })[CLEANUP]?.();
	},
};

export function useCompartment(reactive: ConstructorParameters<typeof Compartment>[0]) {
	const compartment = new Compartment(reactive);

	const stop = watchEffect(() => {
		compartment.current = reactive?.();
	}, { flush: 'pre' });

	onUnmounted(stop);

	return compartment;
}

export * from '@neodrag/core/plugins';
export { Compartment, Neodrag };
