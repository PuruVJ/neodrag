import { diffPluginFlat, mergePluginsByKey, pluginsLayoutChanged } from '../plugin-lifecycle.ts';
import { sortByPhase } from '../phase.ts';
import {
	COLLISION_PRIORITY_KEY,
	COLLISION_STRATEGY_KEY,
	DROP_HIT_EXPAND_KEY,
} from '../plugins/keys.ts';
import type { DropCollisionStrategy } from '../plugins/drop.ts';
import type { ExtensionRegistry } from './extension-registry.ts';
import { measureCost } from '../engine-profile.ts';
import type { DropInstance } from '../instance.ts';
import { PLUGIN_FAILED, PluginRunner } from './plugin-runner.ts';
import type { InteractionInput } from '../interaction-input.ts';
import { assertNamedPluginKeys, type DropPlugin } from '../types.ts';

export type DropInteractionDeps = {
	engine: object;
	plugins: PluginRunner;
	extensions: ExtensionRegistry;
	dev: () => boolean;
	defaultPlugins: () => DropPlugin[];
};

export class DropInteraction {
	readonly #deps: DropInteractionDeps;

	constructor(deps: DropInteractionDeps) {
		this.#deps = deps;
	}

	mergeUser(userPlugins: DropPlugin[]) {
		assertNamedPluginKeys(userPlugins, this.#deps.dev());
		return mergePluginsByKey(this.#deps.defaultPlugins(), userPlugins);
	}

	install(inst: DropInstance, userPlugins: DropPlugin[]) {
		const merged = this.mergeUser(userPlugins);
		inst.flat = merged;
		inst.byKey = new Map(merged.map((p) => [p.key, p]));
		inst.rebuildBuckets();
		this.initAll(inst);
	}

	diff(inst: DropInstance, userPlugins: DropPlugin[]) {
		diffPluginFlat(inst, {
			userPlugins,
			merge: (resolved) => this.mergeUser(resolved),
			bucketsChanged: (prev, next) =>
				pluginsLayoutChanged(prev, next, (plugin) => [
					!!plugin.enter,
					!!plugin.over,
					!!plugin.leave,
					!!plugin.drop,
				]),
			init: (plugin) => this.initOne(inst, plugin),
			destroy: (plugin) => this.destroyOne(inst, plugin),
			update: (plugin) => plugin.update?.(inst.dropCtx, inst.states.get(plugin.key)),
		});
		inst.effects.flush();
	}

	initAll(inst: DropInstance) {
		for (const plugin of sortByPhase(inst.flat)) this.initOne(inst, plugin);
		inst.effects.flush();
	}

	initOne(inst: DropInstance, plugin: DropPlugin) {
		if (!plugin.init) return;
		this.#deps.plugins.void(inst, plugin.key, 'init', 'init', () => {
			const state = plugin.init!(inst.dropCtx);
			if (state !== undefined) {
				inst.states.set(plugin.key, state);
				this.#deps.extensions.runDropPluginInit({ inst, plugin, state });
				if (plugin.key === DROP_HIT_EXPAND_KEY) {
					inst.hitExpandPx = state as {
						top: number;
						right: number;
						bottom: number;
						left: number;
					};
				}
				if (plugin.key === COLLISION_PRIORITY_KEY) {
					inst.collisionPriority = state as number;
				}
				if (plugin.key === COLLISION_STRATEGY_KEY) {
					inst.collisionStrategy = state as DropCollisionStrategy;
				}
			}
		});
	}

	destroyOne(inst: DropInstance, plugin: DropPlugin) {
		this.#deps.extensions.runDropPluginDestroy({ inst, plugin });
		if (plugin.key === DROP_HIT_EXPAND_KEY) inst.hitExpandPx = null;
		if (plugin.key === COLLISION_PRIORITY_KEY) inst.collisionPriority = 0;
		if (plugin.key === COLLISION_STRATEGY_KEY) inst.collisionStrategy = 'pointer';
		if (!plugin.destroy) {
			inst.states.delete(plugin.key);
			return;
		}
		this.#deps.plugins.void(inst, plugin.key, 'destroy', 'destroy', () =>
			plugin.destroy!(inst.dropCtx, inst.states.get(plugin.key)),
		);
		inst.states.delete(plugin.key);
	}

	destroy(inst: DropInstance) {
		for (const plugin of inst.flat) this.destroyOne(inst, plugin);
		inst.controller.abort();
		inst.effects.clear();
	}

	#chain(inst: DropInstance, hook: 'enter' | 'over' | 'leave' | 'drop') {
		switch (hook) {
			case 'enter':
				return inst.enterChain;
			case 'over':
				return inst.overChain;
			case 'leave':
				return inst.leaveChain;
			default:
				return inst.dropChain;
		}
	}

	runHook(
		inst: DropInstance,
		hook: 'enter' | 'over' | 'leave' | 'drop',
		input: InteractionInput,
	): boolean | void {
		return measureCost(this.#deps.engine, 'drop.hook', () => this.#runHookCore(inst, hook, input));
	}

	#runHookCore(
		inst: DropInstance,
		hook: 'enter' | 'over' | 'leave' | 'drop',
		input: InteractionInput,
	): boolean | void {
		const ctx = inst.dropCtx;
		const chain = this.#chain(inst, hook);

		for (let i = 0; i < chain.length; i++) {
			const plugin = chain[i]!;
			if (inst.failed.has(plugin.key)) continue;
			const handler = plugin[hook];
			if (!handler) continue;
			const state = inst.states.get(plugin.key);

			const out = this.#deps.plugins.call(inst, plugin.key, hook, hook, () =>
				handler(ctx, state, input),
			);
			if (out === PLUGIN_FAILED) continue;
			if (hook === 'enter' && out === false) return false;
		}
		return true;
	}
}

export type DropPluginHostDeps = DropInteractionDeps;
export const DropPluginHost = DropInteraction;
