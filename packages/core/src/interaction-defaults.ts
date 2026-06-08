import type { DragPlugin } from './types.ts';
import type { DropPlugin } from './types.ts';
import type { ResizePlugin } from './resize/types.ts';

export class InteractionDefaultsRegistry {
	#drag: DragPlugin[] = [];
	#drop: DropPlugin[] = [];
	#resize: ResizePlugin[] = [];

	registerDrag(plugins: readonly DragPlugin[]): () => void {
		const prev = this.#drag;
		this.#drag = [...plugins];
		return () => {
			this.#drag = prev;
		};
	}

	registerDrop(plugins: readonly DropPlugin[]): () => void {
		const prev = this.#drop;
		this.#drop = [...plugins];
		return () => {
			this.#drop = prev;
		};
	}

	registerResize(plugins: readonly ResizePlugin[]): () => void {
		const prev = this.#resize;
		this.#resize = [...plugins];
		return () => {
			this.#resize = prev;
		};
	}

	drag(): DragPlugin[] {
		return this.#drag;
	}

	drop(): DropPlugin[] {
		return this.#drop;
	}

	resize(): ResizePlugin[] {
		return this.#resize;
	}
}

export const interactionDefaults = new InteractionDefaultsRegistry();
