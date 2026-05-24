import {
	Neodrag,
	type DragPlugin,
	type DragPluginInput,
	type EngineOptions,
} from '@neodrag/core';
import { Attachment } from 'svelte/attachments';

export type NeodragOptions = EngineOptions;
export type ReactiveDragPluginInput = DragPluginInput;

export { Neodrag };

function resolvePlugins(plugins: DragPluginInput) {
	return typeof plugins === 'function' ? plugins() : plugins;
}

export function draggable(plugins: DragPluginInput = []): Attachment<HTMLElement | SVGElement> {
	return (element) => {
		const engine = Neodrag.shared;
		const handle = engine.draggable(element, resolvePlugins(plugins));

		if (typeof plugins !== 'function') {
			return () => handle.destroy();
		}

		return $effect.root(() => {
			$effect.pre(() => {
				handle.update(resolvePlugins(plugins));
			});
			return () => handle.destroy();
		});
	};
}
