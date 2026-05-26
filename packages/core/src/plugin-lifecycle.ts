import type { PluginPhase } from './types.ts';

export function mergePluginsByKey<P extends { key: symbol }>(defaults: P[], user: P[]): P[] {
	const byKey = new Map<symbol, P>();
	for (const plugin of defaults) byKey.set(plugin.key, plugin);
	for (const plugin of user) byKey.set(plugin.key, plugin);
	return [...byKey.values()];
}

export function pluginsLayoutChanged<P extends { key: symbol; phase?: PluginPhase }>(
	prev: P[],
	next: P[],
	hooks: (plugin: P) => readonly boolean[],
): boolean {
	if (prev.length !== next.length) return true;
	for (let i = 0; i < next.length; i++) {
		const a = prev[i]!;
		const b = next[i]!;
		if (a.key !== b.key || (a.phase ?? 'resolve') !== (b.phase ?? 'resolve')) return true;
		const aHooks = hooks(a);
		const bHooks = hooks(b);
		if (aHooks.length !== bHooks.length) return true;
		for (let j = 0; j < aHooks.length; j++) {
			if (aHooks[j] !== bHooks[j]) return true;
		}
	}
	return false;
}

export type PluginFlatHost<P extends { key: symbol }> = {
	flat: P[];
	byKey: Map<symbol, P>;
	isProcessingExternalUpdate: boolean;
	rebuildBuckets(): void;
};

export function diffPluginFlat<P extends { key: symbol }>(host: PluginFlatHost<P>, options: {
	userPlugins: P[];
	merge: (user: P[]) => P[];
	bucketsChanged: (prev: P[], next: P[]) => boolean;
	init: (plugin: P) => void;
	destroy: (plugin: P) => void;
	update: (plugin: P) => void;
}): void {
	host.isProcessingExternalUpdate = true;
	const next = options.merge(options.userPlugins);
	const prevFlat = host.flat;
	const prevByKey = new Map(prevFlat.map((plugin) => [plugin.key, plugin]));

	for (const plugin of next) {
		const prev = prevByKey.get(plugin.key);
		if (!prev) {
			host.byKey.set(plugin.key, plugin);
			options.init(plugin);
		} else if (prev !== plugin) {
			options.update(plugin);
			host.byKey.set(plugin.key, plugin);
		}
		prevByKey.delete(plugin.key);
	}

	for (const orphan of prevByKey.values()) {
		options.destroy(orphan);
		host.byKey.delete(orphan.key);
	}

	host.flat = next;
	if (options.bucketsChanged(prevFlat, next)) host.rebuildBuckets();
	host.isProcessingExternalUpdate = false;
}
