import { createAttachmentKey } from 'svelte/attachments';
import { Swipeable as CoreSwipeable, type SwipeAxis, type SwipeOptions } from '@neodrag/core/swipe';
import type { DndNode } from '@neodrag/core';
import type { AttachProps } from './_internal.ts';

/**
 * Reactive Svelte wrapper for swipe-to-dismiss — a thin adapter over the core `Swipeable` binder
 * (which owns the drag, the threshold decision, and the settle animation). Spread `{...swipe.attach}`;
 * read `swipe.offset` / `swipe.isDismissed`. Released past `threshold` the element flies out and fires
 * `onDismiss`; otherwise it springs back.
 */
export class Swipeable {
	readonly axis: SwipeAxis;
	readonly #core: CoreSwipeable;
	#offset = $state<{ x: number; y: number }>({ x: 0, y: 0 });
	#dismissed = $state(false);
	readonly attach: AttachProps;

	constructor(options: SwipeOptions = {}) {
		this.#core = new CoreSwipeable({
			...options,
			onChange: (s) => {
				this.#offset = s.offset;
				this.#dismissed = s.dismissed;
			},
		});
		this.axis = this.#core.axis;
		this.attach = {
			[createAttachmentKey()]: (node: DndNode) => this.#core.attach(node as HTMLElement),
		};
	}

	/** Live offset (px), reactive. */
	get offset(): { x: number; y: number } {
		return this.#offset;
	}
	/** True once the element has been swiped out. */
	get isDismissed(): boolean {
		return this.#dismissed;
	}

	/** Spring the element back to rest and clear the dismissed flag (e.g. to re-show it). */
	reset(): void {
		this.#core.reset();
	}
}

export { resolveSwipe, type SwipeAxis, type SwipeResult, type SwipeOptions } from '@neodrag/core/swipe';
