import { DEFAULT_DRAG_PLUGINS } from './interactions/plugins/index.ts';
import type { EngineOptions } from './interactions/engine.ts';
import type { ErrorInfo } from './interactions/types.ts';

export const DEFAULTS: Required<Pick<EngineOptions, 'plugins' | 'delegate' | 'onError'>> = {
	plugins: DEFAULT_DRAG_PLUGINS,
	delegate: () => document.documentElement,
	onError: (error: ErrorInfo) => {
		console.error(error);
	},
};
