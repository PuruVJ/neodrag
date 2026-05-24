import { sortable, type SortableOptions } from '@neodrag/core/drop';
import type { DragPluginList } from '@neodrag/core';
import { Draggable } from '@neodrag/svelte';
import { Attachment } from 'svelte/attachments';

export function sortableItemFor<T>(
	options: SortableOptions<T>,
	key: string,
	extra?: DragPluginList,
): Attachment<HTMLElement | SVGElement> {
	const itemPlugins = sortable(options).item(key);
	if (!extra) {
		const drag = new Draggable({ plugins: itemPlugins });
		return drag.attachment;
	}
	const drag = new Draggable({
		plugins: [...itemPlugins, ...extra],
	});
	return drag.attachment;
}
