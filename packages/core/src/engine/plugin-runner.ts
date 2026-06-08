import type { ErrorInfo } from '../types.ts';

export type PluginHost = {
	failed: Set<symbol>;
	rootNode: HTMLElement | SVGElement;
};

export const PLUGIN_FAILED = Symbol('neodrag.pluginFailed');

export type PluginRunnerOptions = {
	onError?: (error: ErrorInfo) => void;
	dev: () => boolean;
};

export class PluginRunner {
	readonly hookMeta = { key: Symbol('neodrag.plugin'), hook: '' };
	readonly errorFrame: Omit<ErrorInfo, 'error'>;

	readonly #onError?: (error: ErrorInfo) => void;
	readonly #dev: () => boolean;

	constructor(options: PluginRunnerOptions) {
		this.#onError = options.onError;
		this.#dev = options.dev;
		this.errorFrame = {
			phase: 'drag',
			plugin: this.hookMeta,
			node: null as unknown as HTMLElement,
		};
	}

	call<T>(
		inst: PluginHost,
		key: symbol,
		phase: ErrorInfo['phase'],
		hook: string,
		fn: () => T,
	): T | typeof PLUGIN_FAILED {
		const frame = this.errorFrame;
		frame.phase = phase;
		frame.node = inst.rootNode;
		this.hookMeta.key = key;
		this.hookMeta.hook = hook;
		try {
			return fn();
		} catch (error) {
			this.#report(frame, inst, key, error);
			return PLUGIN_FAILED;
		}
	}

	void(inst: PluginHost, key: symbol, phase: ErrorInfo['phase'], hook: string, fn: () => void) {
		const frame = this.errorFrame;
		frame.phase = phase;
		frame.node = inst.rootNode;
		this.hookMeta.key = key;
		this.hookMeta.hook = hook;
		try {
			fn();
		} catch (error) {
			this.#report(frame, inst, key, error);
		}
	}

	#report(info: Omit<ErrorInfo, 'error'>, inst: PluginHost, key: symbol, error: unknown) {
		this.#onError?.({ ...info, error });
		if (this.#dev()) throw error;
		inst.failed.add(key);
	}
}
