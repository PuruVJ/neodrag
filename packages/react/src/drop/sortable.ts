import { Neodrag } from '@neodrag/core';
import {
	Sortable as CoreSortable,
	sortableItemAttrs,
	sortableRowAttrs,
	type SortableOptions,
} from '@neodrag/core/sortable';
import { registerSortableRowMarkup } from '@neodrag/core/internal';
import { propsWithAttachment, type NeodragElementProps } from '../attachments.ts';
import { Draggable } from '../draggable.ts';
import { createReactiveMarkup } from '../markup.ts';

export type SortableElementProps = NeodragElementProps;

export type SortableRowProps = NeodragElementProps;

export type { SortableOptions };

let defaultEngine: Neodrag | null = null;

function engine(): Neodrag {
	defaultEngine ??= new Neodrag();
	return defaultEngine;
}

export class Sortable<T> {
	readonly #core: CoreSortable<T>;
	readonly #itemDrags = new Map<string, Draggable>();
	#containerAttach: ((element: HTMLElement | SVGElement | null) => void | (() => void)) | null =
		null;
	#containerMarkup: ReturnType<typeof createReactiveMarkup> | null = null;
	#containerProps: NeodragElementProps | null = null;
	#rowMarkup: ReturnType<typeof createReactiveMarkup> | null = null;

	constructor(opts: SortableOptions<T>) {
		this.#core = new CoreSortable(opts);
	}

	row(): NeodragElementProps {
		this.#rowMarkup ??= createReactiveMarkup(sortableRowAttrs());
		return propsWithAttachment(
			(element) => registerSortableRowMarkup(element, this.#rowMarkup!.adapter),
			this.#rowMarkup.attrs,
		);
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
			const plugins = () => this.#core.container();
			const markup = this.#containerMarkup;
			this.#containerAttach = (element) => {
				if (!element) return;
				const handle = engine().droppable(element, plugins(), { markup: markup.adapter });
				return () => handle.destroy();
			};
		}
		this.#containerProps ??= propsWithAttachment(this.#containerAttach, this.#containerMarkup.attrs);
		return this.#containerProps;
	}

	containerPlugins() {
		return this.#core.container();
	}
}
