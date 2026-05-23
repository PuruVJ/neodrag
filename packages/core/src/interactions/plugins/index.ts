export * from './keys.ts';
export { transform, transformWith } from './transform.ts';
export { threshold } from './threshold.ts';
export { ignoreMultitouch, stateMarker, applyUserSelectHack, touchAction } from './builtins.ts';

import { applyUserSelectHack, ignoreMultitouch, stateMarker, touchAction } from './builtins.ts';
import { threshold } from './threshold.ts';
import { transform } from './transform.ts';
import type { DragPlugin } from '../types.ts';

export const DEFAULT_DRAG_PLUGINS: DragPlugin[] = [
	ignoreMultitouch,
	stateMarker,
	applyUserSelectHack,
	transform,
	threshold(),
	touchAction,
];
