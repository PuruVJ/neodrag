import { DROP_DEFAULTS, DropFactory, type DropErrorInfo } from '@neodrag/core/drop';
import type { DropPlugin } from '@neodrag/core/drop';
import { Droppable } from './index';

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

	droppable(node: HTMLElement | SVGElement, plugins: DropPlugin[] = []): Droppable {
		const destroy = this.#factory.droppable(node, plugins);
		return new Droppable(node, destroy);
	}

	dispose() {
		this.#factory.dispose();
	}
}

export { Droppable };
export * from '@neodrag/core/drop/plugins';
