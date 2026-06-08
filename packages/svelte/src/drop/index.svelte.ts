// @ts-nocheck
import { Droppable as CoreDroppable, Neodrag, type DropPluginList, type EngineOptions } from '@neodrag/core';
import { dropZoneAttrs } from '@neodrag/core/internal';
import { untrack } from 'svelte';
import {
	NEODRAG_ATTACH_KEY,
	bindingProps,
	bindingSpread,
	propsWithAttachment,
	type DroppableZoneOptions,
	type NeodragElementProps,
} from '../attachments.svelte.ts';
import { createReactiveMarkup } from '../markup.svelte.ts';

export type NeodragDropOptions = EngineOptions;
export type { DropPluginList };
export {
	NEODRAG_ATTACH_KEY,
	bindingProps,
	bindingSpread,
	propsWithAttachment,
	type DraggableTargetOptions,
	type DroppableZoneOptions,
	type ResizableFrameOptions,
	type NeodragElementProps,
	type NeodragSpreadProps,
} from '../attachments.svelte.ts';

export { Neodrag };

export class Droppable extends CoreDroppable {
	readonly #markup: ReturnType<typeof createReactiveMarkup>;

	constructor(options: Omit<ConstructorParameters<typeof CoreDroppable>[0], 'markup'>) {
		const markup = createReactiveMarkup(dropZoneAttrs());
		super({ ...options, markup: markup.adapter });
		this.#markup = markup;

		if (this.hasReactiveSlots) {
			$effect(() => {
				this.flushReactive();
			});
		}

		this.#markup.attrs[NEODRAG_ATTACH_KEY] = (element) => {
			const cleanup = untrack(() => {
				this.attach(element);
				if (this.hasReactiveSlots) this.flushReactive();
			});
			return cleanup;
		};
	}

	get zone(): NeodragElementProps {
		return this.#markup.attrs as NeodragElementProps;
	}
}

export {
	accepts,
	highlight,
	onDrop,
	dropHitExpand,
	collisionPriority,
	collisionStrategy,
	type DropCollisionStrategy,
} from '@neodrag/core/drop';

export {
	Sortable,
	sortableItemFor,
	applySortableReorder,
	applyGroupedSortableTransfer,
	SORTABLE_ROW_ATTR,
	sortableRowAttrs,
	type SortableOptions,
	type SortableStrategy,
	type SortableMode,
	type SortablePreviewMode,
	type SortablePreviewMeta,
	type SortableIntentMeta,
	type SortableReorderMeta,
	type SortableTransferMeta,
	type SortableElementProps,
	type SortableRowProps,
} from '../sortable/index.svelte.ts';
