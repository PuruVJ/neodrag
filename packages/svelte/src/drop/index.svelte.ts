import { DROP_DEFAULTS, DropFactory, type DropErrorInfo } from '@neodrag/core/drop';
import type { DropPlugin } from '@neodrag/core/drop';
import { Attachment } from 'svelte/attachments';

export type NeodragDropOptions = {
	plugins?: (typeof DROP_DEFAULTS)['plugins'];
	delegate?: (typeof DROP_DEFAULTS)['delegate'];
	onError?: (error: DropErrorInfo) => void;
};

export class NeodragDrop {
	readonly #factory: DropFactory;

	static readonly shared = new NeodragDrop();

	constructor(options: NeodragDropOptions = {}) {
		this.#factory = new DropFactory({
			plugins: options.plugins ?? DROP_DEFAULTS.plugins,
			delegate: options.delegate ?? DROP_DEFAULTS.delegate,
			onError: options.onError ?? DROP_DEFAULTS.onError,
		});
	}

	get instances() {
		return this.#factory.instances;
	}

	bind(node: HTMLElement | SVGElement, plugins: DropPlugin[] = []) {
		return this.#factory.droppable(node, plugins);
	}

	droppable(plugins?: DropPlugin[]): Droppable {
		return new Droppable(this, plugins ?? []);
	}

	dispose() {
		this.#factory.dispose();
	}
}

export class Droppable {
	readonly #engine: NeodragDrop;
	readonly #plugins: DropPlugin[];
	#destroy?: () => void;

	constructor(engine: NeodragDrop = NeodragDrop.shared, plugins: DropPlugin[] = []) {
		this.#engine = engine;
		this.#plugins = plugins;
	}

	attach(element: HTMLElement | SVGElement) {
		this.detach();
		this.#destroy = this.#engine.bind(element, this.#plugins);
		return () => this.detach();
	}

	attachment(): Attachment<HTMLElement | SVGElement> {
		return (element) => this.attach(element);
	}

	detach() {
		this.#destroy?.();
		this.#destroy = undefined;
	}
}

export function droppable(plugins?: DropPlugin[]): Attachment<HTMLElement | SVGElement> {
	return new Droppable(NeodragDrop.shared, plugins ?? []).attachment();
}

export * from '@neodrag/core/drop/plugins';

/** @deprecated Use `NeodragDrop.shared.instances` */
export const dropInstances = NeodragDrop.shared.instances;

export { sortableItem, sortableItemBySelector } from './sortable.svelte';
