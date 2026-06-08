import { interactionDefaults } from '../interaction-defaults.ts';
import { DEFAULT_RESIZE_PLUGINS } from '../resize-defaults.ts';

export class ResizableEngineExtensions {
	static #installed = false;

	static ensureInstalled(): void {
		if (ResizableEngineExtensions.#installed) return;
		ResizableEngineExtensions.#installed = true;
		interactionDefaults.registerResize(DEFAULT_RESIZE_PLUGINS);
	}
}

export function ensureResizableEngineExtensions(): void {
	ResizableEngineExtensions.ensureInstalled();
}
