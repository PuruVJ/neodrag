import type { Compartment } from './compartment.ts';

export type EndReason = 'drop' | 'no-target' | 'cancel';

export type SessionState = 'idle' | 'pending' | 'active' | 'completed' | 'cancelled';

export type DeltaPatch = { x?: number; y?: number };

export type PluginPhase = 'pre' | 'resolve' | 'post';

export type SessionListener = (session: DragSession) => (() => void) | void;

export interface SessionPrivateStore {
	get<T>(key: SessionKey<T>): T | undefined;
	set<T>(key: SessionKey<T>, value: T): void;
	has(key: SessionKey<unknown>): boolean;
}

export interface SessionKey<T> {
	readonly __brand: T;
	readonly id: symbol;
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
	readonly initial: { x: number; y: number };
	readonly isDragging: boolean;
	readonly isInteracting: boolean;
	readonly rootNode: HTMLElement | SVGElement;
	readonly lastEvent: PointerEvent | null;
	readonly cachedRootNodeRect: DOMRect;
	readonly session: DragSession;
	effect(fn: () => void): void;
	cancel(): void;
	setForcedPosition(x: number, y: number): void;
	setVisual(node: HTMLElement | SVGElement): void;
}

export interface DropCtx {
	readonly pointer: { x: number; y: number };
	readonly session: DragSession;
	readonly rootNode: HTMLElement | SVGElement;
	readonly cachedRootNodeRect: DOMRect;
	readonly lastEvent: PointerEvent | null;
	readonly isOver: boolean;
	effect(fn: () => void): void;
}

export interface DragPlugin<S = unknown> {
	key: symbol;
	name: string;
	phase?: PluginPhase;
	skipOnCancel?: boolean;
	init?(ctx: DragCtx): S;
	start?(ctx: DragCtx, state: S, event: PointerEvent): boolean | void;
	drag?(ctx: DragCtx, state: S, event: PointerEvent): DeltaPatch | void;
	update?(ctx: DragCtx, state: S): void;
	end?(ctx: DragCtx, state: S, event: PointerEvent, reason: EndReason): void;
	destroy?(ctx: DragCtx, state: S): void;
}

export interface DropPlugin<S = unknown> {
	key: symbol;
	name: string;
	phase?: PluginPhase;
	init?(ctx: DropCtx): S;
	enter?(ctx: DropCtx, state: S, event: PointerEvent): boolean | void;
	over?(ctx: DropCtx, state: S, event: PointerEvent): void;
	leave?(ctx: DropCtx, state: S, event: PointerEvent): void;
	drop?(ctx: DropCtx, state: S, event: PointerEvent): void;
	update?(ctx: DropCtx, state: S): void;
	destroy?(ctx: DropCtx, state: S): void;
}

export type DragPluginEntry = DragPlugin | Compartment;

export type DragPluginInput = DragPluginEntry[] | (() => DragPluginEntry[]);
export type DropPluginInput = DropPlugin[] | (() => DropPlugin[]);

export interface ErrorInfo {
	phase: 'init' | 'start' | 'drag' | 'end' | 'enter' | 'over' | 'leave' | 'drop' | 'update' | 'destroy';
	plugin?: {
		name: string;
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

export abstract class DragPluginBase<S = unknown> implements DragPlugin<S> {
	abstract readonly key: symbol;
	abstract readonly name: string;
	phase?: PluginPhase;
	skipOnCancel?: boolean;
	abstract init?(ctx: DragCtx): S;
	start?(ctx: DragCtx, state: S, event: PointerEvent): boolean | void;
	drag?(ctx: DragCtx, state: S, event: PointerEvent): DeltaPatch | void;
	update?(ctx: DragCtx, state: S): void;
	end?(ctx: DragCtx, state: S, event: PointerEvent, reason: EndReason): void;
	destroy?(ctx: DragCtx, state: S): void;
}

export abstract class DropPluginBase<S = unknown> implements DropPlugin<S> {
	abstract readonly key: symbol;
	abstract readonly name: string;
	phase?: PluginPhase;
	abstract init?(ctx: DropCtx): S;
	enter?(ctx: DropCtx, state: S, event: PointerEvent): boolean | void;
	over?(ctx: DropCtx, state: S, event: PointerEvent): void;
	leave?(ctx: DropCtx, state: S, event: PointerEvent): void;
	drop?(ctx: DropCtx, state: S, event: PointerEvent): void;
	update?(ctx: DropCtx, state: S): void;
	destroy?(ctx: DropCtx, state: S): void;
}

export function defineDropPlugin<S = unknown, Args extends unknown[] = []>(
	fn: (...args: Args) => DropPlugin<S>,
) {
	return fn;
}
