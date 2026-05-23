import { resolveDragPlugins, sortable, type SortableOptions } from '@neodrag/core/drop';
import { draggable } from '@neodrag/svelte';
import type { PluginInput } from '@neodrag/core/plugins';
import { Attachment } from 'svelte/attachments';

export function sortableItemFor<T>(
	options: SortableOptions<T>,
	key: string,
	extra?: PluginInput,
): Attachment<HTMLElement | SVGElement> {
	const itemPlugins = sortable(options).item(key);
	if (!extra) return draggable(itemPlugins);
	return draggable(() => [...itemPlugins, ...resolveDragPlugins(extra)]);
}
