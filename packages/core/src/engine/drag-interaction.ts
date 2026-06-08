import { applyDragTransform } from '../apply-transform.ts';
import { applyDragMarkupEnd } from '../drag-markup.ts';
import { inverseScaleFromNode } from '../lib/inverse-scale.ts';
import { diffPluginFlat, mergePluginsByKey, pluginsLayoutChanged } from '../plugin-lifecycle.ts';
import { sortByPhase } from '../phase.ts';
import type { ExtensionRegistry } from './extension-registry.ts';
import { measureCost } from '../engine-profile.ts';
import type { DragInstance } from '../instance.ts';
import { PLUGIN_FAILED, PluginRunner } from './plugin-runner.ts';
import type { InteractionInput } from '../interaction-input.ts';
import {
	assertNamedPluginKeys,
	type DragCtx,
	type DragPlugin,
	type EndReason,
} from '../types.ts';

export type DragInteractionDeps = {
	engine: object;
	plugins: PluginRunner;
	extensions: ExtensionRegistry;
	dev: () => boolean;
	defaultPlugins: () => DragPlugin[];
	endActiveInteraction: (reason: EndReason) => void;
	getActiveSource: () => DragInstance | null;
};

export class DragInteraction {
	readonly #deps: DragInteractionDeps;

	constructor(deps: DragInteractionDeps) {
		this.#deps = deps;
	}

	inverseScale(inst: DragInstance) {
		return inverseScaleFromNode(inst.rootNode, inst.cachedRootNodeRect);
	}

	mergeUser(userPlugins: DragPlugin[]) {
		assertNamedPluginKeys(userPlugins, this.#deps.dev());
		return mergePluginsByKey(this.#deps.defaultPlugins(), userPlugins);
	}

	install(inst: DragInstance, userPlugins: DragPlugin[]) {
		measureCost(this.#deps.engine, 'bind.install', () => {
			const merged = this.mergeUser(userPlugins);
			inst.flat = merged;
			inst.byKey = new Map(merged.map((p) => [p.key, p]));
			inst.rebuildBuckets();
			this.initAll(inst);
		});
	}

	diff(inst: DragInstance, userPlugins: DragPlugin[]) {
		measureCost(this.#deps.engine, 'bind.diff', () => {
			const offsetX = inst.offsetX;
			const offsetY = inst.offsetY;
			diffPluginFlat(inst, {
				userPlugins,
				merge: (resolved) => this.mergeUser(resolved),
				bucketsChanged: (prev, next) =>
					pluginsLayoutChanged(prev, next, (plugin) => [
						!!plugin.start,
						!!plugin.drag,
						!!plugin.end,
					]),
				init: (plugin) => this.initOne(inst, plugin),
				destroy: (plugin) => this.destroyOne(inst, plugin),
				update: (plugin) => plugin.update?.(inst.dragCtx, inst.states.get(plugin.key)),
			});
			if (inst.offsetX !== offsetX || inst.offsetY !== offsetY) {
				inst.syncLiveViews();
				this.syncTransform(inst);
			}
			inst.effects.flush();
		});
	}

	syncTransform(inst: DragInstance) {
		measureCost(this.#deps.engine, 'syncTransform', () => applyDragTransform(inst.dragCtx, inst.applyTransform));
	}

	initAll(inst: DragInstance) {
		for (const plugin of sortByPhase(inst.flat)) this.initOne(inst, plugin);
		inst.effects.flush();
	}

	initOne(inst: DragInstance, plugin: DragPlugin) {
		if (!plugin.init) return;
		this.#deps.plugins.void(inst, plugin.key, 'init', 'init', () => {
			const state = plugin.init!(inst.dragCtx);
			if (state !== undefined) inst.states.set(plugin.key, state);
		});
	}

	destroyOne(inst: DragInstance, plugin: DragPlugin) {
		if (!plugin.destroy) {
			inst.states.delete(plugin.key);
			return;
		}
		this.#deps.plugins.void(inst, plugin.key, 'destroy', 'destroy', () =>
			plugin.destroy!(inst.dragCtx, inst.states.get(plugin.key)),
		);
		inst.states.delete(plugin.key);
	}

	destroy(inst: DragInstance) {
		measureCost(this.#deps.engine, 'bind.destroy', () => {
			if (this.#deps.getActiveSource() === inst && inst.isInteracting) {
				inst.cancelled = true;
				this.#deps.endActiveInteraction('cancel');
			}
			for (const plugin of inst.flat) this.destroyOne(inst, plugin);
			inst.controller.abort();
			inst.effects.clear();
		});
	}

	runStart(inst: DragInstance, ctx: DragCtx, input: InteractionInput): boolean {
		return measureCost(this.#deps.engine, 'runStart', () => this.#runStartCore(inst, ctx, input));
	}

	#runStartCore(inst: DragInstance, ctx: DragCtx, input: InteractionInput): boolean {
		const chain = inst.startChain;
		for (let i = 0; i < chain.length; i++) {
			const plugin = chain[i]!;
			if (inst.failed.has(plugin.key) || !plugin.start) continue;
			const state = inst.states.get(plugin.key);
			const out = this.#deps.plugins.call(inst, plugin.key, 'start', 'start', () =>
				plugin.start!(ctx, state, input),
			);
			if (out === PLUGIN_FAILED) return false;
			if (out === false) return false;
			if (inst.cancelled) return false;
		}

		inst.cachedRootNodeRect = inst.rootNode.getBoundingClientRect();
		inst.inverseScale = this.inverseScale(inst);
		this.#deps.extensions.runStartAfterPlugins({ inst, dragCtx: ctx, input });

		return true;
	}

	runDrag(inst: DragInstance, ctx: DragCtx, input: InteractionInput): boolean {
		return measureCost(this.#deps.engine, 'runDrag', () => this.#runDragCore(inst, ctx, input));
	}

	#runDragCore(inst: DragInstance, ctx: DragCtx, input: InteractionInput): boolean {
		const chain = inst.dragChain;
		let patched = false;

		for (let i = 0; i < chain.length; i++) {
			const plugin = chain[i]!;
			if (inst.failed.has(plugin.key) || !plugin.drag) continue;
			if (inst.cancelled && plugin.skipOnCancel) continue;

			const state = inst.states.get(plugin.key);
			const patch = this.#deps.plugins.call(inst, plugin.key, 'drag', 'drag', () =>
				plugin.drag!(ctx, state, input),
			);
			if (patch === PLUGIN_FAILED) continue;

			if (patch) {
				if (patch.x !== undefined) inst.proposedX = patch.x;
				if (patch.y !== undefined) inst.proposedY = patch.y;
				patched = true;
			}

			if (inst.cancelled) break;
		}
		return patched;
	}

	runEnd(inst: DragInstance, ctx: DragCtx, input: InteractionInput, reason: EndReason) {
		measureCost(this.#deps.engine, 'runEnd', () => this.#runEndCore(inst, ctx, input, reason));
	}

	#runEndCore(inst: DragInstance, ctx: DragCtx, input: InteractionInput, reason: EndReason) {
		const chain = inst.endChain;
		for (let i = 0; i < chain.length; i++) {
			const plugin = chain[i]!;
			if (inst.failed.has(plugin.key) || !plugin.end) continue;
			if (inst.cancelled && plugin.skipOnCancel) continue;
			const state = inst.states.get(plugin.key);
			this.#deps.plugins.void(inst, plugin.key, 'end', 'end', () =>
				plugin.end!(ctx, state, input, reason),
			);
		}
		if (!inst.cancelled) {
			inst.dragEndCount++;
			applyDragMarkupEnd(inst.markup, inst.rootNode, inst.dragEndCount);
		}
	}
}

export type DragPluginHostDeps = DragInteractionDeps;
export const DragPluginHost = DragInteraction;
