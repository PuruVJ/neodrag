import { inverseScaleFromNode } from '../lib/inverse-scale.ts';
import { isPointerInput, type InteractionInput } from '../interaction-input.ts';
import { is_svg_element } from '../utils.ts';
import type { EndReason } from '../types.ts';
import type { RectLike } from '../drag/drag.ts';
import type { Capability, DndNode, InteractionSession, ResolvedTarget } from '../types.ts';
import type { ResizePlugin, ResizePluginContext } from './preserve-units.ts';

export type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

/**
 * Where a resize is allowed to grow into. Mirrors the drag `BoundsInput` shape:
 * `'parent'` (the element's offset/DOM parent), `'viewport'`, an explicit element,
 * a plain rect, or a thunk returning a rect (re-read each move so a moving/scrolling
 * container stays correct). Ported from `src/resize-bounds.ts` (`parent` concept) but
 * widened to the full bounds vocabulary the drag side already speaks.
 */
export type ResizeBoundsInput =
	| 'parent'
	| 'viewport'
	| HTMLElement
	| RectLike
	| (() => RectLike);

export interface ResizeBoundsContext {
	/** Layout rect of the element at resize-start (client coords). */
	readonly startRect: RectLike;
	/** Inverse scale so the bounds math lives in the same space as the size math. */
	readonly inverseScale: number;
}

const clampBound = (v: number, lo: number, hi: number) =>
	hi >= lo ? Math.max(lo, Math.min(hi, v)) : lo;

/** Resolve a `ResizeBoundsInput` into a concrete client-space rect (or undefined). */
export function resolveResizeBounds(
	bounds: ResizeBoundsInput | undefined,
	node: DndNode,
): RectLike | undefined {
	if (!bounds) return undefined;
	if (bounds === 'parent') {
		const parent = (node as HTMLElement).parentElement;
		return parent ? parent.getBoundingClientRect() : undefined;
	}
	if (bounds === 'viewport') {
		return { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
	}
	if (typeof bounds === 'function') return bounds();
	if (bounds instanceof HTMLElement) return bounds.getBoundingClientRect();
	return bounds;
}

/**
 * Clamp a proposed size so the element — anchored at its non-moving edge — never
 * spills outside `bounds`. The moving edge is implied by `anchor`: e.g. an `e` resize
 * keeps the left edge pinned and may only grow until it touches `bounds.right`; a `w`
 * resize keeps the right edge pinned and is limited by `bounds.left`. Symmetric for n/s.
 *
 * `width`/`height` come in already in element (layout) px; `bounds` and `startRect` are
 * in client px, so we divide the slack by `inverseScale` to convert back to layout px —
 * matching how `sizeFromPointer` scales the pointer delta. Pure + DOM-free for testing.
 */
export function clampSizeToBounds(
	width: number,
	height: number,
	anchor: ResizeEdge,
	bounds: RectLike,
	startRect: RectLike,
	inverseScale: number,
): { width: number; height: number } {
	let maxWidth = Number.POSITIVE_INFINITY;
	let maxHeight = Number.POSITIVE_INFINITY;

	// East: left edge fixed → headroom is distance from left edge to bounds.right.
	if (anchor.includes('e')) maxWidth = (bounds.right - startRect.left) * inverseScale;
	// West: right edge fixed → headroom is distance from bounds.left to right edge.
	if (anchor.includes('w')) maxWidth = (startRect.right - bounds.left) * inverseScale;
	if (anchor.includes('s')) maxHeight = (bounds.bottom - startRect.top) * inverseScale;
	if (anchor.includes('n')) maxHeight = (startRect.bottom - bounds.top) * inverseScale;

	return {
		width: clampBound(width, 0, maxWidth),
		height: clampBound(height, 0, maxHeight),
	};
}

export const RESIZE_HANDLE_ATTR = 'data-neodrag-resize-handle';

export interface ResizeSizeBounds {
	minWidth?: number;
	minHeight?: number;
	maxWidth?: number;
	maxHeight?: number;
}

export interface ResizeEventData {
	width: number;
	height: number;
	edge: ResizeEdge;
	node: DndNode;
	input: InteractionInput;
}

export interface ResizeOptions extends ResizeSizeBounds {
	/** Lock aspect ratio. `true` keeps the initial ratio; a number is explicit width/height. */
	aspectRatio?: number | boolean;
	/**
	 * Constrain the resize to stay inside a container rect: `'parent'`, `'viewport'`, an
	 * element, a plain rect, or a thunk. The fixed (anchored) edge is pinned and the moving
	 * edge can only travel until it reaches the bound.
	 */
	bounds?: ResizeBoundsInput;
	disabled?: boolean;
	/** Tier-2 extension plugins (e.g. `preserveUnits()`). Static array, no reactivity. */
	use?: ResizePlugin[];
	onResizeStart?: (e: ResizeEventData) => void;
	onResize?: (e: ResizeEventData) => void;
	onResizeEnd?: (e: ResizeEventData) => void;
}

/** A mutable width/height pair reused across the move pipeline to avoid per-move allocs. */
interface SizePair {
	width: number;
	height: number;
}

/**
 * px-only size math (Length is an opt-in plugin in v3, not core). Writes the proposed size
 * into `out` instead of allocating — the move pipeline reuses one scratch object per binding.
 */
function sizeFromPointer(
	out: SizePair,
	edge: ResizeEdge,
	ipx: number,
	ipy: number,
	iw: number,
	ih: number,
	x: number,
	y: number,
	inverseScale: number,
): void {
	const dx = (x - ipx) * inverseScale;
	const dy = (y - ipy) * inverseScale;
	let width = iw;
	let height = ih;
	if (edge.includes('e')) width = iw + dx;
	if (edge.includes('w')) width = iw - dx;
	if (edge.includes('s')) height = ih + dy;
	if (edge.includes('n')) height = ih - dy;
	out.width = width;
	out.height = height;
}

/** Lock aspect in place on `out` (reads + writes the same scratch object). */
function applyAspect(out: SizePair, ratio: number, edge: ResizeEdge): void {
	if (edge.includes('e') || edge.includes('w')) {
		out.height = out.width / ratio;
		return;
	}
	out.width = out.height * ratio;
}

/** Clamp `out` to the min/max bounds in place. */
function clampSize(out: SizePair, b: ResizeSizeBounds): void {
	let width = out.width;
	let height = out.height;
	if (b.minWidth != null) width = Math.max(b.minWidth, width);
	if (b.maxWidth != null) width = Math.min(b.maxWidth, width);
	if (b.minHeight != null) height = Math.max(b.minHeight, height);
	if (b.maxHeight != null) height = Math.min(b.maxHeight, height);
	out.width = Math.max(0, width);
	out.height = Math.max(0, height);
}

const SVG_GEOMETRY = new Set(['rect', 'image', 'foreignObject', 'svg', 'use']);

/**
 * Apply a px size to the node. HTML elements get CSS `width`/`height`; SVG geometry
 * elements (`rect`, `image`, `svg`, …) take the `width`/`height` *attributes*, since CSS
 * sizing is unreliable across SVG elements/browsers. Other SVG elements (`g`, `path`) have
 * no intrinsic size attribute, so we fall back to a CSS attempt.
 */
function applySize(node: DndNode, width: number, height: number): void {
	if (is_svg_element(node)) {
		if (SVG_GEOMETRY.has(node.tagName.toLowerCase())) {
			node.setAttribute('width', String(width));
			node.setAttribute('height', String(height));
			return;
		}
		(node as SVGElement).style.width = `${width}px`;
		(node as SVGElement).style.height = `${height}px`;
		return;
	}
	const el = node as HTMLElement;
	el.style.width = `${width}px`;
	el.style.height = `${height}px`;
}

export class ResizeState {
	edge: ResizeEdge = 'se';
	width = 0;
	height = 0;
	initialWidth = 0;
	initialHeight = 0;
	initialPointerX = 0;
	initialPointerY = 0;
	inverseScale = 1;
	ratio = 1;
	startRect: RectLike | null = null;
	bounds: RectLike | undefined;
	/** Reused scratch for the per-move size pipeline (sizeFromPointer → aspect → clamp). */
	readonly size: SizePair = { width: 0, height: 0 };

	constructor(
		readonly node: DndNode,
		public options: ResizeOptions,
	) {}

	event(input: InteractionInput): ResizeEventData {
		return { width: this.width, height: this.height, edge: this.edge, node: this.node, input };
	}

	pluginContext(input: InteractionInput): ResizePluginContext {
		return {
			size: { width: this.width, height: this.height },
			initial: { width: this.initialWidth, height: this.initialHeight },
			anchor: this.edge,
			node: this.node,
			input,
		};
	}
}

export class ResizeHandle {
	readonly #resize: Resize;
	readonly #state: ResizeState;

	constructor(resize: Resize, state: ResizeState) {
		this.#resize = resize;
		this.#state = state;
	}

	update(options: Partial<ResizeOptions>): void {
		Object.assign(this.#state.options, options);
	}

	get size(): { width: number; height: number } {
		return { width: this.#state.width, height: this.#state.height };
	}

	destroy(): void {
		this.#resize._unbind(this.#state.node);
	}
}

const RESIZE_KEY = Symbol('neodrag.resize');

/**
 * The resize capability. Claims pointerdowns that land on a handle element
 * (`data-neodrag-resize-handle="se"`), at a higher priority than drag so the handle wins
 * over the body. px-only: size is written in pixels; unit preservation is an opt-in plugin.
 */
export class Resize implements Capability {
	readonly key = RESIZE_KEY;
	readonly name = 'resize';
	readonly priority = 100;
	readonly #nodes = new Map<DndNode, ResizeState>();

	bind(node: DndNode, options: ResizeOptions = {}): ResizeHandle {
		const state = new ResizeState(node, options);
		this.#nodes.set(node, state);
		return new ResizeHandle(this, state);
	}

	/** @internal */
	_unbind(node: DndNode): void {
		this.#nodes.delete(node);
	}

	resolve(input: InteractionInput): ResolvedTarget | null {
		const hit = this.#findHandle(input);
		if (!hit) return null;
		const state = this.#nodes.get(hit.node)!;
		if (state.options.disabled) return null;
		state.edge = hit.edge;
		return { node: hit.node, data: state };
	}

	start(session: InteractionSession): void {
		const state = session.target.data as ResizeState;
		const rect = state.node.getBoundingClientRect();
		state.startRect = { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
		state.initialWidth = state.width = rect.width;
		state.initialHeight = state.height = rect.height;
		state.inverseScale = inverseScaleFromNode(state.node, rect);
		state.initialPointerX = session.startInput.clientX;
		state.initialPointerY = session.startInput.clientY;
		state.bounds = resolveResizeBounds(state.options.bounds, state.node);
		state.ratio =
			typeof state.options.aspectRatio === 'number'
				? state.options.aspectRatio
				: rect.height
					? rect.width / rect.height
					: 1;
		const ev = state.event(session.input);
		if (state.options.use) {
			const ctx = state.pluginContext(session.input);
			for (const p of state.options.use) p.onStart?.(ctx);
		}
		state.options.onResizeStart?.(ev);
	}

	move(session: InteractionSession): void {
		const state = session.target.data as ResizeState;
		const size = state.size;
		sizeFromPointer(
			size,
			state.edge,
			state.initialPointerX,
			state.initialPointerY,
			state.initialWidth,
			state.initialHeight,
			session.input.clientX,
			session.input.clientY,
			state.inverseScale,
		);
		if (state.options.aspectRatio) {
			applyAspect(size, state.ratio, state.edge);
		}
		clampSize(size, state.options);
		// Bounds run last so a container limit is authoritative over a free-growing size,
		// but after min/max so an explicit min can't be undone by the container.
		if (state.bounds && state.startRect) {
			const bounded = clampSizeToBounds(
				size.width,
				size.height,
				state.edge,
				state.bounds,
				state.startRect,
				state.inverseScale,
			);
			size.width = bounded.width;
			size.height = bounded.height;
			if (state.options.minWidth != null) size.width = Math.max(state.options.minWidth, size.width);
			if (state.options.minHeight != null) size.height = Math.max(state.options.minHeight, size.height);
		}
		let width = size.width;
		let height = size.height;
		state.width = width;
		state.height = height;
		if (state.options.use) {
			for (const p of state.options.use) {
				const adjusted = p.onMove?.(state.pluginContext(session.input));
				if (adjusted) {
					state.width = width = adjusted.width;
					state.height = height = adjusted.height;
				}
			}
		}
		applySize(state.node, width, height);
		state.options.onResize?.(state.event(session.input));
	}

	end(session: InteractionSession, _reason: EndReason): void {
		const state = session.target.data as ResizeState;
		if (state.options.use) {
			const ctx = state.pluginContext(session.input);
			for (const p of state.options.use) p.onEnd?.(ctx);
		}
		state.options.onResizeEnd?.(state.event(session.input));
	}

	#findHandle(input: InteractionInput): { node: DndNode; edge: ResizeEdge } | null {
		const path = isPointerInput(input) ? input.native.composedPath() : input.target ? [input.target] : [];
		for (const el of path) {
			if (!(el instanceof HTMLElement)) {
				if (el === document) break;
				continue;
			}
			const attr = el.getAttribute(RESIZE_HANDLE_ATTR);
			if (!attr) continue;
			const edge = attr as ResizeEdge;
			let owner: HTMLElement | null = el;
			while (owner) {
				if (this.#nodes.has(owner)) return { node: owner, edge };
				owner = owner.parentElement;
			}
		}
		return null;
	}
}
