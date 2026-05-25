import { hasReactiveSlots, resolvePluginList } from './resolve-plugins.ts';
import type { DragPluginList, DropPluginList, PluginSlot } from './types.ts';

export const MAX_PLUGIN_UPDATE_DEPTH = 64;

export type PluginListInstance<P extends { key: symbol }> = {
	lastSlots: DragPluginList | DropPluginList | null;
	slotStaticCache: (P | undefined)[];
	flat: P[];
	byKey: Map<symbol, P>;
	isUpdating: boolean;
	updateDepth: number;
	pendingUpdate: DragPluginList | DropPluginList | null;
	isProcessingExternalUpdate: boolean;
	lastList: P[] | null;
};

export type ReconcilePluginUpdateOptions<P extends { key: symbol }> = {
	inst: PluginListInstance<P>;
	plugins: readonly PluginSlot<P>[];
	dev: boolean;
	warnLabel: 'drag' | 'drop';
	merge: (resolved: P[]) => P[];
	diff: (inst: PluginListInstance<P>, resolved: P[]) => void;
	recurse: (pending: readonly PluginSlot<P>[]) => void;
};

export function reconcilePluginListUpdate<P extends { key: symbol }>(
	options: ReconcilePluginUpdateOptions<P>,
): void {
	const { inst, plugins, dev, warnLabel, merge, diff, recurse } = options;

	if (!hasReactiveSlots(plugins) && inst.lastSlots === plugins) return;

	if (inst.lastSlots !== plugins) {
		inst.lastSlots = plugins;
		inst.slotStaticCache = [];
	}

	const resolved = hasReactiveSlots(plugins)
		? resolvePluginList(plugins, inst.slotStaticCache, true)
		: resolvePluginList(plugins, inst.slotStaticCache, false);

	const merged = merge(resolved);
	if (merged.length === inst.flat.length) {
		let same = true;
		for (const plugin of merged) {
			if (inst.byKey.get(plugin.key) !== plugin) {
				same = false;
				break;
			}
		}
		if (same) {
			inst.lastList = resolved;
			return;
		}
	}

	if (inst.isUpdating) {
		inst.pendingUpdate = plugins;
		return;
	}

	if (inst.updateDepth >= MAX_PLUGIN_UPDATE_DEPTH) {
		if (dev) {
			console.warn(
				`[neodrag] ${warnLabel} update depth limit reached; coalescing pending plugin reconciliation`,
			);
		}
		inst.pendingUpdate = plugins;
		return;
	}

	inst.isUpdating = true;
	inst.updateDepth++;

	if (inst.isProcessingExternalUpdate) {
		inst.pendingUpdate = plugins;
		inst.updateDepth--;
		inst.isUpdating = false;
		return;
	}

	inst.lastList = resolved;
	diff(inst, resolved);
	inst.updateDepth--;
	inst.isUpdating = false;

	const pending = inst.pendingUpdate;
	inst.pendingUpdate = null;
	if (pending && pending !== plugins) recurse(pending);
}
