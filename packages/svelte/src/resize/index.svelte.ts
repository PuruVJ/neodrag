// @ts-nocheck
import {
	Resizable as CoreResizable,
	Neodrag,
	type ResizePluginList,
	type EngineOptions,
} from '@neodrag/core';
import { Attachment } from 'svelte/attachments';
import { untrack } from 'svelte';

export type NeodragResizeOptions = EngineOptions;
export type { ResizePluginList };

export { Neodrag };

export class Resizable extends CoreResizable {
	readonly #attachment: Attachment<HTMLElement | SVGElement>;

	constructor(options: ConstructorParameters<typeof CoreResizable>[0]) {
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
