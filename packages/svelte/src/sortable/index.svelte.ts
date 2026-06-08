import { Neodrag } from '@neodrag/core';
import {
	Sortable as CoreSortable,
	sortableItemAttrs,
	sortableRowAttrs,
	type DropPluginList,
	type SortableOptions,
} from '@neodrag/core/sortable';
import { registerSortableRowMarkup } from '@neodrag/core/internal';
import { untrack } from 'svelte';
import { NEODRAG_ATTACH_KEY, propsWithAttachment, type NeodragElementProps } from '../attachments.svelte.ts';
import { Draggable } from '../draggable.svelte.ts';
import { createReactiveMarkup } from '../markup.svelte.ts';

export type SortableElementProps = NeodragElementProps;

/** @deprecated Use `SortableElementProps` */
export type SortableSpreadProps = SortableElementProps;

export type SortableRowProps = NeodragElementProps;

export type {
	SortableOptions,
	SortableStrategy,
	SortableMode,
	SortablePreviewMode,
	SortablePreviewMeta,
	SortableIntentMeta,
	SortableReorderMeta,
	SortableTransferMeta,
} from '@neodrag/core/sortable';
export {
	applySortableReorder,
	applyGroupedSortableTransfer,
	SORTABLE_ROW_ATTR,
	sortableRowAttrs,
} from '@neodrag/core/sortable';

let defaultEngine: Neodrag | null = null;

function engine(): Neodrag {
	defaultEngine ??= new Neodrag();
	return defaultEngine;
}

export class Sortable<T> {
	readonly #core: CoreSortable<T>;
	readonly #itemDrags = new Map<string, Draggable>();
	#containerAttach: ReturnType<typeof createReactiveMarkup> | null = null;
	#containerMarkup: ReturnType<typeof createReactiveMarkup> | null = null;
	#containerProps: NeodragElementProps | null = null;
	#rowMarkup: ReturnType<typeof createReactiveMarkup> | null = null;

	constructor(options: SortableOptions<T>) {
		this.#core = new CoreSortable(options);
	}

	destroy(): void {
		this.#core.destroy();
		for (const chip of this.#itemDrags.values()) chip.destroy();
		this.#itemDrags.clear();
	}

	row(): NeodragElementProps {
		this.#rowMarkup ??= createReactiveMarkup(sortableRowAttrs());
		return propsWithAttachment(
			(element) => registerSortableRowMarkup(element, this.#rowMarkup!.adapter),
			this.#rowMarkup.attrs,
		);
	}

	rowAttrs(): NeodragElementProps {
		return this.row();
	}

	item(key: string): Draggable {
		let chip = this.#itemDrags.get(key);
		if (!chip) {
			chip = new Draggable({ plugins: this.#core.item(key), threshold: null });
			Object.assign(chip.target, sortableItemAttrs(key));
			this.#itemDrags.set(key, chip);
		}
		return chip;
	}

	get container(): NeodragElementProps {
		this.#containerMarkup ??= createReactiveMarkup({});
		if (!this.#containerAttach) {
			const plugins = this.#core.container();
			const markup = this.#containerMarkup;
			this.#containerAttach = (element) =>
				untrack(() => {
					const handle = engine().droppable(element, plugins, { markup: markup.adapter });
					return () => handle.destroy();
				});
		}
		this.#containerProps ??= propsWithAttachment(this.#containerAttach, this.#containerMarkup.attrs);
		return this.#containerProps;
	}

	containerPlugins(): DropPluginList {
		return this.#core.container();
	}
}

/** @deprecated Use `new Sortable(options).item(key).target` */
export function sortableItemFor<T>(
	options: SortableOptions<T>,
	key: string,
): Draggable['target'][typeof NEODRAG_ATTACH_KEY] {
	const list = new Sortable(options);
	return list.item(key).target[NEODRAG_ATTACH_KEY];
}
