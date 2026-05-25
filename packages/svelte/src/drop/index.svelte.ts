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
		this.#attachment = (element) => untrack(() => coreAttachment(element));
	}

	get attachment(): Attachment<HTMLElement | SVGElement> {
		return this.#attachment;
	}
}

export { sortable, type SortableOptions, type SortableStrategy } from '@neodrag/core/drop';
export { sortableItemFor } from './sortable.svelte';
