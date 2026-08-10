import { createAttachmentKey } from 'svelte/attachments';
import { Selectable as CoreSelectable, type SelectableOptions } from '@neodrag/core/select';
import { SvelteSet } from 'svelte/reactivity';
import type { DndNode } from '@neodrag/core';
import type { AttachProps } from './_internal.ts';

/**
 * Reactive Svelte wrapper for rubber-band multi-select — a thin adapter over the core `Selectable`
 * binder (the region is a `Draggable` running the `marqueeSelect` plugin). Spread `{...select.container}`
 * on the region and `{...select.item(value)}` on each child. `select.selected` is the reactive set of
 * selected values; each selected item gets a `data-neodrag-selected` attribute to style.
 */
export class Selectable<V = string> {
	readonly #core: CoreSelectable<V>;
	readonly #selected = new SvelteSet<V>();
	readonly #item_attach = new Map<V, AttachProps>();
	readonly container: AttachProps;

	constructor(options: SelectableOptions<V> = {}) {
		this.#core = new CoreSelectable<V>({
			...options,
			onChange: (list) => this.#sync(list),
		});
		this.container = {
			[createAttachmentKey()]: (node: DndNode) => this.#core.container(node as HTMLElement),
		};
	}

	/** The reactive set of selected values. */
	get selected(): Set<V> {
		return this.#selected;
	}

	/** Clear the selection programmatically. */
	clear(): void {
		this.#core.clear();
	}

	/** Spread onto a selectable child. */
	item(value: V): AttachProps {
		let attach = this.#item_attach.get(value);
		if (!attach) {
			attach = {
				[createAttachmentKey()]: (node: DndNode) => this.#core.item(value, node as HTMLElement),
			};
			this.#item_attach.set(value, attach);
		}
		return attach;
	}

	#sync(list: V[]): void {
		const next = new Set(list);
		for (const v of [...this.#selected]) if (!next.has(v)) this.#selected.delete(v);
		for (const v of next) if (!this.#selected.has(v)) this.#selected.add(v);
	}
}

export { rectsOverlap, type MarqueeOptions } from '@neodrag/core/select';
