// @ts-nocheck
import {
	Resizable as CoreResizable,
	Neodrag,
	type ResizePluginList,
	type EngineOptions,
} from '@neodrag/core';
import { untrack } from 'svelte';
import { resizeFrameAttrs } from '@neodrag/core/internal';
import {
	NEODRAG_ATTACH_KEY,
	bindingProps,
	bindingSpread,
	propsWithAttachment,
	type ResizableFrameOptions,
	type NeodragElementProps,
} from '../attachments.svelte.ts';
import { createReactiveMarkup } from '../markup.svelte.ts';

export type NeodragResizeOptions = EngineOptions;
export type { ResizePluginList };
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

export class Resizable extends CoreResizable {
	readonly #markup: ReturnType<typeof createReactiveMarkup>;

	constructor(options: ConstructorParameters<typeof CoreResizable>[0]) {
		const markup = createReactiveMarkup(resizeFrameAttrs());
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

	get frame(): NeodragElementProps {
		return this.#markup.attrs as NeodragElementProps;
	}
}

export {
	resizeHandles,
	sizeBounds,
	resizeAxis,
	aspectRatio,
	resizeEvents,
	presetPanel,
	presetCornerBox,
	presetSplitPane,
	defineResizePlugin,
	RESIZE_HANDLE_ATTR,
	type ResizeCtx,
	type ResizeEdge,
	type ResizeSession,
	type ResizeEventData,
} from '@neodrag/core/resize';
