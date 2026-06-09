import { sharedCapability } from '../shared.ts';
import type { DndNode } from '../types.ts';
import { Resize, type ResizeHandle, type ResizeOptions } from './resize.ts';

/** Ergonomic single-element resize: `new Resizable(node, options)`. */
export class Resizable {
	readonly #handle: ResizeHandle;

	constructor(node: DndNode, options: ResizeOptions = {}) {
		this.#handle = sharedCapability(Resize, () => new Resize()).bind(node, options);
	}

	update(options: Partial<ResizeOptions>): void {
		this.#handle.update(options);
	}

	get size(): { width: number; height: number } {
		return this.#handle.size;
	}

	destroy(): void {
		this.#handle.destroy();
	}
}
