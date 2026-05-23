import { Neodrag } from './index.svelte.ts';

/** @deprecated Use `Neodrag.shared` */
export const factory = {
	draggable: (node: HTMLElement | SVGElement, plugins?: import('@neodrag/core/plugins').PluginInput) =>
		Neodrag.shared.bind(node, plugins ?? []),
	get instances() {
		return Neodrag.shared.instances;
	},
};
