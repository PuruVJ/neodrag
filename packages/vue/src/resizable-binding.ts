import { Resizable as CoreResizable, Neodrag, type EngineOptions, type ResizePluginList } from '@neodrag/core';
import { resizeFrameAttrs } from '@neodrag/core/internal';
import { NEODRAG_ATTACH_KEY, type NeodragElementProps } from './attachments.ts';
import { createReactiveMarkup } from './markup.ts';

export type NeodragResizeOptions = EngineOptions;
export type { ResizePluginList };

export { Neodrag };

export class Resizable extends CoreResizable {
	readonly #markup: ReturnType<typeof createReactiveMarkup>;

	constructor(options: ConstructorParameters<typeof CoreResizable>[0]) {
		const markup = createReactiveMarkup(resizeFrameAttrs());
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

	get frame(): NeodragElementProps {
		return this.#markup.attrs as NeodragElementProps;
	}

	get target(): NeodragElementProps {
		return this.frame;
	}
}
