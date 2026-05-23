import {
	applyUserSelectHack,
	ignoreMultitouch,
	stateMarker,
	touchAction,
} from './interactions/plugins/builtins.ts';
import { threshold } from './interactions/plugins/threshold.ts';
import { transform } from './interactions/plugins/transform.ts';
import type { EngineOptions } from './interactions/engine.ts';
import type { DragPlugin } from './interactions/types.ts';
import type { ErrorInfo } from './interactions/types.ts';

export const DEFAULT_DRAG_PLUGINS: DragPlugin[] = [
	ignoreMultitouch,
	stateMarker,
	applyUserSelectHack,
	transform,
	threshold(),
	touchAction,
];

export const MINIMAL_DRAG_PLUGINS: DragPlugin[] = [transform, threshold()];

export const DEFAULTS: Required<Pick<EngineOptions, 'plugins' | 'delegate' | 'onError'>> = {
	plugins: DEFAULT_DRAG_PLUGINS,
	delegate: () => document.documentElement,
	onError: (error: ErrorInfo) => {
		console.error(error);
	},
};
