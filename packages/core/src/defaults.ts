import { applyUserSelectHack, ignoreMultitouch, touchAction } from './plugins/drag.ts';
import type { EngineOptions } from './engine/neodrag.ts';
import type { DragPlugin } from './types.ts';
import type { ErrorInfo } from './types.ts';

export const DEFAULT_DRAG_PLUGINS: DragPlugin[] = [
	ignoreMultitouch,
	applyUserSelectHack,
	touchAction,
];

export const MINIMAL_DRAG_PLUGINS: DragPlugin[] = [];

export const DEFAULTS: Required<Pick<EngineOptions, 'plugins' | 'delegate' | 'onError'>> = {
	plugins: DEFAULT_DRAG_PLUGINS,
	delegate: () => document.documentElement,
	onError: (error: ErrorInfo) => {
		console.error(error);
	},
};
