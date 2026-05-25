// @ts-nocheck
import { Draggable as CoreDraggable, Neodrag, type DragPluginList, type EngineOptions } from '@neodrag/core';
import { Attachment } from 'svelte/attachments';

export type NeodragOptions = EngineOptions;
export { Neodrag, CoreDraggable as DraggableCore };
export type { DragPluginList };

export class Draggable extends CoreDraggable {
	readonly #reactiveAttachment: Attachment<HTMLElement | SVGElement>;

	constructor(options: ConstructorParameters<typeof CoreDraggable>[0]) {
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
