import { sharedCapability } from '../shared.ts';
import type { DndNode } from '../types.ts';
import { Drop, type DropHandle, type DropOptions } from './drop.ts';
import { enableNativeDnd } from './native-drag.ts';

/**
 * Ergonomic single-element drop zone: `new Droppable(node, options)`. Shares the engine
 * with `Draggable`, so it automatically observes drag sessions.
 */
export class Droppable {
	readonly #handle: DropHandle;

	constructor(node: DndNode, options: DropOptions = {}) {
		if (options.native) enableNativeDnd(); // arm the OS file/text DnD sensor + session host
		this.#handle = sharedCapability(Drop, () => new Drop()).bind(node, options);
	}

	update(options: Partial<DropOptions>): void {
		this.#handle.update(options);
	}

	destroy(): void {
		this.#handle.destroy();
	}
}
