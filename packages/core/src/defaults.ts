import {
	applyUserSelectHack,
	ignoreMultitouch,
	stateMarker,
	threshold,
	touchAction,
} from './interactions/plugins.ts';
import type { EngineOptions } from './interactions/engine.ts';
import type { DragPlugin } from './interactions/types.ts';
import type { ErrorInfo } from './interactions/types.ts';

export const DEFAULT_DRAG_PLUGINS: DragPlugin[] = [
	ignoreMultitouch,
	stateMarker,
	applyUserSelectHack,
	threshold(),
	touchAction,
];

export const MINIMAL_DRAG_PLUGINS: DragPlugin[] = [threshold()];

export const DEFAULTS: Required<Pick<EngineOptions, 'plugins' | 'delegate' | 'onError'>> = {
	plugins: DEFAULT_DRAG_PLUGINS,
	delegate: () => document.documentElement,
	onError: (error: ErrorInfo) => {
		console.error(error);
	},
};
