import type { ResizeInteraction } from './resize-interaction.ts';
import type { ResizeInteractionDeps } from './resize-interaction.ts';

type ResizeInteractionFactory = (deps: ResizeInteractionDeps) => ResizeInteraction;

let factory: ResizeInteractionFactory | undefined;

export function registerResizeInteraction(create: ResizeInteractionFactory): void {
	factory = create;
}

export function createResizeInteraction(deps: ResizeInteractionDeps): ResizeInteraction {
	if (!factory) {
		throw new Error(
			'Resize is not registered. Import `Resizable` from `@neodrag/core` or `@neodrag/core/resizable` before calling `engine.resizable()`.',
		);
	}
	return factory(deps);
}
