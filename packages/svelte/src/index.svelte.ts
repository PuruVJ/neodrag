import { Draggable as CoreDraggable, Neodrag, type DragPluginList, type EngineOptions } from '@neodrag/core';
import { Attachment } from 'svelte/attachments';

export type NeodragOptions = EngineOptions;
export { Neodrag, CoreDraggable as DraggableCore };
export type { DragPluginList };
export type { DragPluginList as PluginInput };

/** @deprecated Use `new Draggable({ plugins })` once in `<script>` and `{@attach drag.attachment}`. */
export function draggable(
	plugins: DragPluginList | (() => DragPluginList),
): Attachment<HTMLElement | SVGElement> {
	const slots: DragPluginList =
		typeof plugins === 'function' ? [plugins as () => import('@neodrag/core').DragPlugin[]] : plugins;
	return new Draggable({ plugins: slots }).attachment;
}

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
