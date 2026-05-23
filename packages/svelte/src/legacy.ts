import { PluginInput } from '@neodrag/core/plugins';
import type { Action } from 'svelte/action';
import { Neodrag } from './index.svelte';

/** @deprecated Use `{@attach draggable}` instead */
export const legacyDraggable: Action<HTMLElement | SVGElement, PluginInput | undefined> = (
	node: HTMLElement | SVGElement,
	args?: PluginInput,
) => {
	const cleanup = Neodrag.shared.bind(node, args ?? []);

	return {
		destroy() {
			cleanup();
		},
	};
};

export * from '@neodrag/core/plugins';
