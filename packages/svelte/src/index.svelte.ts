import type { DraggableFactory } from '@neodrag/core';
import {
	Compartment as CoreCompartment,
	type Plugin,
	type PluginInput,
} from '@neodrag/core/plugins';
import { onDestroy } from 'svelte';
import { Attachment } from 'svelte/attachments';
import { factory } from './shared';

/**
 * Behaves the same as `$effect.root`, but automatically
 * cleans up the effect inside Svelte components.
 *
 * @returns Cleanup function to manually cleanup the effect.
 */
export function auto_destroy_effect_root(fn: () => void | VoidFunction) {
	let cleanup: VoidFunction | null = $effect.root(fn);

	function destroy() {
		if (cleanup === null) {
			return;
		}

		cleanup();
		cleanup = null;
	}

	try {
		onDestroy(destroy);
	} catch {}

	return destroy;
}

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

		auto_destroy_effect_root(() => {
			// @ts-ignore
			$effect.pre(() => {
				compartment.current = reactive();
			});
		});

		return compartment;
	}
}
