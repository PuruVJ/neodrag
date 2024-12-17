import { createDraggable } from './core.ts';
import {
	applyUserSelectHack,
	ignoreMultitouch,
	stateMarker,
	threshold,
	transform,
} from './plugins.ts';

export const draggable = createDraggable({
	plugins: [ignoreMultitouch(), stateMarker(), applyUserSelectHack(), transform(), threshold()],
});

export * from './plugins.ts';
