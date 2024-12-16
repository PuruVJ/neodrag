import { createDraggable } from './core.ts';
import { applyUserSelectHack, classes, ignoreMultitouch, threshold, transform } from './plugins.ts';

export const draggable = createDraggable([
	ignoreMultitouch(),
	classes(),
	applyUserSelectHack(),
	transform(),
	threshold(),
]);

export * from './plugins.ts';
