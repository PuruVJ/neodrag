import type { DragInstance } from '../instance.ts';
import type { DropInstance } from '../instance.ts';
import type { DragCtx } from '../types.ts';
import type { DropPlugin } from '../types.ts';
import type { InteractionInput } from '../interaction-input.ts';

export type EngineExtensionHooks = {
	onPointerDown?: (ctx: { inst: DragInstance; node: HTMLElement | SVGElement }) => void;
	onPointerDelta?: (ctx: { inst: DragInstance; input: InteractionInput }) => void;
	onStartAfterPlugins?: (ctx: {
		inst: DragInstance;
		dragCtx: DragCtx;
		input: InteractionInput;
	}) => void;
	onFinish?: (ctx: { inst: DragInstance; wasDragging: boolean }) => void | Promise<void>;
	filterDropCandidates?: (ctx: {
		candidates: DropInstance[];
		sessionData: unknown;
		x: number;
		y: number;
		pickBest: (drops: DropInstance[], x: number, y: number) => DropInstance;
	}) => DropInstance | null;
	dropPointerSamples?: (ctx: {
		sessionData: unknown;
		pointerX: number;
		pointerY: number;
	}) => { x: number; y: number }[] | null;
	onDropPluginInit?: (ctx: { inst: DropInstance; plugin: DropPlugin; state: unknown }) => void;
	onDropPluginDestroy?: (ctx: { inst: DropInstance; plugin: DropPlugin }) => void;
	onNodeLayoutChange?: (node: HTMLElement | SVGElement) => void;
};

export class ExtensionRegistry {
	readonly #hooks: EngineExtensionHooks[] = [];

	register(hooks: EngineExtensionHooks): () => void {
		this.#hooks.push(hooks);
		return () => {
			const index = this.#hooks.indexOf(hooks);
			if (index >= 0) this.#hooks.splice(index, 1);
		};
	}

	runPointerDown(ctx: Parameters<NonNullable<EngineExtensionHooks['onPointerDown']>>[0]): void {
		for (const ext of this.#hooks) ext.onPointerDown?.(ctx);
	}

	runPointerDelta(ctx: Parameters<NonNullable<EngineExtensionHooks['onPointerDelta']>>[0]): void {
		for (const ext of this.#hooks) ext.onPointerDelta?.(ctx);
	}

	runStartAfterPlugins(
		ctx: Parameters<NonNullable<EngineExtensionHooks['onStartAfterPlugins']>>[0],
	): void {
		for (const ext of this.#hooks) ext.onStartAfterPlugins?.(ctx);
	}

	runFinish(ctx: Parameters<NonNullable<EngineExtensionHooks['onFinish']>>[0]): void | Promise<void> {
		let pending: Promise<void> | undefined;
		for (const ext of this.#hooks) {
			const out = ext.onFinish?.(ctx);
			if (out instanceof Promise) {
				pending = pending ? pending.then(() => out) : out;
			}
		}
		return pending;
	}

	runDropCandidateFilter(
		ctx: Parameters<NonNullable<EngineExtensionHooks['filterDropCandidates']>>[0],
	): DropInstance | null {
		for (const ext of this.#hooks) {
			const out = ext.filterDropCandidates?.(ctx);
			if (out) return out;
		}
		return null;
	}

	runDropPointerSamples(
		ctx: Parameters<NonNullable<EngineExtensionHooks['dropPointerSamples']>>[0],
	): { x: number; y: number }[] | null {
		for (const ext of this.#hooks) {
			const out = ext.dropPointerSamples?.(ctx);
			if (out?.length) return out;
		}
		return null;
	}

	runDropPluginInit(ctx: Parameters<NonNullable<EngineExtensionHooks['onDropPluginInit']>>[0]): void {
		for (const ext of this.#hooks) ext.onDropPluginInit?.(ctx);
	}

	runDropPluginDestroy(
		ctx: Parameters<NonNullable<EngineExtensionHooks['onDropPluginDestroy']>>[0],
	): void {
		for (const ext of this.#hooks) ext.onDropPluginDestroy?.(ctx);
	}

	runNodeLayoutChange(node: HTMLElement | SVGElement): void {
		for (const ext of this.#hooks) ext.onNodeLayoutChange?.(node);
	}
}

export const engineExtensions = new ExtensionRegistry();

export function registerEngineExtensions(hooks: EngineExtensionHooks): () => void {
	return engineExtensions.register(hooks);
}

export type DragExtensions = EngineExtensionHooks;
export type DragExtensionRegistry = ExtensionRegistry;
export const dragExtensions = engineExtensions;
export const registerDragExtensions = registerEngineExtensions;

export const runPointerDownHooks = (ctx: Parameters<NonNullable<EngineExtensionHooks['onPointerDown']>>[0]) =>
	engineExtensions.runPointerDown(ctx);
export const runPointerDeltaHooks = (ctx: Parameters<NonNullable<EngineExtensionHooks['onPointerDelta']>>[0]) =>
	engineExtensions.runPointerDelta(ctx);
export const runStartAfterPluginsHooks = (
	ctx: Parameters<NonNullable<EngineExtensionHooks['onStartAfterPlugins']>>[0],
) => engineExtensions.runStartAfterPlugins(ctx);
export const runFinishHooks = (ctx: Parameters<NonNullable<EngineExtensionHooks['onFinish']>>[0]) =>
	engineExtensions.runFinish(ctx);
export const runDropCandidateFilter = (
	ctx: Parameters<NonNullable<EngineExtensionHooks['filterDropCandidates']>>[0],
) => engineExtensions.runDropCandidateFilter(ctx);
export const runDropPluginInitHooks = (
	ctx: Parameters<NonNullable<EngineExtensionHooks['onDropPluginInit']>>[0],
) => engineExtensions.runDropPluginInit(ctx);
export const runDropPluginDestroyHooks = (
	ctx: Parameters<NonNullable<EngineExtensionHooks['onDropPluginDestroy']>>[0],
) => engineExtensions.runDropPluginDestroy(ctx);
export const runNodeLayoutChangeHooks = (node: HTMLElement | SVGElement) =>
	engineExtensions.runNodeLayoutChange(node);
