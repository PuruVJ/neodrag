import { createDraggable } from '@neodrag/core';
import { Compartment, type PluginInput, type Plugin } from '@neodrag/core/plugins';
import type { Action } from 'svelte/action';
import { Attachment } from 'svelte/attachments';

const factory = createDraggable();

/** @deprecated Use `{@attach draggable}` instead */
export const legacyDraggable = factory.draggable as Action<
	HTMLElement | SVGElement,
	PluginInput | undefined
>;

export const wrapper = (factory: ReturnType<typeof createDraggable>) => {
	return (plugins: PluginInput | undefined): Attachment<HTMLElement> =>
		(element) => {
			return factory.draggable(element, plugins).destroy;
		};
};

export const draggable = wrapper(factory);

export * from '@neodrag/core/plugins';
export const instances = factory.instances;

export function createCompartment<T extends Plugin>(reactive: () => T) {
	let compartment = new Compartment(reactive);

	// @ts-ignore
	$effect.pre(() => {
		compartment.current = reactive();
	});

	return compartment;
}
