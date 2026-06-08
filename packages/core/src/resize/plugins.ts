import type { InteractionInput } from '../interaction-input.ts';
import { resolveSizeInput, sizeContext } from '../length-contract.ts';
import type { SizeInput } from '../length-runtime.ts';
import { clamp } from '../lib/math.ts';
import { defineResizePlugin, RESIZE_HANDLE_ATTR, type ResizeEdge } from './types.ts';

const RESIZE_HANDLES_KEY = Symbol('neodrag.resizeHandles');
export const SIZE_BOUNDS_PLUGIN_KEY = Symbol('neodrag.sizeBounds');
const SIZE_BOUNDS_KEY = SIZE_BOUNDS_PLUGIN_KEY;
const RESIZE_AXIS_KEY = Symbol('neodrag.resizeAxis');
const ASPECT_RATIO_KEY = Symbol('neodrag.aspectRatio');
const RESIZE_EVENTS_KEY = Symbol('neodrag.resizeEvents');

const ALL_EDGES: ResizeEdge[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

const CURSOR_BY_EDGE: Record<ResizeEdge, string> = {
	n: 'ns-resize',
	s: 'ns-resize',
	e: 'ew-resize',
	w: 'ew-resize',
	ne: 'nesw-resize',
	nw: 'nwse-resize',
	se: 'nwse-resize',
	sw: 'nesw-resize',
};

function edgePosition(edge: ResizeEdge, size: number, cornerSize: number, inset: number) {
	const base = `position:absolute;touch-action:none;z-index:100;box-sizing:border-box;pointer-events:auto;`;
	const corner = `width:${cornerSize}px;height:${cornerSize}px;`;
	switch (edge) {
		case 'n':
			return `${base}left:0;right:0;top:${inset}px;height:${size}px;cursor:${CURSOR_BY_EDGE.n}`;
		case 's':
			return `${base}left:0;right:0;bottom:${inset}px;height:${size}px;cursor:${CURSOR_BY_EDGE.s}`;
		case 'e':
			return `${base}top:0;bottom:0;right:${inset}px;width:${size}px;cursor:${CURSOR_BY_EDGE.e}`;
		case 'w':
			return `${base}top:0;bottom:0;left:${inset}px;width:${size}px;cursor:${CURSOR_BY_EDGE.w}`;
		case 'ne':
			return `${base}${corner}top:${inset}px;right:${inset}px;z-index:110;cursor:${CURSOR_BY_EDGE.ne}`;
		case 'nw':
			return `${base}${corner}top:${inset}px;left:${inset}px;z-index:110;cursor:${CURSOR_BY_EDGE.nw}`;
		case 'se':
			return `${base}${corner}bottom:${inset}px;right:${inset}px;z-index:110;cursor:${CURSOR_BY_EDGE.se}`;
		case 'sw':
			return `${base}${corner}bottom:${inset}px;left:${inset}px;z-index:110;cursor:${CURSOR_BY_EDGE.sw}`;
	}
}

export const resizeHandles = defineResizePlugin(
	(options?: {
		edges?: ResizeEdge[] | 'all';
		size?: SizeInput;
		cornerSize?: SizeInput;
		inset?: number;
	}) => {
		const edges = options?.edges === 'all' || !options?.edges ? ALL_EDGES : options.edges;
		const inset = options?.inset ?? 0;

		return {
			key: RESIZE_HANDLES_KEY,
			phase: 'pre' as const,

			init(ctx) {
				const root = ctx.rootNode;
				if (!(root instanceof HTMLElement)) return { created: [] as HTMLElement[] };
				const prev = getComputedStyle(root).position;
				if (prev === 'static') root.style.position = 'relative';

				const handleSizePx = resolveSizeInput(
					ctx.length,
					options?.size ?? 8,
					sizeContext(root, 'width'),
					8,
				);
				const cornerSizePx = resolveSizeInput(
					ctx.length,
					options?.cornerSize ?? Math.max(handleSizePx * 2, 16),
					sizeContext(root, 'width'),
					Math.max(handleSizePx * 2, 16),
				);

				const created: HTMLElement[] = [];
				for (const edge of edges) {
					const handle = document.createElement('div');
					handle.setAttribute(RESIZE_HANDLE_ATTR, edge);
					handle.setAttribute('aria-hidden', 'true');
					handle.style.cssText = edgePosition(edge, handleSizePx, cornerSizePx, inset);
					root.appendChild(handle);
					created.push(handle);
				}
				return { created };
			},

			destroy(_ctx, state: { created: HTMLElement[] } | undefined) {
				if (!state?.created.length) return;
				for (const el of state.created) el.remove();
			},
		};
	},
);

export const sizeBounds = defineResizePlugin(
	(options?: {
		minWidth?: SizeInput;
		maxWidth?: SizeInput;
		minHeight?: SizeInput;
		maxHeight?: SizeInput;
		parent?: boolean | HTMLElement;
	}) => ({
		key: SIZE_BOUNDS_KEY,
		phase: 'resolve' as const,

		resize(ctx) {
			const wCtx = sizeContext(ctx.targetNode, 'width');
			const hCtx = sizeContext(ctx.targetNode, 'height');
			const minW =
				options?.minWidth != null ? resolveSizeInput(ctx.length, options.minWidth, wCtx, 0) : 0;
			const maxW =
				options?.maxWidth != null
					? resolveSizeInput(ctx.length, options.maxWidth, wCtx, Number.POSITIVE_INFINITY)
					: Number.POSITIVE_INFINITY;
			const minH =
				options?.minHeight != null ? resolveSizeInput(ctx.length, options.minHeight, hCtx, 0) : 0;
			const maxH =
				options?.maxHeight != null
					? resolveSizeInput(ctx.length, options.maxHeight, hCtx, Number.POSITIVE_INFINITY)
					: Number.POSITIVE_INFINITY;

			let maxWidth = maxW;
			let maxHeight = maxH;

			if (options?.parent) {
				const parent =
					options.parent === true
						? (ctx.rootNode.parentElement as HTMLElement | null)
						: options.parent;
				if (parent) {
					const pr = parent.getBoundingClientRect();
					maxWidth = Math.min(maxWidth, pr.width);
					maxHeight = Math.min(maxHeight, pr.height);
				}
			}

			const targetW = ctx.sizePx.width + ctx.proposed.width;
			const targetH = ctx.sizePx.height + ctx.proposed.height;
			const width = clamp(targetW, minW, maxWidth);
			const height = clamp(targetH, minH, maxHeight);

			return {
				width: width - ctx.sizePx.width,
				height: height - ctx.sizePx.height,
			};
		},
	}),
);

export const resizeAxis = defineResizePlugin((axis: 'x' | 'y' | 'both' = 'both') => ({
	key: RESIZE_AXIS_KEY,
	phase: 'resolve' as const,

	resize() {
		if (axis === 'x') return { height: 0 };
		if (axis === 'y') return { width: 0 };
	},
}));

export const aspectRatio = defineResizePlugin((ratio?: number | 'preserve') => ({
	key: ASPECT_RATIO_KEY,
	phase: 'resolve' as const,

	resize(ctx) {
		const r =
			ratio === 'preserve' || ratio === undefined
				? ctx.initialPx.width / ctx.initialPx.height
				: ratio;
		if (!Number.isFinite(r) || r <= 0) return;

		const targetW = ctx.sizePx.width + ctx.proposed.width;
		const targetH = ctx.sizePx.height + ctx.proposed.height;
		const fromWidth = Math.abs(ctx.proposed.width) >= Math.abs(ctx.proposed.height);

		if (fromWidth) {
			const height = targetW / r;
			return { height: height - ctx.sizePx.height };
		}
		const width = targetH * r;
		return { width: width - ctx.sizePx.width };
	},
}));

export type ResizeEventData = {
	size: { width: string; height: string };
	sizePx: { width: number; height: number };
	initial: { width: string; height: string };
	anchor: ResizeEdge;
	rootNode: HTMLElement | SVGElement;
	input: InteractionInput;
	pointer: Readonly<{ x: number; y: number }>;
};

export const resizeEvents = defineResizePlugin(
	(options?: {
		onStart?: (data: ResizeEventData) => void;
		onResize?: (data: ResizeEventData) => void;
		onEnd?: (data: ResizeEventData & { reason: 'commit' | 'cancel' }) => void;
	}) => ({
		key: RESIZE_EVENTS_KEY,
		phase: 'post' as const,
		skipOnCancel: true,

		start(ctx, _, input) {
			options?.onStart?.(eventData(ctx, input));
		},

		resize(ctx, _, input) {
			options?.onResize?.(eventData(ctx, input));
		},

		end(ctx, _, input, reason) {
			options?.onEnd?.({ ...eventData(ctx, input), reason });
		},
	}),
);

function eventData(ctx: import('./types.ts').ResizeCtx, input: InteractionInput): ResizeEventData {
	return {
		size: { width: ctx.size.width, height: ctx.size.height },
		sizePx: { width: ctx.sizePx.width, height: ctx.sizePx.height },
		initial: { width: ctx.initial.width, height: ctx.initial.height },
		anchor: ctx.anchor,
		rootNode: ctx.rootNode,
		input,
		pointer: { x: input.clientX, y: input.clientY },
	};
}
