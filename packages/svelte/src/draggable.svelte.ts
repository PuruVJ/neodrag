import { Draggable as CoreDraggable, type DragEventData, type DraggableOptions as CoreDraggableOptions } from '@neodrag/core';
import { DRAG_MARKUP_STATE, dragTargetAttrs } from '@neodrag/core/internal';
import { untrack } from 'svelte';
import { createReactiveMarkup } from './markup.svelte.ts';
import { NEODRAG_ATTACH_KEY, type NeodragElementProps } from './attachments.svelte.ts';
export type DraggableOptions = Omit<CoreDraggableOptions, 'markup'>;

export type { DragEventData };

export class Draggable extends CoreDraggable {
	readonly #markup: ReturnType<typeof createReactiveMarkup>;

	constructor(options: DraggableOptions) {
		const markup = createReactiveMarkup(dragTargetAttrs());
		super({ ...options, markup: markup.adapter });
		this.#markup = markup;

		this.#markup.attrs[NEODRAG_ATTACH_KEY] = (element: HTMLElement | SVGElement) => {
			const cleanup = untrack(() => {
				this.attach(element);
				if (this.hasReactiveSlots) this.flushReactive();
			});
			return cleanup;
		};

		if (this.hasReactiveSlots) {
			$effect(() => {
				this.flushReactive();
			});
		}
	}

	get target(): NeodragElementProps {
		return this.#markup.attrs as NeodragElementProps;
	}

	get isDragging(): boolean {
		return this.#markup.attrs[DRAG_MARKUP_STATE] === 'dragging';
	}
}
