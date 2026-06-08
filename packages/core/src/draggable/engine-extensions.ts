import { DEFAULT_DRAG_PLUGINS } from '../defaults.ts';
import { interactionDefaults } from '../interaction-defaults.ts';

export class DraggableEngineExtensions {
	static #installed = false;

	static ensureInstalled(): void {
		if (DraggableEngineExtensions.#installed) return;
		DraggableEngineExtensions.#installed = true;
		interactionDefaults.registerDrag(DEFAULT_DRAG_PLUGINS);
	}
}

export function ensureDraggableEngineExtensions(): void {
	DraggableEngineExtensions.ensureInstalled();
}
