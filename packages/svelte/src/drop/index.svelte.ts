import {
	DroppableBinding as CoreDroppable,
	Neodrag,
	type DropPluginList,
	type EngineOptions,
} from '@neodrag/core';
import { Attachment } from 'svelte/attachments';

export type NeodragDropOptions = EngineOptions;
export type { DropPluginList };

export { Neodrag };

export class Droppable extends CoreDroppable {
	readonly #reactiveAttachment: Attachment<HTMLElement | SVGElement>;

	constructor(options: ConstructorParameters<typeof CoreDroppable>[0]) {
		super(options);

		const coreAttachment = this.attachment;
		this.#reactiveAttachment = (element) => {
			const cleanup = coreAttachment(element);
			if (!this.hasReactiveSlots) return cleanup;

			return $effect.root(() => {
				$effect.pre(() => {
					this.flushReactive();
				});
				return cleanup;
			});
		};
	}

	get attachment(): Attachment<HTMLElement | SVGElement> {
		return this.#reactiveAttachment;
	}
}

/** @deprecated Use `new Droppable({ plugins })` once in `<script>` and `{@attach drop.attachment}`. */
export function droppable(plugins: DropPluginList | (() => DropPluginList) = []): Attachment<
	HTMLElement | SVGElement
> {
	const slots: DropPluginList =
		typeof plugins === 'function' ? [plugins as () => import('@neodrag/core').DropPlugin[]] : plugins;
	return new Droppable({ plugins: slots }).attachment;
}

export { sortable, type SortableOptions, type SortableStrategy } from '@neodrag/core/drop';
export { sortableItemFor } from './sortable.svelte';
