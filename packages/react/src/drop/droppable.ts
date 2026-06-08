import { Droppable as CoreDroppable, Neodrag, type DropPluginList, type EngineOptions } from '@neodrag/core';
import { dropZoneAttrs } from '@neodrag/core/internal';
import { NEODRAG_ATTACH_KEY, type NeodragElementProps } from '../attachments.ts';
import { createReactiveMarkup } from '../markup.ts';

export type NeodragDropOptions = EngineOptions;
export type { DropPluginList };

export { Neodrag };

export class Droppable extends CoreDroppable {
	readonly #markup: ReturnType<typeof createReactiveMarkup>;

	constructor(options: Omit<ConstructorParameters<typeof CoreDroppable>[0], 'markup'>) {
		const markup = createReactiveMarkup(dropZoneAttrs());
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

	get zone(): NeodragElementProps {
		return this.#markup.attrs as NeodragElementProps;
	}

	get target(): NeodragElementProps {
		return this.zone;
	}

	get markupVersion(): number {
		return this.#markup.adapter.version;
	}

	markupSubscribe(listener: () => void): () => void {
		return this.#markup.adapter.subscribe(listener);
	}
}
