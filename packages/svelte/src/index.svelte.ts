import { createDraggable } from '@neodrag/core';
import { Compartment, type PluginInput, type Plugin } from '@neodrag/core/plugins';
import type { Action } from 'svelte/action';
import { Attachment } from 'svelte/attachments';

const { draggable: core, instances } = createDraggable();

/** @deprecated Use `{@attach draggable}` instead */
export const legacyDraggable = core as Action<HTMLElement | SVGElement, PluginInput | undefined>;

export const draggable =
	(plugins: PluginInput | undefined): Attachment<HTMLElement> =>
	(element) => {
		core(element, plugins).destroy;
	};

export * from '@neodrag/core/plugins';
export { instances };

export function createCompartment<T extends Plugin>(reactive: () => T) {
	let compartment = new Compartment(reactive);

	// @ts-ignore
	$effect.pre(() => {
		compartment.current = reactive();
	});

	return compartment;
}
