import type { InteractionInput } from './interaction-input.ts';
import type { LengthAdapter } from './length-runtime.ts';
import type { SizeInput } from './length-runtime.ts';
import type { MarkupAdapter } from './markup-adapter.ts';

export type EndReason = 'drop' | 'no-target' | 'cancel';

export type SessionState = 'idle' | 'pending' | 'active' | 'completed' | 'cancelled';

export type DeltaPatch = { x?: number; y?: number };

export type PluginPhase = 'pre' | 'resolve' | 'post';

export interface SessionPrivateStore {
	get<T>(key: SessionKey<T>): T | undefined;
	set<T>(key: SessionKey<T>, value: T): void;
	delete(key: SessionKey<unknown>): void;
	has(key: SessionKey<unknown>): boolean;
}

export interface SessionKey<T> {
	readonly __brand: T;
	readonly id: symbol;
}

export function createSessionKey<T>(): SessionKey<T> {
	return { id: Symbol('neodrag.session'), __brand: undefined as T };
}

export interface DragSourceInfo {
	node: HTMLElement | SVGElement;
	rect: DOMRect;
}

export interface DropTargetInfo {
	node: HTMLElement | SVGElement;
	rect: DOMRect;
}

export interface DragSession<T = unknown> {
	readonly state: SessionState;
	readonly source: DragSourceInfo;
	readonly visual: DragSourceInfo;
	readonly pointer: { readonly x: number; readonly y: number };
	readonly delta: { readonly x: number; readonly y: number };
	data: T;
	readonly overTargets: ReadonlyArray<DropTargetInfo>;
	readonly private: SessionPrivateStore;
	setVisual(node: HTMLElement | SVGElement): void;
	cancel(): void;
	stopPropagation(): void;
}

export interface DragCtx {
	readonly delta: { x: number; y: number };
	readonly proposed: { x: number; y: number };
	readonly offset: { x: number; y: number };
	readonly offsetPx: { x: number; y: number };
	readonly offsetAuthored?: { x: SizeInput; y: SizeInput };
	readonly length: LengthAdapter;
	readonly initial: { x: number; y: number };
	readonly isDragging: boolean;
	readonly isInteracting: boolean;
	readonly rootNode: HTMLElement | SVGElement;
	readonly markup: MarkupAdapter;
	readonly lastInput: InteractionInput | null;
	readonly lastEvent: PointerEvent | null;
	readonly cachedRootNodeRect: DOMRect;
	readonly session: DragSession;
	effect(fn: () => void): void;
	cancel(): void;
	setForcedPosition(x: SizeInput, y: SizeInput): void;
	setVisual(node: HTMLElement | SVGElement): void;
}

export interface DropCtx {
	readonly pointer: { x: number; y: number };
	readonly session: DragSession;
	readonly rootNode: HTMLElement | SVGElement;
	readonly markup: MarkupAdapter;
	readonly cachedRootNodeRect: DOMRect;
	readonly lastInput: InteractionInput | null;
	readonly lastEvent: PointerEvent | null;
	readonly isOver: boolean;
	readonly length: LengthAdapter;
	effect(fn: () => void): void;
}

const DEV = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';

export function pluginKeyLabel(key: symbol): string {
	return key.description ?? 'plugin';
}

export function assertNamedPluginKey(key: symbol, dev: boolean = DEV): void {
	if (!dev) return;
	const label = key.description;
	if (label != null && label !== '') return;
	throw new Error(
		'Neodrag plugin key must be a named Symbol (e.g. Symbol("my-plugin")). Anonymous Symbol() is not allowed when dev mode is on.',
	);
}

export function assertNamedPluginKeys(
	plugins: readonly { key: symbol }[],
	dev: boolean = DEV,
): void {
	if (!dev) return;
	for (const plugin of plugins) assertNamedPluginKey(plugin.key, true);
}

export interface DragPlugin<S = unknown> {
	key: symbol;
	phase?: PluginPhase;
	skipOnCancel?: boolean;
	init?(ctx: DragCtx): S;
	start?(ctx: DragCtx, state: S, input: InteractionInput): boolean | void;
	drag?(ctx: DragCtx, state: S, input: InteractionInput): DeltaPatch | void;
	update?(ctx: DragCtx, state: S): void;
	end?(ctx: DragCtx, state: S, input: InteractionInput, reason: EndReason): void;
	destroy?(ctx: DragCtx, state: S): void;
}

export interface DropPlugin<S = unknown> {
	key: symbol;
	phase?: PluginPhase;
	init?(ctx: DropCtx): S;
	enter?(ctx: DropCtx, state: S, input: InteractionInput): boolean | void;
	over?(ctx: DropCtx, state: S, input: InteractionInput): void;
	leave?(ctx: DropCtx, state: S, input: InteractionInput): void;
	drop?(ctx: DropCtx, state: S, input: InteractionInput): void;
	update?(ctx: DropCtx, state: S): void;
	destroy?(ctx: DropCtx, state: S): void;
}

export type PluginSlot<T> = T | (() => T | T[]);

export type DragPluginList = PluginSlot<DragPlugin>[];
export type DropPluginList = PluginSlot<DropPlugin>[];

export interface ErrorInfo {
	phase:
		| 'init'
		| 'start'
		| 'drag'
		| 'resize'
		| 'end'
		| 'enter'
		| 'over'
		| 'leave'
		| 'drop'
		| 'update'
		| 'destroy';
	plugin?: {
		key: symbol;
		hook: string;
	};
	node: HTMLElement | SVGElement;
	error: unknown;
}

export function defineDragPlugin<S = unknown, Args extends unknown[] = []>(
	fn: (...args: Args) => DragPlugin<S>,
) {
	return fn;
}

export function defineDropPlugin<S = unknown, Args extends unknown[] = []>(
	fn: (...args: Args) => DropPlugin<S>,
) {
	return fn;
}
