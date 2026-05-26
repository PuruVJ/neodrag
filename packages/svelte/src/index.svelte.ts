// @ts-nocheck
import {
	Draggable as CoreDraggable,
	Resizable as CoreResizable,
	Neodrag,
	type DragPluginList,
	type ResizePluginList,
	type EngineOptions,
} from '@neodrag/core';
import { Attachment } from 'svelte/attachments';
import { untrack } from 'svelte';

export type NeodragOptions = EngineOptions;
export { Neodrag, CoreDraggable as DraggableCore, CoreResizable as ResizableCore };
export type { DragPluginList, ResizePluginList };

export class Draggable extends CoreDraggable {
	readonly #attachment: Attachment<HTMLElement | SVGElement>;

	constructor(options: ConstructorParameters<typeof CoreDraggable>[0]) {
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
