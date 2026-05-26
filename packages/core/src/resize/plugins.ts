import { clamp } from '../lib/math.ts';
import { defineResizePlugin, RESIZE_HANDLE_ATTR, type ResizeEdge } from './types.ts';

const RESIZE_HANDLES_KEY = Symbol('neodrag.resizeHandles');
const SIZE_BOUNDS_KEY = Symbol('neodrag.sizeBounds');
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

type ResizeHandlesState = { created: HTMLElement[] };

function edgePosition(edge: ResizeEdge, size: number, inset: number) {
	const half = size / 2;
	const base = `position:absolute;touch-action:none;z-index:1;box-sizing:border-box;`;
	const hit = `width:${size}px;height:${size}px;`;
	switch (edge) {
		case 'n':
			return `${base}${hit}left:50%;top:${inset}px;margin-left:-${half}px;cursor:${CURSOR_BY_EDGE.n}`;
		case 's':
			return `${base}${hit}left:50%;bottom:${inset}px;margin-left:-${half}px;cursor:${CURSOR_BY_EDGE.s}`;
		case 'e':
			return `${base}${hit}top:50%;right:${inset}px;margin-top:-${half}px;cursor:${CURSOR_BY_EDGE.e}`;
		case 'w':
			return `${base}${hit}top:50%;left:${inset}px;margin-top:-${half}px;cursor:${CURSOR_BY_EDGE.w}`;
		case 'ne':
			return `${base}${hit}top:${inset}px;right:${inset}px;cursor:${CURSOR_BY_EDGE.ne}`;
		case 'nw':
			return `${base}${hit}top:${inset}px;left:${inset}px;cursor:${CURSOR_BY_EDGE.nw}`;
		case 'se':
			return `${base}${hit}bottom:${inset}px;right:${inset}px;cursor:${CURSOR_BY_EDGE.se}`;
		case 'sw':
			return `${base}${hit}bottom:${inset}px;left:${inset}px;cursor:${CURSOR_BY_EDGE.sw}`;
	}
}

export const resizeHandles = defineResizePlugin(
	(options?: {
		edges?: ResizeEdge[] | 'all';
		size?: number;
		inset?: number;
	}) => {
		const edges = options?.edges === 'all' || !options?.edges ? ALL_EDGES : options.edges;
		const handleSize = options?.size ?? 8;
		const inset = options?.inset ?? 0;

		return {
			key: RESIZE_HANDLES_KEY,
			phase: 'pre' as const,

			init(ctx) {
				const root = ctx.rootNode;
				if (!(root instanceof HTMLElement)) return { created: [] as HTMLElement[] };
				const prev = getComputedStyle(root).position;
				if (prev === 'static') root.style.position = 'relative';

				const created: HTMLElement[] = [];
				for (const edge of edges) {
					const handle = document.createElement('div');
					handle.setAttribute(RESIZE_HANDLE_ATTR, edge);
					handle.setAttribute('aria-hidden', 'true');
					handle.style.cssText = edgePosition(edge, handleSize, inset);
					root.appendChild(handle);
					created.push(handle);
				}
				return { created };
			},

			destroy(ctx, state: ResizeHandlesState | undefined) {
				if (!state?.created.length) return;
				for (const el of state.created) el.remove();
			},
		};
	},
);

type SizeBoundsState = Record<string, never>;

export const sizeBounds = defineResizePlugin(
	(options?: {
		minWidth?: number;
		maxWidth?: number;
		minHeight?: number;
		maxHeight?: number;
		parent?: boolean | HTMLElement;
	}) => ({
		key: SIZE_BOUNDS_KEY,
		phase: 'resolve' as const,

		resize(ctx) {
			const minW = options?.minWidth ?? 0;
			const maxW = options?.maxWidth ?? Number.POSITIVE_INFINITY;
			const minH = options?.minHeight ?? 0;
			const maxH = options?.maxHeight ?? Number.POSITIVE_INFINITY;

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

			const targetW = ctx.size.width + ctx.proposed.width;
			const targetH = ctx.size.height + ctx.proposed.height;
			const width = clamp(targetW, minW, maxWidth);
			const height = clamp(targetH, minH, maxHeight);

			return {
				width: width - ctx.size.width,
				height: height - ctx.size.height,
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
				? ctx.initial.width / ctx.initial.height
				: ratio;
		if (!Number.isFinite(r) || r <= 0) return;

		const targetW = ctx.size.width + ctx.proposed.width;
		const targetH = ctx.size.height + ctx.proposed.height;
		const fromWidth = Math.abs(ctx.proposed.width) >= Math.abs(ctx.proposed.height);

		if (fromWidth) {
			const height = targetW / r;
			return { height: height - ctx.size.height };
		}
		const width = targetH * r;
		return { width: width - ctx.size.width };
	},
}));

export type ResizeEventData = {
	size: { width: number; height: number };
	initial: { width: number; height: number };
	anchor: ResizeEdge;
	rootNode: HTMLElement | SVGElement;
	event: PointerEvent;
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

		start(ctx, _, event) {
			options?.onStart?.(eventData(ctx, event));
		},

		resize(ctx, _, event) {
			options?.onResize?.(eventData(ctx, event));
		},

		end(ctx, _, event, reason) {
			options?.onEnd?.({ ...eventData(ctx, event), reason });
		},
	}),
);

function eventData(ctx: import('./types.ts').ResizeCtx, event: PointerEvent): ResizeEventData {
	return {
		size: { width: ctx.size.width, height: ctx.size.height },
		initial: { width: ctx.initial.width, height: ctx.initial.height },
		anchor: ctx.anchor,
		rootNode: ctx.rootNode,
		event,
	};
}
