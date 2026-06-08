import { Draggable as CoreDraggable, type DragEventData, type DraggableOptions as CoreDraggableOptions } from '@neodrag/core';
import { DRAG_MARKUP_STATE, dragTargetAttrs } from '@neodrag/core/internal';
import { NEODRAG_ATTACH_KEY, type NeodragElementProps } from './attachments.ts';
import { createReactiveMarkup } from './markup.ts';

export type DraggableOptions = Omit<CoreDraggableOptions, 'markup'>;

export type { DragEventData };

export class Draggable extends CoreDraggable {
	readonly #markup: ReturnType<typeof createReactiveMarkup>;

	constructor(options: DraggableOptions) {
		const markup = createReactiveMarkup(dragTargetAttrs());
		super({ ...options, markup: markup.adapter });
		this.#markup = markup;

		this.#markup.attrs[NEODRAG_ATTACH_KEY] = (element) => {
			if (!element) {
				this.detach();
				return;
			}
			this.attach(element);
			if (this.hasReactiveSlots) this.flushReactive();
		};
	}

	get target(): NeodragElementProps {
		return this.#markup.attrs as NeodragElementProps;
	}

	get isDragging(): boolean {
		return this.#markup.attrs[DRAG_MARKUP_STATE] === 'dragging';
	}
}
