import type { createDraggable } from '@neodrag/core';
import {
	Compartment as CoreCompartment,
	type Plugin,
	type PluginInput,
} from '@neodrag/core/plugins';
import { Attachment } from 'svelte/attachments';
import { factory } from './shared';

export const wrapper = (factory: ReturnType<typeof createDraggable>) => {
	return (plugins: PluginInput | undefined): Attachment<HTMLElement> =>
		(element) => {
			return factory.draggable(element, plugins).destroy;
		};
};

export const draggable = wrapper(factory);

export * from '@neodrag/core/plugins';
export const instances = factory.instances;

export class Compartment<T extends Plugin<any>> extends CoreCompartment<T> {
	static of<T extends Plugin>(reactive: () => T) {
		const compartment = new CoreCompartment(reactive);

		// @ts-ignore
		$effect.pre(() => {
			compartment.current = reactive();
		});

		return compartment;
	}
}
