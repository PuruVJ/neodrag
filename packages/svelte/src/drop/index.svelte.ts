// @ts-nocheck
import {
	DroppableBinding as CoreDroppable,
	Neodrag,
	type DropPluginList,
	type EngineOptions,
} from '@neodrag/core';
import { Attachment } from 'svelte/attachments';
import { untrack } from 'svelte';

export type NeodragDropOptions = EngineOptions;
export type { DropPluginList };

export { Neodrag };

export class Droppable extends CoreDroppable {
	readonly #attachment: Attachment<HTMLElement | SVGElement>;

	constructor(options: ConstructorParameters<typeof CoreDroppable>[0]) {
		super(options);

		const coreAttachment = this.attachment;

		if (this.hasReactiveSlots) {
			$effect(() => {
				this.flushReactive();
			});
		}

		this.#attachment = (element) => {
			const cleanup = untrack(() => {
				coreAttachment(element);
				if (this.hasReactiveSlots) this.flushReactive();
			});
			return cleanup;
		};
	}

	get attachment(): Attachment<HTMLElement | SVGElement> {
		return this.#attachment;
	}
}

export {
	sortable,
	applySortableReorder,
	accepts,
	highlight,
	onDrop,
	type SortableOptions,
	type SortableStrategy,
	type SortableMode,
	type SortablePreviewMeta,
	type SortableReorderMeta,
} from '@neodrag/core/drop';
export { sortableItemFor } from './sortable.svelte';
