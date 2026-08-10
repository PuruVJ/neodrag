import { createAttachmentKey } from 'svelte/attachments';
import { SplitPane as CoreSplitPane, type SplitAxis, type SplitPaneOptions } from '@neodrag/core/splitpane';
import type { DndNode } from '@neodrag/core';
import type { Room } from '@neodrag/core/collab';
import type { AttachProps } from './_internal.ts';

/**
 * Reactive Svelte wrapper for a split pane — a thin adapter over the core `SplitPane` binder (which
 * owns the flex layout and the draggable gutters). Spread `{...split.container}` on the container,
 * `{...split.pane(i)}` on each pane, and `{...split.gutter(i)}` on each divider. Read live weights
 * from `split.sizes`. Nests: each instance is independent, so drop one split inside another's pane.
 */
export class SplitPane {
	readonly axis: SplitAxis;
	readonly #core: CoreSplitPane;
	#sizes = $state<number[]>([]);
	readonly #pane_attach = new Map<number, AttachProps>();
	readonly #gutter_attach = new Map<number, AttachProps>();
	readonly container: AttachProps;

	constructor(options: SplitPaneOptions & { room?: Room } = {}) {
		this.axis = options.axis ?? 'x';
		this.#core = new CoreSplitPane({
			...options,
			onChange: (s) => {
				this.#sizes = s.slice();
				options.onChange?.(s);
			},
		});
		this.#sizes = this.#core.sizes.slice();

		this.container = {
			[createAttachmentKey()]: (node: DndNode) => this.#core.container(node as HTMLElement),
		};
	}

	/** Live pane weights (reactive) — updates each move and on a programmatic set. */
	get sizes(): number[] {
		return this.#sizes;
	}

	/** Programmatically set the weights (e.g. a "reset" or a preset layout). */
	setSizes(sizes: number[]): void {
		this.#core.setSizes(sizes);
	}

	/** Spread onto pane `index`. */
	pane(index: number): AttachProps {
		let attach = this.#pane_attach.get(index);
		if (!attach) {
			attach = {
				[createAttachmentKey()]: (node: DndNode) => this.#core.pane(node as HTMLElement, index),
			};
			this.#pane_attach.set(index, attach);
		}
		return attach;
	}

	/** Spread onto the gutter between pane `index` and `index + 1`. Dragging it resizes that pair. */
	gutter(index: number): AttachProps {
		let attach = this.#gutter_attach.get(index);
		if (!attach) {
			attach = {
				[createAttachmentKey()]: (node: DndNode) => this.#core.gutter(node as HTMLElement, index),
			};
			this.#gutter_attach.set(index, attach);
		}
		return attach;
	}
}

export type { SplitAxis, SplitPaneOptions } from '@neodrag/core/splitpane';
