import { inverseScaleFromNode } from '../lib/inverse-scale.ts';
import { isPointerInput, type InteractionInput } from '../interaction-input.ts';
import type { EndReason } from '../types.ts';
import { applyTranslate, clearTranslate, TRANSLATE_DRAG } from '../transform.ts';
import type { Capability, DndNode, InteractionSession, ResolvedTarget } from '../types.ts';
import { autoId, warnOnce } from '../utils.ts';
import type { CollabOp, DragOp, LocalPresence, PresenceFrame } from '../collab-types.ts';

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
 * Clamp the proposed offset so the element — at `start_rect` translated by the offset —
 * stays inside `bounds`. If the element is larger than the bounds on an axis it pins to
 * the start edge (deterministic) rather than producing NaN/invalid clamps.
 */
export function constrainBounds(p: Point, start_rect: RectLike, bounds: RectLike): Point {
	const out = { x: p.x, y: p.y };
	constrainBoundsInPlace(out, start_rect, bounds);
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
export function constrain(proposed: Point, opts: ConstrainOptions, start_rect?: RectLike): Point {
	const out = { x: proposed.x, y: proposed.y };
	constrainInPlace(out, opts, start_rect);
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

/** Clamp `out` inside `bounds` (anchored at `start_rect`), in place (no alloc). */
function constrainBoundsInPlace(out: Point, start_rect: RectLike, bounds: RectLike): void {
	const min_x = bounds.left - start_rect.left;
	const max_x = bounds.right - start_rect.right;
	const min_y = bounds.top - start_rect.top;
	const max_y = bounds.bottom - start_rect.bottom;
	out.x = max_x >= min_x ? clamp(out.x, min_x, max_x) : min_x;
	out.y = max_y >= min_y ? clamp(out.y, min_y, max_y) : min_y;
}

/** In-place pipeline (axis → grid → bounds) over `out`, matching `constrain` exactly. */
function constrainInPlace(out: Point, opts: ConstrainOptions, start_rect?: RectLike): void {
	if (opts.axis && opts.axis !== 'both') constrainAxisInPlace(out, opts.axis);
	if (opts.grid) constrainGridInPlace(out, opts.grid);
	if (opts.bounds && start_rect) constrainBoundsInPlace(out, start_rect, opts.bounds);
}

/**
 * Pointer→offset math with inverse-scale compensation (issue #232).
 *
 * `inverse_scale` is computed ONCE at drag-start (`scaleFromStart` below) and reused for
 * every move — fixing the latent bug where the old engine recalculated it per-move and
 * drifted under transformed ancestors at large coordinates.
 */

/** The anchor captured at drag-start: where the pointer "is" in unscaled element space. */
export function dragAnchor(
	clientX: number,
	clientY: number,
	start_offset: Point,
	inverse_scale: number,
): Point {
	return {
		x: clientX - start_offset.x / inverse_scale,
		y: clientY - start_offset.y / inverse_scale,
	};
}

/** The proposed offset for the current pointer position, given the start anchor + scale. */
export function proposedOffset(
	clientX: number,
	clientY: number,
	anchor: Point,
	inverse_scale: number,
): Point {
	const out = { x: 0, y: 0 };
	proposedOffsetInto(out, clientX, clientY, anchor, inverse_scale);
	return out;
}

/** Allocation-free twin of `proposedOffset` — writes into `out` for the hot move() path. */
function proposedOffsetInto(
	out: Point,
	clientX: number,
	clientY: number,
	anchor: Point,
	inverse_scale: number,
): void {
	out.x = (clientX - anchor.x) * inverse_scale;
	out.y = (clientY - anchor.y) * inverse_scale;
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
	/**
	 * Stable string id for this draggable — the `target` in the unified collab op grammar. Required
	 * in practice for collab (it must match across peers); an auto id is peer-local.
	 */
	id?: string;
	onDragStart?: (e: DragEventData) => void;
	onDrag?: (e: DragEventData) => void;
	onDragEnd?: (e: DragEventData) => void;
	/**
	 * Pure op stream — fires a serializable `{ type:'drag', target, x, y }` once per drag that
	 * actually moved the element, on release. The last-write-wins seam `@neodrag/collab` subscribes
	 * to; composes with (never replaces) `onDragEnd`.
	 */
	onCommit?: (op: DragOp) => void;
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
		if (state.saved_touch_action !== null) {
			node.style.touchAction = state.saved_touch_action;
			state.saved_touch_action = null;
		}
		return;
	}
	if (state.saved_touch_action === null) state.saved_touch_action = node.style.touchAction;
	node.style.touchAction = value;
}

/** Per-binding drag state. A class per the codebase convention. */
export class DragState {
	options: DragOptions;
	offset: Point;
	anchor: Point = { x: 0, y: 0 };
	inverse_scale = 1;
	start_rect: DOMRect | null = null;
	bounds: RectLike | undefined;
	dragging = false;
	/** The node's original inline `touch-action`, saved when we override it (restored on destroy). */
	saved_touch_action: string | null = null;
	/** Reused scratch for the per-move proposed offset (before constraints write over it). */
	readonly proposed: Point = { x: 0, y: 0 };
	/**
	 * Stable constraint-options object handed to the in-place pipeline each move. Rebuilt in
	 * `start()` (and never per-move) so the hot path doesn't allocate the `{axis,grid,bounds}`
	 * literal every frame. `bounds` is refreshed each move below when it's a live thunk.
	 */
	readonly constrain_opts: ConstrainOptions = {};

	/** Auto target id — peer-local; `targetId` prefers `options.id`. */
	readonly auto_target_id = autoId('drag');
	readonly commit_subscribers = new Set<(op: DragOp) => void>();
	readonly presence_subscribers = new Set<(p: DragPresence | null) => void>();
	/** The peer whose remote drag is currently rendered over this node, or null. */
	remote_peer: string | null = null;
	/** A remote op that arrived while a local drag owned the node — applied on end if the local
	 * gesture produced no commit, so a suppressed remote value isn't lost. */
	pending_remote: DragOp | null = null;
	/** The offset captured at drag-start — `end` only commits when the offset actually changed. */
	readonly start_offset: Point = { x: 0, y: 0 };
	/** Registered drag handles / cancel zones (node → priority). The start-gate walks the pointer's
	 * `composedPath` against these: the innermost registered marker wins (priority overrides the
	 * nesting), `handle` ⇒ allow, `cancel` ⇒ block. Empty `handles` ⇒ the whole node drags. */
	readonly handles = new Map<DndNode, number>();
	readonly cancels = new Map<DndNode, number>();

	constructor(
		readonly node: DndNode,
		options: DragOptions,
	) {
		this.options = options;
		this.offset = options.position ? { ...options.position } : { x: 0, y: 0 };
	}

	get targetId(): string {
		return this.options.id ?? this.auto_target_id;
	}
	get hasExplicitId(): boolean {
		return this.options.id != null;
	}

	event(input: InteractionInput): DragEventData {
		return { offset: { x: this.offset.x, y: this.offset.y }, node: this.node, input };
	}
}

/** In-flight drag presence — the `drag` variant of the unified presence frame. */
export type DragPresence = { type: 'drag'; target: string; x: number; y: number };
/** Eased transition for remote-driven translate (commit glide + presence smoothing). */
const REMOTE_DRAG_EASE = 'translate 140ms ease-out';

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
			applyTranslate(this.#state.node, this.#state.offset.x, this.#state.offset.y, TRANSLATE_DRAG);
		}
		if ('touchAction' in options || 'axis' in options) applyTouchAction(this.#state);
	}

	/**
	 * Register a descendant as a drag **handle** — once any handle exists, a drag may start only from
	 * inside one. `priority` overrides the innermost-wins nesting cascade when zones overlap on the
	 * pointer's path. Returns an idempotent disposer that unregisters only this node.
	 */
	registerHandle(node: DndNode, opts?: { priority?: number }): () => void {
		this.#state.handles.set(node, opts?.priority ?? 0);
		return () => {
			this.#state.handles.delete(node);
		};
	}

	/**
	 * Register a descendant as a **cancel** zone — a drag may never start from inside it. `priority`
	 * overrides the nesting cascade. Returns an idempotent disposer that unregisters only this node.
	 */
	registerCancel(node: DndNode, opts?: { priority?: number }): () => void {
		this.#state.cancels.set(node, opts?.priority ?? 0);
		return () => {
			this.#state.cancels.delete(node);
		};
	}

	get offset(): Point {
		return this.#state.offset;
	}

	get isDragging(): boolean {
		return this.#state.dragging;
	}

	/** The draggable's stable string id — the `target` in the unified op grammar. */
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

	/** Apply a remote drag fact — translates the node to the committed offset (eased). Foreign kinds
	 * ignored — this is the unified `CollabTarget.applyExternal`. */
	applyExternal(op: CollabOp): void {
		if (op.type === 'drag') this.#drag.applyExternal(this.#state, op);
	}

	showRemotePresence(frame: PresenceFrame): void {
		if (frame.type === 'drag') this.#drag.showRemotePresence(this.#state, frame);
	}

	clearRemotePresence(peerId?: string): void {
		this.#drag.clearRemotePresence(this.#state, peerId);
	}

	destroy(): void {
		this.#drag._unbind(this.#state.node);
		clearTranslate(this.#state.node, TRANSLATE_DRAG);
		this.#state.node.removeAttribute(DRAG_MARKER);
		if (this.#state.saved_touch_action !== null) {
			(this.#state.node as HTMLElement).style.touchAction = this.#state.saved_touch_action;
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
		if (options.onCommit && options.id == null) {
			warnOnce(
				'drag:id',
				'this draggable uses onCommit but has no `id` — auto ids are peer-local and will not match across collaborating clients. Give it a stable `id`.',
			);
		}
		this.#nodes.set(node, state);
		if (options.position) applyTranslate(node, state.offset.x, state.offset.y, TRANSLATE_DRAG);
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
		state.inverse_scale = inverseScaleFromNode(state.node, rect);
		// Bounds must clamp against the element's UNTRANSLATED layout box, not its current
		// (already-translated) rect — otherwise the clamp drifts by the accumulated offset and
		// the element escapes its bounds across successive drags.
		const off = state.offset;
		state.start_rect = {
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
			state.inverse_scale,
		);
		state.bounds = resolveBounds(state.options.bounds, state.node);
		state.dragging = true;
		state.start_offset.x = state.offset.x;
		state.start_offset.y = state.offset.y;
		// Drop any remote-driven eased transition so the local drag tracks the pointer instantly.
		if (state.node instanceof HTMLElement && state.node.style) state.node.style.transition = '';
		if (state.options.userSelect === false) session.userSelect = false;
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
		this.#pumpPresence(state);
	}

	/** The offset → constrain → `use`-plugin → translate pipeline for one input frame. */
	#applyMove(state: DragState, input: InteractionInput): void {
		const proposed = state.proposed;
		proposedOffsetInto(proposed, input.clientX, input.clientY, state.anchor, state.inverse_scale);
		// Refresh the cached constraint options from live options (axis/grid can change mid-drag
		// via handle.update); `bounds` was resolved once at start. No literal is allocated.
		const opts = state.constrain_opts;
		opts.axis = state.options.axis;
		opts.grid = state.options.grid;
		opts.bounds = state.bounds;
		constrainInPlace(proposed, opts, state.start_rect ?? undefined);
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
		applyTranslate(state.node, offset.x, offset.y, TRANSLATE_DRAG);
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
		state.node.removeAttribute(DRAG_MARKER);
		const ev = state.event(session.input);
		if (state.options.use) for (const p of state.options.use) p.onEnd?.(ev);
		state.options.onDragEnd?.(ev);
		const moved = state.offset.x !== state.start_offset.x || state.offset.y !== state.start_offset.y;
		if (moved) {
			this.#emitCommit(state, { type: 'drag', target: state.targetId, x: state.offset.x, y: state.offset.y });
			state.pending_remote = null;
		} else if (state.pending_remote) {
			this.applyExternal(state, state.pending_remote);
		}
		for (const fn of state.presence_subscribers) fn(null);
	}

	#emitCommit(state: DragState, op: DragOp): void {
		state.options.onCommit?.(op);
		for (const fn of state.commit_subscribers) fn(op);
	}

	#pumpPresence(state: DragState): void {
		if (state.presence_subscribers.size === 0) return;
		const frame: DragPresence = { type: 'drag', target: state.targetId, x: state.offset.x, y: state.offset.y };
		for (const fn of state.presence_subscribers) fn(frame);
	}

	/** Apply a remote drag fact — translate to the committed offset, eased. A no-op while a local drag
	 *  owns the node (stashed, applied on end if the local gesture commits nothing). */
	applyExternal(state: DragState, op: DragOp): void {
		if (state.dragging) {
			state.pending_remote = op;
			return;
		}
		state.pending_remote = null;
		state.offset = { x: op.x, y: op.y };
		if (state.node instanceof HTMLElement && state.node.style) state.node.style.transition = REMOTE_DRAG_EASE;
		applyTranslate(state.node, op.x, op.y, TRANSLATE_DRAG);
	}

	showRemotePresence(state: DragState, frame: DragPresence & { peerId: string }): void {
		if (state.dragging) return;
		state.remote_peer = frame.peerId;
		if (state.node instanceof HTMLElement && state.node.style) state.node.style.transition = REMOTE_DRAG_EASE;
		applyTranslate(state.node, frame.x, frame.y, TRANSLATE_DRAG);
	}

	clearRemotePresence(state: DragState, peerId?: string): void {
		if (peerId && state.remote_peer !== peerId) return;
		state.remote_peer = null;
		if (state.dragging) return;
		if (state.node instanceof HTMLElement && state.node.style) state.node.style.transition = REMOTE_DRAG_EASE;
		applyTranslate(state.node, state.offset.x, state.offset.y, TRANSLATE_DRAG);
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
		const { handles, cancels } = state;
		// Walk the pointer's composedPath from the hit target up to the draggable root. Path order is
		// target→root, so the first marker met is the innermost; a strictly-higher explicit priority
		// overrides it. handle ⇒ allow, cancel ⇒ block. No reflow, no querySelectorAll.
		if (handles.size > 0 || cancels.size > 0) {
			let kind: 'handle' | 'cancel' | null = null;
			let best = -Infinity;
			for (const el of eventPath(input)) {
				const h = handles.get(el as DndNode);
				if (h !== undefined && h > best) {
					best = h;
					kind = 'handle';
				}
				const c = cancels.get(el as DndNode);
				if (c !== undefined && c > best) {
					best = c;
					kind = 'cancel';
				}
				if (el === state.node || el === document) break;
			}
			if (kind) return kind === 'handle';
		}
		// No registered marker under the pointer: allow-list — handles defined ⇒ block here, else free.
		return handles.size === 0;
	}
}
