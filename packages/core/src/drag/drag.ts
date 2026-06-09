import { inverseScaleFromNode } from '../lib/inverse-scale.ts';
import { isPointerInput, type InteractionInput } from '../interaction-input.ts';
import type { EndReason } from '../types.ts';
import { applyTranslate, clearTranslate } from '../transform.ts';
import type { Capability, DndNode, InteractionSession, ResolvedTarget } from '../types.ts';
import { controlAllowsStart, type DragControls } from './controls.ts';

/** A bounds region by reference (resolved live), or a literal rect. */
export type BoundsTarget = 'parent' | 'viewport' | HTMLElement | RectLike | ((node: DndNode) => RectLike);
/** Uniform inset, or per-side. Positive values shrink the bounds inward. */
export type BoundsPadding = number | { top?: number; right?: number; bottom?: number; left?: number };
export type BoundsInput = BoundsTarget | { target: BoundsTarget; padding?: BoundsPadding };

/**
 * Tier-1 drag constraints — the common options (axis / grid / bounds), inlined as
 * pure transforms over a proposed offset. No plugin objects, no dispatch: the drag
 * step runs these directly on the hot path. Each is a pure function for testability.
 */

export type Axis = 'x' | 'y' | 'both';
export type Point = { x: number; y: number };

/** Minimal rect shape — plain numbers so constraints are DOM-free + testable. */
export type RectLike = {
	left: number;
	top: number;
	right: number;
	bottom: number;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Lock movement to a single axis by zeroing the other component. */
// The constraint LOGIC lives in the `*InPlace` functions below (they mutate `out` so the hot
// move() path runs allocation-free). These exported `constrain*` are thin wrappers — copy into a
// fresh point and delegate — so external callers/tests still get a returned value, with a single
// source of truth for the math.
export function constrainAxis(p: Point, axis: Axis): Point {
	const out = { x: p.x, y: p.y };
	constrainAxisInPlace(out, axis);
	return out;
}

/** Snap each component to the nearest grid step. A step of 0 leaves that axis free. */
export function constrainGrid(p: Point, grid: readonly [number, number]): Point {
	const out = { x: p.x, y: p.y };
	constrainGridInPlace(out, grid);
	return out;
}

/**
 * Clamp the proposed offset so the element — at `startRect` translated by the offset —
 * stays inside `bounds`. If the element is larger than the bounds on an axis it pins to
 * the start edge (deterministic) rather than producing NaN/invalid clamps.
 */
export function constrainBounds(p: Point, startRect: RectLike, bounds: RectLike): Point {
	const out = { x: p.x, y: p.y };
	constrainBoundsInPlace(out, startRect, bounds);
	return out;
}

export interface ConstrainOptions {
	axis?: Axis;
	grid?: readonly [number, number];
	/** Resolved bounds rect (px). The capability resolves `'parent' | element | …` to this. */
	bounds?: RectLike;
}

/**
 * Run the tier-1 constraint pipeline in a deterministic order: axis → grid → bounds.
 * Order matters — axis first (so a locked axis can't be re-introduced by grid/bounds),
 * grid before bounds (so the snapped position is what gets clamped into range).
 */
export function constrain(proposed: Point, opts: ConstrainOptions, startRect?: RectLike): Point {
	const out = { x: proposed.x, y: proposed.y };
	constrainInPlace(out, opts, startRect);
	return out;
}

/** Lock to one axis, writing the result into `out` (no alloc). */
function constrainAxisInPlace(out: Point, axis: Axis): void {
	if (axis === 'x') out.y = 0;
	else if (axis === 'y') out.x = 0;
}

/** Snap each component to the nearest grid step, in place (no alloc). */
function constrainGridInPlace(out: Point, grid: readonly [number, number]): void {
	const [gx, gy] = grid;
	if (gx > 0) out.x = Math.round(out.x / gx) * gx;
	if (gy > 0) out.y = Math.round(out.y / gy) * gy;
}

/** Clamp `out` inside `bounds` (anchored at `startRect`), in place (no alloc). */
function constrainBoundsInPlace(out: Point, startRect: RectLike, bounds: RectLike): void {
	const minX = bounds.left - startRect.left;
	const maxX = bounds.right - startRect.right;
	const minY = bounds.top - startRect.top;
	const maxY = bounds.bottom - startRect.bottom;
	out.x = maxX >= minX ? clamp(out.x, minX, maxX) : minX;
	out.y = maxY >= minY ? clamp(out.y, minY, maxY) : minY;
}

/** In-place pipeline (axis → grid → bounds) over `out`, matching `constrain` exactly. */
function constrainInPlace(out: Point, opts: ConstrainOptions, startRect?: RectLike): void {
	if (opts.axis && opts.axis !== 'both') constrainAxisInPlace(out, opts.axis);
	if (opts.grid) constrainGridInPlace(out, opts.grid);
	if (opts.bounds && startRect) constrainBoundsInPlace(out, startRect, opts.bounds);
}

/**
 * Pointer→offset math with inverse-scale compensation (issue #232).
 *
 * `inverseScale` is computed ONCE at drag-start (`scaleFromStart` below) and reused for
 * every move — fixing the latent bug where the old engine recalculated it per-move and
 * drifted under transformed ancestors at large coordinates.
 */

/** The anchor captured at drag-start: where the pointer "is" in unscaled element space. */
export function dragAnchor(
	clientX: number,
	clientY: number,
	startOffset: Point,
	inverseScale: number,
): Point {
	return {
		x: clientX - startOffset.x / inverseScale,
		y: clientY - startOffset.y / inverseScale,
	};
}

/** The proposed offset for the current pointer position, given the start anchor + scale. */
export function proposedOffset(
	clientX: number,
	clientY: number,
	anchor: Point,
	inverseScale: number,
): Point {
	const out = { x: 0, y: 0 };
	proposedOffsetInto(out, clientX, clientY, anchor, inverseScale);
	return out;
}

/** Allocation-free twin of `proposedOffset` — writes into `out` for the hot move() path. */
function proposedOffsetInto(
	out: Point,
	clientX: number,
	clientY: number,
	anchor: Point,
	inverseScale: number,
): void {
	out.x = (clientX - anchor.x) * inverseScale;
	out.y = (clientY - anchor.y) * inverseScale;
}

export interface DragEventData {
	offset: Point;
	node: DndNode;
	input: InteractionInput;
}

/**
 * Tier-2 extension seam — a plain object, no reactive slots, no reconcile machinery.
 * Custom behavior (magnetic snap, custom constraints, analytics) lives in `@neodrag/extend`
 * and plugs in via `use: [...]`. `onMove` may return an adjusted offset.
 */
export interface DragPlugin {
	name?: string;
	onStart?(ctx: DragEventData): void;
	onMove?(ctx: DragEventData): Point | void;
	onEnd?(ctx: DragEventData): void;
	/**
	 * Return `true` to request continued frames after the pointer stops — e.g. a spring still
	 * settling onto a magnet. The engine re-runs the move pipeline on rAF (replaying the last
	 * input, so `onMove` is called again) until every plugin returns `false`.
	 */
	animating?(): boolean;
}

export interface DragOptions {
	axis?: Axis;
	bounds?: BoundsInput;
	grid?: readonly [number, number];
	/**
	 * Gate where a drag may start. `handle` = allow region, `cancel` = block region — each a CSS
	 * selector / element (the simple whitelist/blacklist) or a `ControlFrom.*` for nested-zone
	 * resolution; `priority` breaks overlap ties. Selectors go to `querySelectorAll`, so supply
	 * developer-trusted/static strings, never untrusted input.
	 */
	controls?: DragControls;
	disabled?: boolean;
	/**
	 * CSS `touch-action` applied to the node so a touch drag isn't hijacked by the browser as a
	 * native scroll/zoom. Applied at bind (it must be set *before* the gesture starts). Default is
	 * axis-aware: `'pan-y'` for `axis: 'x'`, `'pan-x'` for `axis: 'y'`, `'none'` for free drag.
	 * Pass a custom value, or `false` to leave `touch-action` untouched.
	 */
	touchAction?: string | false;
	/**
	 * Suppress text selection during a drag by setting `user-select: none` on the document body
	 * while the drag is active (restored on end). Default `true`; set `false` to allow selection.
	 */
	userSelect?: boolean;
	/** Movement threshold in px before a drag begins. Default 0 (immediate). */
	threshold?: number;
	/** Initial / controlled offset. */
	position?: Point;
	/** Arbitrary payload exposed to drop zones (their `accepts`/`onDrop` read it). */
	dragData?: unknown;
	/** Tier-2 extension plugins (from `@neodrag/extend`). Static array, no reactivity. */
	use?: DragPlugin[];
	onDragStart?: (e: DragEventData) => void;
	onDrag?: (e: DragEventData) => void;
	onDragEnd?: (e: DragEventData) => void;
}

const DRAG_MARKER = 'data-neodrag-dragging';

function rectOf(node: DndNode): DOMRect {
	return node.getBoundingClientRect();
}

function eventPath(input: InteractionInput): EventTarget[] {
	if (isPointerInput(input)) return input.native.composedPath();
	return input.target ? [input.target] : [];
}


function insetRect(rect: RectLike, p: BoundsPadding): RectLike {
	const pad = typeof p === 'number' ? { top: p, right: p, bottom: p, left: p } : p;
	return {
		left: rect.left + (pad.left ?? 0),
		top: rect.top + (pad.top ?? 0),
		right: rect.right - (pad.right ?? 0),
		bottom: rect.bottom - (pad.bottom ?? 0),
	};
}

function resolveBoundsTarget(target: BoundsTarget, node: DndNode): RectLike | undefined {
	if (target === 'parent') {
		const parent = (node as HTMLElement).parentElement;
		return parent ? parent.getBoundingClientRect() : undefined;
	}
	if (target === 'viewport') return { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
	if (typeof target === 'function') return target(node);
	if (target instanceof HTMLElement) return target.getBoundingClientRect();
	return target; // a literal RectLike
}

function resolveBounds(bounds: BoundsInput | undefined, node: DndNode): RectLike | undefined {
	if (!bounds) return undefined;
	// The `{ target, padding }` form — resolve the target then inset. (HTMLElements can have a
	// `.target` property, so exclude those explicitly before the duck-type check.)
	if (typeof bounds === 'object' && !(bounds instanceof HTMLElement) && 'target' in bounds) {
		const base = resolveBoundsTarget(bounds.target, node);
		return base ? insetRect(base, bounds.padding ?? 0) : undefined;
	}
	return resolveBoundsTarget(bounds, node);
}

/** The `touch-action` value to apply, or null to leave it alone. Axis-aware by default. */
function resolveTouchAction(options: DragOptions): string | null {
	if (options.touchAction === false) return null;
	if (typeof options.touchAction === 'string') return options.touchAction;
	const axis = options.axis;
	return axis === 'x' ? 'pan-y' : axis === 'y' ? 'pan-x' : 'none';
}

/** Apply (or restore) the node's `touch-action` per the current options. Idempotent. */
function applyTouchAction(state: DragState): void {
	const node = state.node as HTMLElement;
	if (!node.style) return;
	const value = resolveTouchAction(state.options);
	if (value === null) {
		if (state.savedTouchAction !== null) {
			node.style.touchAction = state.savedTouchAction;
			state.savedTouchAction = null;
		}
		return;
	}
	if (state.savedTouchAction === null) state.savedTouchAction = node.style.touchAction;
	node.style.touchAction = value;
}

// Only one drag is ever active at a time (the engine has a single session), so a module-level
// saved value is enough — no ref-counting needed.
let savedBodyUserSelect: string | null = null;

function applyUserSelectHack(): void {
	if (typeof document === 'undefined' || savedBodyUserSelect !== null) return;
	const body = document.body;
	savedBodyUserSelect = body.style.userSelect;
	body.style.userSelect = 'none';
	body.style.setProperty('-webkit-user-select', 'none');
}

function restoreUserSelectHack(): void {
	if (savedBodyUserSelect === null || typeof document === 'undefined') return;
	const body = document.body;
	body.style.userSelect = savedBodyUserSelect;
	body.style.removeProperty('-webkit-user-select');
	savedBodyUserSelect = null;
}

/** Per-binding drag state. A class per the codebase convention. */
export class DragState {
	options: DragOptions;
	offset: Point;
	anchor: Point = { x: 0, y: 0 };
	inverseScale = 1;
	startRect: DOMRect | null = null;
	bounds: RectLike | undefined;
	dragging = false;
	/** The node's original inline `touch-action`, saved when we override it (restored on destroy). */
	savedTouchAction: string | null = null;
	/** Reused scratch for the per-move proposed offset (before constraints write over it). */
	readonly proposed: Point = { x: 0, y: 0 };
	/**
	 * Stable constraint-options object handed to the in-place pipeline each move. Rebuilt in
	 * `start()` (and never per-move) so the hot path doesn't allocate the `{axis,grid,bounds}`
	 * literal every frame. `bounds` is refreshed each move below when it's a live thunk.
	 */
	readonly constrainOpts: ConstrainOptions = {};

	constructor(
		readonly node: DndNode,
		options: DragOptions,
	) {
		this.options = options;
		this.offset = options.position ? { ...options.position } : { x: 0, y: 0 };
	}

	event(input: InteractionInput): DragEventData {
		return { offset: { x: this.offset.x, y: this.offset.y }, node: this.node, input };
	}
}

/** Handle returned from `Drag.bind` — fine-grained `update()` + `destroy()`. */
export class DragHandle {
	readonly #drag: Drag;
	readonly #state: DragState;

	constructor(drag: Drag, state: DragState) {
		this.#drag = drag;
		this.#state = state;
	}

	/** Targeted, fine-grained update — only the provided keys are written. */
	update(options: Partial<DragOptions>): void {
		Object.assign(this.#state.options, options);
		if (options.position && !this.#state.dragging) {
			this.#state.offset = { ...options.position };
			applyTranslate(this.#state.node, this.#state.offset.x, this.#state.offset.y);
		}
		if ('touchAction' in options || 'axis' in options) applyTouchAction(this.#state);
	}

	get offset(): Point {
		return this.#state.offset;
	}

	get isDragging(): boolean {
		return this.#state.dragging;
	}

	destroy(): void {
		this.#drag._unbind(this.#state.node);
		clearTranslate(this.#state.node);
		this.#state.node.removeAttribute(DRAG_MARKER);
		if (this.#state.savedTouchAction !== null) {
			(this.#state.node as HTMLElement).style.touchAction = this.#state.savedTouchAction;
		}
	}
}

const DRAG_KEY = Symbol('neodrag.drag');

/**
 * The drag capability. Options-only: the common constraints are inlined pure transforms
 * (no plugin objects). Owns its own node registry and claims pointerdowns that land on a
 * bound node (respecting handle/cancel/disabled).
 */
export class Drag implements Capability {
	readonly key = DRAG_KEY;
	readonly name = 'drag';
	readonly priority = 0;
	readonly #nodes = new Map<DndNode, DragState>();
	#settleRaf: number | null = null;

	bind(node: DndNode, options: DragOptions = {}): DragHandle {
		const state = new DragState(node, options);
		this.#nodes.set(node, state);
		if (options.position) applyTranslate(node, state.offset.x, state.offset.y);
		applyTouchAction(state);
		return new DragHandle(this, state);
	}

	/** @internal */
	_unbind(node: DndNode): void {
		this.#nodes.delete(node);
	}

	resolve(input: InteractionInput): ResolvedTarget | null {
		const node = this.#findNode(input);
		if (!node) return null;
		const state = this.#nodes.get(node)!;
		if (state.options.disabled) return null;
		if (!this.#allowed(state, input)) return null;
		return { node, data: state };
	}

	shouldStart(session: InteractionSession): boolean {
		const state = session.target.data as DragState;
		const threshold = state.options.threshold ?? 0;
		if (threshold <= 0) return true;
		const dx = session.input.clientX - session.startInput.clientX;
		const dy = session.input.clientY - session.startInput.clientY;
		return dx * dx + dy * dy >= threshold * threshold;
	}

	start(session: InteractionSession): void {
		const state = session.target.data as DragState;
		const rect = rectOf(state.node);
		state.inverseScale = inverseScaleFromNode(state.node, rect);
		// Bounds must clamp against the element's UNTRANSLATED layout box, not its current
		// (already-translated) rect — otherwise the clamp drifts by the accumulated offset and
		// the element escapes its bounds across successive drags.
		const off = state.offset;
		state.startRect = {
			left: rect.left - off.x,
			top: rect.top - off.y,
			right: rect.right - off.x,
			bottom: rect.bottom - off.y,
			width: rect.width,
			height: rect.height,
			x: rect.left - off.x,
			y: rect.top - off.y,
			toJSON() {},
		} as DOMRect;
		state.anchor = dragAnchor(
			session.startInput.clientX,
			session.startInput.clientY,
			state.offset,
			state.inverseScale,
		);
		state.bounds = resolveBounds(state.options.bounds, state.node);
		state.dragging = true;
		if (state.options.userSelect !== false) applyUserSelectHack();
		session.data = state.options.dragData;
		state.node.setAttribute(DRAG_MARKER, '');
		const ev = state.event(session.input);
		if (state.options.use) for (const p of state.options.use) p.onStart?.(ev);
		state.options.onDragStart?.(ev);
	}

	move(session: InteractionSession): void {
		const state = session.target.data as DragState;
		this.#cancelSettle(); // a real move supersedes any pending settle frame
		this.#applyMove(state, session.input);
		this.#scheduleSettle(state, session.input);
	}

	/** The offset → constrain → `use`-plugin → translate pipeline for one input frame. */
	#applyMove(state: DragState, input: InteractionInput): void {
		const proposed = state.proposed;
		proposedOffsetInto(proposed, input.clientX, input.clientY, state.anchor, state.inverseScale);
		// Refresh the cached constraint options from live options (axis/grid can change mid-drag
		// via handle.update); `bounds` was resolved once at start. No literal is allocated.
		const opts = state.constrainOpts;
		opts.axis = state.options.axis;
		opts.grid = state.options.grid;
		opts.bounds = state.bounds;
		constrainInPlace(proposed, opts, state.startRect ?? undefined);
		// `proposed` now holds the constrained offset. A `use` plugin may return a fresh point;
		// fold its result back into the scratch so `state.offset` stays the single stable object.
		if (state.options.use) {
			for (const p of state.options.use) {
				const adjusted = p.onMove?.({ offset: proposed, node: state.node, input });
				if (adjusted) {
					proposed.x = adjusted.x;
					proposed.y = adjusted.y;
				}
			}
		}
		const offset = state.offset;
		offset.x = proposed.x;
		offset.y = proposed.y;
		applyTranslate(state.node, offset.x, offset.y);
		// Only build the event object (event + offset copy) when there's a handler to receive it.
		if (state.options.onDrag) state.options.onDrag(state.event(input));
	}

	#cancelSettle(): void {
		if (this.#settleRaf != null) {
			cancelAnimationFrame(this.#settleRaf);
			this.#settleRaf = null;
		}
	}

	// A `use` plugin (e.g. a magnetic spring) may keep animating after the pointer stops. Pump the
	// move pipeline on rAF — replaying the *last* input — until every plugin reports it's at rest.
	#scheduleSettle(state: DragState, input: InteractionInput): void {
		if (typeof requestAnimationFrame === 'undefined') return;
		if (!state.options.use?.some((p) => p.animating?.())) return;
		this.#settleRaf = requestAnimationFrame(() => {
			this.#settleRaf = null;
			if (!state.dragging) return; // drag ended between schedule and frame
			this.#applyMove(state, input);
			this.#scheduleSettle(state, input);
		});
	}

	end(session: InteractionSession, _reason: EndReason): void {
		const state = session.target.data as DragState;
		this.#cancelSettle();
		state.dragging = false;
		restoreUserSelectHack();
		state.node.removeAttribute(DRAG_MARKER);
		const ev = state.event(session.input);
		if (state.options.use) for (const p of state.options.use) p.onEnd?.(ev);
		state.options.onDragEnd?.(ev);
	}

	#findNode(input: InteractionInput): DndNode | null {
		for (const el of eventPath(input)) {
			if ((el instanceof HTMLElement || el instanceof SVGElement) && this.#nodes.has(el)) {
				return el;
			}
			if (el === document) break;
		}
		return null;
	}

	#allowed(state: DragState, input: InteractionInput): boolean {
		const { controls } = state.options;
		if (!controls) return true;
		return controlAllowsStart(controls, state.node as Element, input.clientX, input.clientY);
	}
}
