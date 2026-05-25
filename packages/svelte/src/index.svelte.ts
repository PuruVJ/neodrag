// @ts-nocheck
import { Draggable as CoreDraggable, Neodrag, type DragPluginList, type EngineOptions } from '@neodrag/core';
import { Attachment } from 'svelte/attachments';
import { untrack } from 'svelte';

export type NeodragOptions = EngineOptions;
export { Neodrag, CoreDraggable as DraggableCore };
export type { DragPluginList };

/**
 * Svelte {@attach} integration. Reactive `() => plugin` slots are not read during
 * attach (so the engine is mounted once). Call `flushReactive()` from a component
 * `$effect` whenever those dependencies change — see `watchDraggablePlugins`.
 */
export class Draggable extends CoreDraggable {
	readonly #attachment: Attachment<HTMLElement | SVGElement>;

	constructor(options: ConstructorParameters<typeof CoreDraggable>[0]) {
		super(options);

		const coreAttachment = this.attachment;
		this.#attachment = (element) => untrack(() => coreAttachment(element));
	}

	get attachment(): Attachment<HTMLElement | SVGElement> {
		return this.#attachment;
	}
}

/** Run `readDeps` inside `$effect`, then `flushReactive()` when reactive plugin inputs change. */
export function watchDraggablePlugins(drag: Draggable, readDeps: () => void) {
	$effect(() => {
		readDeps();
		drag.flushReactive();
	});
}
