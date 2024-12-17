import { createDraggable } from './core.ts';
import { applyUserSelectHack, classes, ignoreMultitouch, threshold, transform } from './plugins.ts';

export const draggable = createDraggable({
	plugins: [ignoreMultitouch(), classes(), applyUserSelectHack(), transform(), threshold()],
});

export * from './plugins.ts';
