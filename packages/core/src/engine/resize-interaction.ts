import { applyResize, captureResizeLayout, restoreResizeLayout } from '../apply-resize.ts';
import { inverseScaleFromNode } from '../lib/inverse-scale.ts';
import { diffPluginFlat, mergePluginsByKey, pluginsLayoutChanged } from '../plugin-lifecycle.ts';
import { sortByPhase } from '../phase.ts';
import { ResizableEngineExtensions } from '../resizable/engine-extensions.ts';
import type { ExtensionRegistry } from './extension-registry.ts';
import { measureCost } from '../engine-profile.ts';
import type { ResizeInstance } from '../resize-instance.ts';
import { PLUGIN_FAILED, PluginRunner } from './plugin-runner.ts';
import type { InteractionInput } from '../interaction-input.ts';
import { assertNamedPluginKeys } from '../types.ts';
import type { ResizeCtx, ResizeEndReason, ResizePlugin } from '../resize/types.ts';

export type ResizeInteractionDeps = {
	engine: object;
	plugins: PluginRunner;
	extensions: ExtensionRegistry;
	dev: () => boolean;
	defaultPlugins: () => ResizePlugin[];
	endActiveInteraction: (reason: 'cancel' | 'commit') => void;
	getActiveResizeSource: () => ResizeInstance | null;
	finishResize: (reason: ResizeEndReason, input: InteractionInput) => void;
};

export class ResizeInteraction {
	readonly #deps: ResizeInteractionDeps;

	constructor(deps: ResizeInteractionDeps) {
		ResizableEngineExtensions.ensureInstalled();
		this.#deps = deps;
	}

	inverseScale(inst: ResizeInstance) {
		return inverseScaleFromNode(inst.targetNode, inst.cachedTargetRect);
	}

	mergeUser(userPlugins: ResizePlugin[]) {
		assertNamedPluginKeys(userPlugins, this.#deps.dev());
		return mergePluginsByKey(this.#deps.defaultPlugins(), userPlugins);
	}

	install(inst: ResizeInstance, userPlugins: ResizePlugin[]) {
		const merged = this.mergeUser(userPlugins);
		inst.flat = merged;
		inst.byKey = new Map(merged.map((p) => [p.key, p]));
		inst.rebuildBuckets();
		this.initAll(inst);
	}

	diff(inst: ResizeInstance, userPlugins: ResizePlugin[]) {
		const width = inst.width;
		const height = inst.height;
		diffPluginFlat(inst, {
			userPlugins,
			merge: (resolved) => this.mergeUser(resolved),
			bucketsChanged: (prev, next) =>
				pluginsLayoutChanged(prev, next, (plugin) => [
					!!plugin.start,
					!!plugin.resize,
					!!plugin.end,
				]),
			init: (plugin) => this.initOne(inst, plugin),
			destroy: (plugin) => this.destroyOne(inst, plugin),
			update: (plugin) => plugin.update?.(inst.resizeCtx, inst.states.get(plugin.key)),
		});
		if (inst.width !== width || inst.height !== height) this.sync(inst);
		inst.effects.flush();
	}

	sync(inst: ResizeInstance) {
		inst.syncDisplaySize();
		applyResize(
			inst.targetNode,
			inst.displaySize,
			{ width: inst.width, height: inst.height },
			inst.anchor,
			inst.applyResize,
			inst.resizeOrigin,
		);
	}

	initAll(inst: ResizeInstance) {
		for (const plugin of sortByPhase(inst.flat)) this.initOne(inst, plugin);
		inst.effects.flush();
	}

	initOne(inst: ResizeInstance, plugin: ResizePlugin) {
		if (!plugin.init) return;
		this.#deps.plugins.void(inst, plugin.key, 'init', 'init', () => {
			const state = plugin.init!(inst.resizeCtx);
			if (state !== undefined) inst.states.set(plugin.key, state);
		});
	}

	destroyOne(inst: ResizeInstance, plugin: ResizePlugin) {
		if (!plugin.destroy) {
			inst.states.delete(plugin.key);
			return;
		}
		this.#deps.plugins.void(inst, plugin.key, 'destroy', 'destroy', () =>
			plugin.destroy!(inst.resizeCtx, inst.states.get(plugin.key)),
		);
		inst.states.delete(plugin.key);
	}

	destroy(inst: ResizeInstance) {
		if (this.#deps.getActiveResizeSource() === inst && inst.isInteracting) {
			inst.cancelled = true;
			this.#deps.endActiveInteraction('cancel');
		}
		for (const plugin of inst.flat) this.destroyOne(inst, plugin);
		inst.controller.abort();
		inst.effects.clear();
	}

	runStart(inst: ResizeInstance, ctx: ResizeCtx, input: InteractionInput): boolean {
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
		return true;
	}

	runResize(inst: ResizeInstance, ctx: ResizeCtx, input: InteractionInput) {
		const chain = inst.resizeChain;

		for (let i = 0; i < chain.length; i++) {
			const plugin = chain[i]!;
			if (inst.failed.has(plugin.key) || !plugin.resize) continue;
			if (inst.cancelled && plugin.skipOnCancel) continue;

			const state = inst.states.get(plugin.key);
			const patch = this.#deps.plugins.call(inst, plugin.key, 'resize', 'resize', () =>
				plugin.resize!(ctx, state, input),
			);
			if (patch === PLUGIN_FAILED) continue;

			if (patch) {
				if (patch.width !== undefined) inst.proposedWidth = patch.width;
				if (patch.height !== undefined) inst.proposedHeight = patch.height;
			}

			if (inst.cancelled) break;
		}
	}

	runEnd(inst: ResizeInstance, ctx: ResizeCtx, input: InteractionInput, reason: ResizeEndReason) {
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
	}

	restoreLayoutOnCancel(inst: ResizeInstance) {
		inst.width = inst.initialWidth;
		inst.height = inst.initialHeight;
		inst.displaySize = inst.lengthAdapter.cloneAuthored(inst.initialAuthored);
		inst.unitPreserve = inst.lengthAdapter.cloneAuthored(inst.initialAuthored);
		if (inst.resizeOrigin && inst.targetNode instanceof HTMLElement) {
			restoreResizeLayout(inst.targetNode, inst.resizeOrigin);
		}
		this.sync(inst);
		inst.effects.flush();
	}

	notifyLayoutCommit(inst: ResizeInstance) {
		this.#deps.extensions.runNodeLayoutChange(inst.targetNode);
	}

	captureOrigin(inst: ResizeInstance) {
		if (inst.targetNode instanceof HTMLElement) {
			return captureResizeLayout(inst.targetNode, {
				width: inst.width,
				height: inst.height,
			});
		}
		return null;
	}
}

export type ResizePluginHostDeps = ResizeInteractionDeps;
export const ResizePluginHost = ResizeInteraction;
