import { inverseScaleFromNode } from '../lib/inverse-scale.ts';
import { applyTranslate, clearTranslate, TRANSLATE_RESIZE } from '../transform.ts';
import { isPointerInput, type InteractionInput } from '../interaction-input.ts';
import { autoId, is_svg_element, warnOnce } from '../utils.ts';
import type { EndReason } from '../types.ts';
import type { RectLike } from '../drag/drag.ts';
import type { Capability, DndNode, InteractionSession, ResolvedTarget } from '../types.ts';
import type { CollabOp, LocalPresence, PresenceFrame, ResizeOp } from '../collab-types.ts';
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
	readonly start_rect: RectLike;
	/** Inverse scale so the bounds math lives in the same space as the size math. */
	readonly inverse_scale: number;
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
 * `width`/`height` come in already in element (layout) px; `bounds` and `start_rect` are
 * in client px, so we divide the slack by `inverse_scale` to convert back to layout px —
 * matching how `sizeFromPointer` scales the pointer delta. Pure + DOM-free for testing.
 */
export function clampSizeToBounds(
	width: number,
	height: number,
	anchor: ResizeEdge,
	bounds: RectLike,
	start_rect: RectLike,
	inverse_scale: number,
): { width: number; height: number } {
	let max_width = Number.POSITIVE_INFINITY;
	let max_height = Number.POSITIVE_INFINITY;

	// East: left edge fixed → headroom is distance from left edge to bounds.right.
	if (anchor.includes('e')) max_width = (bounds.right - start_rect.left) * inverse_scale;
	// West: right edge fixed → headroom is distance from bounds.left to right edge.
	if (anchor.includes('w')) max_width = (start_rect.right - bounds.left) * inverse_scale;
	if (anchor.includes('s')) max_height = (bounds.bottom - start_rect.top) * inverse_scale;
	if (anchor.includes('n')) max_height = (start_rect.bottom - bounds.top) * inverse_scale;

	return {
		width: clampBound(width, 0, max_width),
		height: clampBound(height, 0, max_height),
	};
}

export const RESIZE_HANDLE_ATTR = 'data-neodrag-resize-handle';

/** All eight resize edges/corners — iterate to render a handle per edge. */
export const RESIZE_EDGES: readonly ResizeEdge[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

/** Per-handle binding — spread onto a handle element (`<div {...resize.handle('se')}>`) instead of
 *  writing the `data-neodrag-resize-handle` attribute by hand. `edge` is type-checked. */
export type ResizeHandleProps = { readonly [RESIZE_HANDLE_ATTR]: ResizeEdge };

export interface ResizeSizeBounds {
	minWidth?: number;
	minHeight?: number;
	maxWidth?: number;
	maxHeight?: number;
}

export interface ResizeEventData {
	width: number;
	height: number;
	/** Position offset (px) the gesture induced — non-zero only for `w`/`n` edges, which move the
	 * top-left to pin the far edge. Same offset space as a draggable's `position`. */
	x: number;
	y: number;
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
	/**
	 * Controlled size in px. Pass a reactive getter (`get size() { … }`) to drive width/height
	 * externally; pair it with a setter for two-way binding (the wrapper writes the live size back
	 * each move). Applied only while no local resize owns the node, so a gesture isn't fought.
	 */
	size?: { width: number; height: number };
	/**
	 * Controlled position offset (px), in the same offset space as a draggable's `position`. A
	 * `w`/`n` resize moves the top-left to pin the far edge; this reads/writes that shift. Pass a
	 * getter to drive it and a setter for two-way binding.
	 */
	position?: { x: number; y: number };
	disabled?: boolean;
	/** Suppress body text-selection while resizing (refcounted `user-select: none`, applied by the
	 * engine for every interaction). Default `true`; set `false` to allow selection during a resize. */
	userSelect?: boolean;
	/** Tier-2 extension plugins (e.g. `preserveUnits()`). Static array, no reactivity. */
	use?: ResizePlugin[];
	/**
	 * Stable string id for this resizable — the `target` in the unified collab op grammar. Required
	 * in practice for collab (it must match across peers); an auto id is peer-local.
	 */
	id?: string;
	onResizeStart?: (e: ResizeEventData) => void;
	onResize?: (e: ResizeEventData) => void;
	onResizeEnd?: (e: ResizeEventData) => void;
	/**
	 * Pure op stream — fires a serializable `{ type:'resize', target, width, height }` once per resize
	 * that actually changed the size, on release. The last-write-wins seam `@neodrag/collab`
	 * subscribes to; composes with (never replaces) `onResizeEnd`.
	 */
	onCommit?: (op: ResizeOp) => void;
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
	inverse_scale: number,
): void {
	const dx = (x - ipx) * inverse_scale;
	const dy = (y - ipy) * inverse_scale;
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

/** Apply a far-edge pin offset. HTML uses the shared translate composer; SVG geometry elements
 * (`rect`, …) take `x`/`y` attributes (the collab op's `left`/`top` are those attribute values). */
function applyPosition(node: DndNode, left: number, top: number): void {
	if (is_svg_element(node) && SVG_GEOMETRY.has(node.tagName.toLowerCase())) {
		node.setAttribute('x', String(left));
		node.setAttribute('y', String(top));
		return;
	}
	applyTranslate(node, left, top, TRANSLATE_RESIZE);
}

/** In-flight resize presence — the `resize` variant of the unified presence frame. */
export type ResizePresence = {
	type: 'resize';
	target: string;
	width: number;
	height: number;
	left?: number;
	top?: number;
};
/** Eased transition for remote-driven size (commit glide + presence smoothing). */
const REMOTE_RESIZE_EASE =
	'width 140ms ease-out, height 140ms ease-out, translate 140ms ease-out';

export class ResizeState {
	edge: ResizeEdge = 'se';
	width = 0;
	height = 0;
	initial_width = 0;
	initial_height = 0;
	initial_pointer_x = 0;
	initial_pointer_y = 0;
	inverse_scale = 1;
	ratio = 1;
	start_rect: RectLike | null = null;
	bounds: RectLike | undefined;
	/** Committed position offset (px) — the translate a `w`/`n` resize induces to pin the far edge.
	 * Persists across gestures (like a draggable's offset) and is the resize's `TRANSLATE_RESIZE`
	 * contribution, so it composes with a draggable on the same node. */
	readonly offset: { x: number; y: number } = { x: 0, y: 0 };
	/** Offset snapshot at gesture start, so the in-flight shift is cumulative on prior resizes. */
	start_offset_x = 0;
	start_offset_y = 0;
	/** Reused scratch for the per-move size pipeline (sizeFromPointer → aspect → clamp). */
	readonly size: SizePair = { width: 0, height: 0 };
	/** True while a local resize gesture owns the node — remote applies defer to it. */
	resizing = false;
	/** Auto target id — peer-local; `targetId` prefers `options.id`. */
	readonly auto_target_id = autoId('resize');
	readonly commit_subscribers = new Set<(op: ResizeOp) => void>();
	readonly presence_subscribers = new Set<(p: ResizePresence | null) => void>();
	/** The peer whose remote resize is currently rendered over this node, or null. */
	remote_peer: string | null = null;
	/** A remote op that arrived while a local resize owned the node — applied on end if the local
	 * gesture produced no commit, so a suppressed remote value isn't lost. */
	pending_remote: ResizeOp | null = null;

	constructor(
		readonly node: DndNode,
		public options: ResizeOptions,
	) {}

	get targetId(): string {
		return this.options.id ?? this.auto_target_id;
	}
	get hasExplicitId(): boolean {
		return this.options.id != null;
	}

	event(input: InteractionInput): ResizeEventData {
		return {
			width: this.width,
			height: this.height,
			x: this.offset.x,
			y: this.offset.y,
			edge: this.edge,
			node: this.node,
			input,
		};
	}

	pluginContext(input: InteractionInput): ResizePluginContext {
		return {
			size: { width: this.width, height: this.height },
			initial: { width: this.initial_width, height: this.initial_height },
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
		const s = this.#state;
		Object.assign(s.options, options);
		// Controlled inputs are applied only outside a local gesture — the resize owns the node while
		// it runs (and the two-way setter is writing back, so re-applying would fight it).
		if (s.resizing) return;
		if (options.size && (options.size.width !== s.width || options.size.height !== s.height)) {
			s.width = options.size.width;
			s.height = options.size.height;
			applySize(s.node, s.width, s.height);
		}
		if (options.position && (options.position.x !== s.offset.x || options.position.y !== s.offset.y)) {
			s.offset.x = options.position.x;
			s.offset.y = options.position.y;
			applyTranslate(s.node, s.offset.x, s.offset.y, TRANSLATE_RESIZE);
		}
	}

	get size(): { width: number; height: number } {
		return { width: this.#state.width, height: this.#state.height };
	}

	/** The committed position offset (px) — the translate a `w`/`n` resize induced. Same offset
	 * space as a draggable's `position`. */
	get position(): { x: number; y: number } {
		return { x: this.#state.offset.x, y: this.#state.offset.y };
	}

	/** The resizable's stable string id — the `target` in the unified op grammar. */
	get targetId(): string {
		return this.#state.targetId;
	}

	/** Whether `targetId` came from an explicit `id` option (auto ids are peer-local). */
	get hasExplicitId(): boolean {
		return this.#state.hasExplicitId;
	}

	onCommit(fn: (op: CollabOp) => void): () => void {
		this.#state.commit_subscribers.add(fn);
		return () => this.#state.commit_subscribers.delete(fn);
	}

	onPresence(fn: (p: LocalPresence | null) => void): () => void {
		this.#state.presence_subscribers.add(fn);
		return () => this.#state.presence_subscribers.delete(fn);
	}

	/** Apply a remote resize fact — sizes the node to the committed dimensions (eased). Foreign kinds
	 * ignored — this is the unified `CollabTarget.applyExternal`. */
	applyExternal(op: CollabOp): void {
		if (op.type === 'resize') this.#resize.applyExternal(this.#state, op);
	}

	showRemotePresence(frame: PresenceFrame): void {
		if (frame.type === 'resize') this.#resize.showRemotePresence(this.#state, frame);
	}

	clearRemotePresence(peerId?: string): void {
		this.#resize.clearRemotePresence(this.#state, peerId);
	}

	destroy(): void {
		this.#resize._unbind(this.#state.node);
		clearTranslate(this.#state.node, TRANSLATE_RESIZE);
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
		if (options.onCommit && options.id == null) {
			warnOnce(
				'resize:id',
				'this resizable uses onCommit but has no `id` — auto ids are peer-local and will not match across collaborating clients. Give it a stable `id`.',
			);
		}
		this.#nodes.set(node, state);
		// Seed size from controlled input or the current layout box so presence-clear can revert to
		// a real home size before any local gesture has run (otherwise width/height stay 0).
		if (options.size) {
			state.width = options.size.width;
			state.height = options.size.height;
			applySize(node, state.width, state.height);
		} else {
			const rect = node.getBoundingClientRect();
			state.width = rect.width;
			state.height = rect.height;
		}
		if (options.position) {
			state.offset.x = options.position.x;
			state.offset.y = options.position.y;
			applyTranslate(node, state.offset.x, state.offset.y, TRANSLATE_RESIZE);
		}
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
		state.start_rect = { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
		state.initial_width = state.width = rect.width;
		state.initial_height = state.height = rect.height;
		state.inverse_scale = inverseScaleFromNode(state.node, rect);
		state.initial_pointer_x = session.startInput.clientX;
		state.initial_pointer_y = session.startInput.clientY;
		state.bounds = resolveResizeBounds(state.options.bounds, state.node);
		state.ratio =
			typeof state.options.aspectRatio === 'number'
				? state.options.aspectRatio
				: rect.height
					? rect.width / rect.height
					: 1;
		state.start_offset_x = state.offset.x;
		state.start_offset_y = state.offset.y;
		state.resizing = true;
		if (state.options.userSelect === false) session.userSelect = false;
		// Drop any remote-driven eased transition so the local resize tracks the pointer instantly.
		if (state.node instanceof HTMLElement && state.node.style) state.node.style.transition = '';
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
			state.initial_pointer_x,
			state.initial_pointer_y,
			state.initial_width,
			state.initial_height,
			session.input.clientX,
			session.input.clientY,
			state.inverse_scale,
		);
		if (state.options.aspectRatio) {
			applyAspect(size, state.ratio, state.edge);
		}
		clampSize(size, state.options);
		// Bounds run last so a container limit is authoritative over a free-growing size,
		// but after min/max so an explicit min can't be undone by the container.
		if (state.bounds && state.start_rect) {
			const bounded = clampSizeToBounds(
				size.width,
				size.height,
				state.edge,
				state.bounds,
				state.start_rect,
				state.inverse_scale,
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
		// Pin the far edge: a `w`/`n` edge shifts the top-left by the size change, so the opposite
		// edge stays put. Derived from the final (clamped) size, so min/max/bounds stay correct.
		state.offset.x = state.start_offset_x + (state.edge.includes('w') ? state.initial_width - width : 0);
		state.offset.y = state.start_offset_y + (state.edge.includes('n') ? state.initial_height - height : 0);
		applySize(state.node, width, height);
		applyTranslate(state.node, state.offset.x, state.offset.y, TRANSLATE_RESIZE);
		state.options.onResize?.(state.event(session.input));
		this.#pumpPresence(state);
	}

	end(session: InteractionSession, _reason: EndReason): void {
		const state = session.target.data as ResizeState;
		state.resizing = false;
		if (state.options.use) {
			const ctx = state.pluginContext(session.input);
			for (const p of state.options.use) p.onEnd?.(ctx);
		}
		state.options.onResizeEnd?.(state.event(session.input));
		const changed = state.width !== state.initial_width || state.height !== state.initial_height;
		if (changed) {
			this.#emitCommit(state, this.#resizeOp(state));
			state.pending_remote = null;
		} else if (state.pending_remote) {
			this.applyExternal(state, state.pending_remote);
		}
		for (const fn of state.presence_subscribers) fn(null);
	}

	/** Build a resize op. `left`/`top` only ride along for edges that pin the far side (`w`/`n`). */
	#resizeOp(state: ResizeState): ResizeOp {
		const op: ResizeOp = {
			type: 'resize',
			target: state.targetId,
			width: state.width,
			height: state.height,
		};
		if (state.edge.includes('w') || state.edge.includes('n')) {
			op.left = state.offset.x;
			op.top = state.offset.y;
		}
		return op;
	}

	#emitCommit(state: ResizeState, op: ResizeOp): void {
		state.options.onCommit?.(op);
		for (const fn of state.commit_subscribers) fn(op);
	}

	#pumpPresence(state: ResizeState): void {
		if (state.presence_subscribers.size === 0) return;
		const frame: ResizePresence = {
			type: 'resize',
			target: state.targetId,
			width: state.width,
			height: state.height,
		};
		if (state.edge.includes('w') || state.edge.includes('n')) {
			frame.left = state.offset.x;
			frame.top = state.offset.y;
		}
		for (const fn of state.presence_subscribers) fn(frame);
	}

	/** Apply a remote resize fact — size the node to the committed dimensions, eased. A no-op while a
	 *  local resize owns the node (stashed, applied on end if the local gesture commits nothing). */
	applyExternal(state: ResizeState, op: ResizeOp): void {
		if (state.resizing) {
			state.pending_remote = op;
			return;
		}
		state.pending_remote = null;
		state.width = op.width;
		state.height = op.height;
		if (op.left !== undefined) state.offset.x = op.left;
		if (op.top !== undefined) state.offset.y = op.top;
		if (state.node instanceof HTMLElement && state.node.style) state.node.style.transition = REMOTE_RESIZE_EASE;
		applySize(state.node, op.width, op.height);
		applyPosition(state.node, state.offset.x, state.offset.y);
	}

	showRemotePresence(state: ResizeState, frame: ResizePresence & { peerId: string }): void {
		if (state.resizing) return;
		state.remote_peer = frame.peerId;
		if (state.node instanceof HTMLElement && state.node.style) state.node.style.transition = REMOTE_RESIZE_EASE;
		applySize(state.node, frame.width, frame.height);
		applyPosition(state.node, frame.left ?? state.offset.x, frame.top ?? state.offset.y);
	}

	clearRemotePresence(state: ResizeState, peerId?: string): void {
		if (peerId && state.remote_peer !== peerId) return;
		state.remote_peer = null;
		if (state.resizing) return;
		if (state.node instanceof HTMLElement && state.node.style) state.node.style.transition = REMOTE_RESIZE_EASE;
		applySize(state.node, state.width, state.height);
		applyPosition(state.node, state.offset.x, state.offset.y);
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
