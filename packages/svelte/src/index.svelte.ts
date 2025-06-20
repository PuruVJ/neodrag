import type { DraggableFactory } from '@neodrag/core';
import {
	Compartment as CoreCompartment,
	type Plugin,
	type PluginInput,
} from '@neodrag/core/plugins';
import { Attachment } from 'svelte/attachments';
import { factory } from './shared';

export const wrapper = (factory: DraggableFactory) => {
	return (plugins?: PluginInput | undefined): Attachment<HTMLElement> =>
		(element) =>
			factory.draggable(element, plugins);
};

export const draggable = wrapper(factory);

export * from '@neodrag/core/plugins';
export const instances = factory.instances;

export class Compartment extends CoreCompartment {
	static of(reactive: () => Plugin) {
		const compartment = new CoreCompartment(reactive);

		// @ts-ignore
		$effect.pre(() => {
			compartment.current = reactive();
		});

		return compartment;
	}
}
