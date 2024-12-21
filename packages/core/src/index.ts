import { createDraggable } from './core.ts';
import {
	applyUserSelectHack,
	ignoreMultitouch,
	stateMarker,
	threshold,
	touchAction,
	transform,
} from './plugins.ts';

export const draggable = createDraggable({
	plugins: [
		ignoreMultitouch(),
		stateMarker(),
		applyUserSelectHack(),
		transform(),
		threshold(),
		touchAction(),
	],
	onError(error) {
		console.error(error);
	},
});

export * from './plugins.ts';
