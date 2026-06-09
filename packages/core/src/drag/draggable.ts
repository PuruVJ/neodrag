import { sharedCapability } from '../shared.ts';
import type { DndNode } from '../types.ts';
import { Drag, type DragHandle, type DragOptions, type Point } from './drag.ts';

/**
 * Ergonomic single-element class API: `new Draggable(node, options)`. Routes through the
 * shared engine + `Drag` capability so importing only `Draggable` pulls in just the drag
 * path (no drop/resize/sortable).
 */
export class Draggable {
	readonly #handle: DragHandle;

	constructor(node: DndNode, options: DragOptions = {}) {
		this.#handle = sharedCapability(Drag, () => new Drag()).bind(node, options);
	}

	/** Targeted, fine-grained update — only the provided keys are written. */
	update(options: Partial<DragOptions>): void {
		this.#handle.update(options);
	}

	get offset(): Point {
		return this.#handle.offset;
	}

	get isDragging(): boolean {
		return this.#handle.isDragging;
	}

	destroy(): void {
		this.#handle.destroy();
	}
}
