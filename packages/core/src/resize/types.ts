import type { LengthAdapter } from '../length-runtime.ts';
import type { SizeInput } from '../length-runtime.ts';
import type { SessionState } from '../types.ts';

export type ResizeEdge =
	| 'n'
	| 's'
	| 'e'
	| 'w'
	| 'ne'
	| 'nw'
	| 'se'
	| 'sw';

export type SizePatch = { width?: number; height?: number };

export type ResizeEndReason = 'commit' | 'cancel';

export interface ResizeSession<T = unknown> {
	readonly state: SessionState;
	readonly source: { readonly node: HTMLElement | SVGElement; readonly rect: DOMRect };
	readonly anchor: ResizeEdge;
	readonly pointer: { readonly x: number; readonly y: number };
	readonly delta: { readonly width: number; readonly height: number };
	readonly size: { readonly width: string; readonly height: string };
	readonly sizePx: { readonly width: number; readonly height: number };
	data: T;
	cancel(): void;
}

export interface ResizeCtx {
	readonly delta: { width: number; height: number };
	readonly proposed: { width: number; height: number };
	readonly size: { width: string; height: string };
	readonly sizePx: { width: number; height: number };
	readonly initial: { width: string; height: string };
	readonly initialPx: { width: number; height: number };
	readonly length: LengthAdapter;
	readonly anchor: ResizeEdge;
	readonly isResizing: boolean;
	readonly isInteracting: boolean;
	readonly rootNode: HTMLElement | SVGElement;
	readonly targetNode: HTMLElement | SVGElement;
	readonly handleNode: HTMLElement | null;
	readonly lastEvent: PointerEvent | null;
	readonly cachedRootNodeRect: DOMRect;
	readonly cachedTargetRect: DOMRect;
	readonly session: ResizeSession;
	effect(fn: () => void): void;
	cancel(): void;
	setForcedSize(width: SizeInput, height: SizeInput): void;
}

export interface ResizePlugin<S = unknown> {
	key: symbol;
	phase?: 'pre' | 'resolve' | 'post';
	skipOnCancel?: boolean;
	init?(ctx: ResizeCtx): S;
	start?(ctx: ResizeCtx, state: S, event: PointerEvent): boolean | void;
	resize?(ctx: ResizeCtx, state: S, event: PointerEvent): SizePatch | void;
	update?(ctx: ResizeCtx, state: S): void;
	end?(ctx: ResizeCtx, state: S, event: PointerEvent, reason: ResizeEndReason): void;
	destroy?(ctx: ResizeCtx, state: S): void;
}

export type ResizePluginList = import('../types.ts').PluginSlot<ResizePlugin>[];

export function defineResizePlugin<S = unknown, Args extends unknown[] = []>(
	fn: (...args: Args) => ResizePlugin<S>,
) {
	return fn;
}

export const RESIZE_HANDLE_ATTR = 'data-neodrag-resize-handle';
