import { inverseScaleFromNode } from '../lib/inverse-scale.ts';
import { isPointerInput, type InteractionInput } from '../interaction-input.ts';
import { autoId, is_svg_element, warnOnce } from '../utils.ts';
import type { EndReason } from '../types.ts';
import type { Capability, DndNode, InteractionSession, ResolvedTarget } from '../types.ts';
import type { CollabOp, LocalPresence, PresenceFrame, RotateOp } from '../collab-types.ts';

export const ROTATE_HANDLE_ATTR = 'data-neodrag-rotate-handle';

/** Where the rotation handle sits — purely a marker position, any value is accepted. The common
 *  case is a single grip above the element, but corners work too. */
export type RotateHandlePos = 'top' | 'tl' | 'tr' | 'bl' | 'br' | (string & {});

/** Per-handle binding — spread onto a handle element instead of writing the attribute by hand. */
export type RotateHandleProps = { readonly [ROTATE_HANDLE_ATTR]: string };

/**
 * The pivot a rotation turns around: the element's `center` (default), a named corner, or an
 * element-local `{ x, y }` offset in px from the top-left. Pivot is local config — it never rides
 * the wire (only the resulting `angle` does), so two peers may pivot differently yet converge.
 */
export type RotateOrigin = 'center' | 'tl' | 'tr' | 'bl' | 'br' | { x: number; y: number };

export interface RotateOptions {
	/** Pivot the rotation turns around. Default `'center'`. */
	origin?: RotateOrigin;
	/** Snap the committed/visible angle to a multiple of this many degrees (e.g. `15`). */
	step?: number;
	/** Clamp the angle to `[min, max]` degrees. */
	min?: number;
	max?: number;
	/**
	 * Controlled angle in degrees. Pass a reactive getter (`get angle() { … }`) to drive the
	 * rotation externally; pair it with a setter for two-way binding (the wrapper writes the live
	 * angle back each move). Applied (snapped/clamped via `step`/`min`/`max`) only while no local
	 * rotation owns the node, so a gesture isn't fought.
	 */
	angle?: number;
	disabled?: boolean;
	/** Suppress text selection while rotating (refcounted body `user-select:none`). Default `true`. */
	userSelect?: boolean;
	/**
	 * Stable string id for this rotatable — the `target` in the unified collab op grammar. Required
	 * in practice for collab (it must match across peers); an auto id is peer-local.
	 */
	id?: string;
	onRotateStart?: (e: RotateEventData) => void;
	onRotate?: (e: RotateEventData) => void;
	onRotateEnd?: (e: RotateEventData) => void;
	/**
	 * Pure op stream — fires a serializable `{ type:'rotate', target, angle }` once per rotation that
	 * actually changed the angle, on release. The last-write-wins seam `@neodrag/collab` subscribes
	 * to; composes with (never replaces) `onRotateEnd`.
	 */
	onCommit?: (op: RotateOp) => void;
}

export interface RotateEventData {
	angle: number;
	node: DndNode;
	input: InteractionInput;
}

/** In-flight rotate presence — the `rotate` variant of the unified presence frame. */
export type RotatePresence = { type: 'rotate'; target: string; angle: number };
/** A remote peer's live rotation, rendered over the same node. */
export type RotateRemoteFrame = { peerId: string; angle: number };

/** Eased transition for remote-driven rotation (commit glide + presence smoothing). */
const REMOTE_ROTATE_EASE = 'rotate 140ms ease-out';

/** Normalize the configured angle: snap to `step`, then clamp to `[min, max]`. Pure for testing. */
export function normalizeAngle(angle: number, opts: { step?: number; min?: number; max?: number }): number {
	let a = angle;
	if (opts.step && opts.step > 0) a = Math.round(a / opts.step) * opts.step;
	if (opts.min != null) a = Math.max(opts.min, a);
	if (opts.max != null) a = Math.min(opts.max, a);
	return a;
}

/** The pivot point in viewport coords for a given origin + element rect. Pure for testing. */
export function pivotPoint(origin: RotateOrigin, rect: { left: number; top: number; right: number; bottom: number }): {
	x: number;
	y: number;
} {
	if (origin === 'center') return { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 };
	if (origin === 'tl') return { x: rect.left, y: rect.top };
	if (origin === 'tr') return { x: rect.right, y: rect.top };
	if (origin === 'bl') return { x: rect.left, y: rect.bottom };
	if (origin === 'br') return { x: rect.right, y: rect.bottom };
	return { x: rect.left + origin.x, y: rect.top + origin.y };
}

/** The CSS `transform-origin` keyword/offset matching a {@link RotateOrigin}. */
function originCss(origin: RotateOrigin): string {
	if (origin === 'center') return 'center';
	if (origin === 'tl') return 'left top';
	if (origin === 'tr') return 'right top';
	if (origin === 'bl') return 'left bottom';
	if (origin === 'br') return 'right bottom';
	return `${origin.x}px ${origin.y}px`;
}

/** Read the element's current rotation (degrees) from the individual `rotate` property / transform. */
function readAngle(node: DndNode): number {
	if (is_svg_element(node)) {
		const t = node.getAttribute('transform') ?? '';
		const m = t.match(/rotate\(\s*(-?[\d.]+)/);
		return m ? parseFloat(m[1]!) : 0;
	}
	const r = (node as HTMLElement).style.rotate;
	if (r) {
		const m = r.match(/(-?[\d.]+)deg/);
		if (m) return parseFloat(m[1]!);
	}
	return 0;
}

/** Apply a rotation (degrees) around `origin`. HTML uses the individual `rotate` property (composes
 *  with drag's `translate` and resize's width/height); SVG merges a `rotate(a cx cy)` into transform. */
function applyAngle(node: DndNode, angle: number, origin: RotateOrigin, pivot: { x: number; y: number }): void {
	if (is_svg_element(node)) {
		const rect = node.getBoundingClientRect();
		// SVG rotate takes the pivot in the element's own user space; approximate with the local pivot.
		const cx = pivot.x - rect.left;
		const cy = pivot.y - rect.top;
		const base = (node.getAttribute('transform') ?? '').replace(/\s*rotate\([^)]*\)/, '').trim();
		node.setAttribute('transform', `${base} rotate(${angle} ${cx} ${cy})`.trim());
		return;
	}
	const el = node as HTMLElement;
	el.style.transformOrigin = originCss(origin);
	el.style.rotate = `${angle}deg`;
}

export class RotateState {
	angle = 0;
	initial_angle = 0;
	center = { x: 0, y: 0 };
	initial_pointer_angle = 0;
	inverse_scale = 1;
	/** True while a local rotate gesture owns the node — remote applies defer to it. */
	rotating = false;
	/** Auto target id — peer-local; `targetId` prefers `options.id`. */
	readonly auto_target_id = autoId('rotate');
	readonly commit_subscribers = new Set<(op: RotateOp) => void>();
	readonly presence_subscribers = new Set<(p: RotatePresence | null) => void>();
	/** The peer whose remote rotation is currently rendered over this node, or null. */
	remote_peer: string | null = null;
	/** A remote op that arrived while a local rotate owned the node — applied on end if the local
	 * gesture produced no commit, so a suppressed remote value isn't lost. */
	pending_remote: RotateOp | null = null;

	constructor(
		readonly node: DndNode,
		public options: RotateOptions,
	) {}

	get targetId(): string {
		return this.options.id ?? this.auto_target_id;
	}
	get hasExplicitId(): boolean {
		return this.options.id != null;
	}

	event(input: InteractionInput): RotateEventData {
		return { angle: this.angle, node: this.node, input };
	}
}

export class RotateHandle {
	readonly #rotate: Rotate;
	readonly #state: RotateState;

	constructor(rotate: Rotate, state: RotateState) {
		this.#rotate = rotate;
		this.#state = state;
	}

	update(options: Partial<RotateOptions>): void {
		const s = this.#state;
		Object.assign(s.options, options);
		// Controlled angle is applied only outside a local gesture — the rotation owns the node while
		// it runs (and the two-way setter is writing back, so re-applying would fight it).
		if (!s.rotating && options.angle !== undefined) {
			this.#rotate._applyControlledAngle(s, options.angle);
		}
	}

	/** The current angle in degrees. */
	get angle(): number {
		return this.#state.angle;
	}

	/** The rotatable's stable string id — the `target` in the unified op grammar. */
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

	/** Apply a remote rotate fact — turns the node to the committed angle (eased). Foreign kinds
	 * ignored — this is the unified `CollabTarget.applyExternal`. */
	applyExternal(op: CollabOp): void {
		if (op.type === 'rotate') this.#rotate.applyExternal(this.#state, op);
	}

	showRemotePresence(frame: PresenceFrame): void {
		if (frame.type === 'rotate') this.#rotate.showRemotePresence(this.#state, frame);
	}

	clearRemotePresence(peerId?: string): void {
		this.#rotate.clearRemotePresence(this.#state, peerId);
	}

	destroy(): void {
		this.#rotate._unbind(this.#state.node);
	}
}

const ROTATE_KEY = Symbol('neodrag.rotate');

/**
 * The rotate capability. Claims pointerdowns that land on a rotate handle element
 * (`data-neodrag-rotate-handle`), at a higher priority than resize so a grip wins over an
 * overlapping resize edge. Writes the individual CSS `rotate` property (HTML) so it composes with
 * drag's `translate` and resize's size on the same element.
 */
export class Rotate implements Capability {
	readonly key = ROTATE_KEY;
	readonly name = 'rotate';
	readonly priority = 110;
	readonly #nodes = new Map<DndNode, RotateState>();

	bind(node: DndNode, options: RotateOptions = {}): RotateHandle {
		const state = new RotateState(node, options);
		if (options.onCommit && options.id == null) {
			warnOnce(
				'rotate:id',
				'this rotatable uses onCommit but has no `id` — auto ids are peer-local and will not match across collaborating clients. Give it a stable `id`.',
			);
		}
		this.#nodes.set(node, state);
		// Seed a controlled angle so a fully-controlled rotatable renders correctly before the first
		// gesture (mirrors how drag applies an initial `position`).
		if (options.angle !== undefined) this._applyControlledAngle(state, options.angle);
		return new RotateHandle(this, state);
	}

	/** @internal */
	_unbind(node: DndNode): void {
		this.#nodes.delete(node);
	}

	/** @internal Apply a controlled angle (snapped/clamped via `step`/`min`/`max`) outside a gesture. */
	_applyControlledAngle(state: RotateState, angle: number): void {
		const normalized = normalizeAngle(angle, state.options);
		if (normalized === state.angle) return;
		state.angle = normalized;
		applyAngle(state.node, normalized, state.options.origin ?? 'center', this.#pivotFor(state));
	}

	resolve(input: InteractionInput): ResolvedTarget | null {
		const node = this.#findHandle(input);
		if (!node) return null;
		const state = this.#nodes.get(node)!;
		if (state.options.disabled) return null;
		return { node, data: state };
	}

	start(session: InteractionSession): void {
		const state = session.target.data as RotateState;
		const rect = state.node.getBoundingClientRect();
		state.inverse_scale = inverseScaleFromNode(state.node, rect);
		const origin = state.options.origin ?? 'center';
		state.center = pivotPoint(origin, { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom });
		state.initial_angle = state.angle = readAngle(state.node);
		state.initial_pointer_angle = Math.atan2(
			session.startInput.clientY - state.center.y,
			session.startInput.clientX - state.center.x,
		);
		state.rotating = true;
		// Drop any remote-driven eased transition so the local rotation tracks the pointer instantly.
		if (state.node instanceof HTMLElement && state.node.style) state.node.style.transition = '';
		if (state.options.userSelect === false) session.userSelect = false;
		state.options.onRotateStart?.(state.event(session.input));
	}

	move(session: InteractionSession): void {
		const state = session.target.data as RotateState;
		const pointer_angle = Math.atan2(session.input.clientY - state.center.y, session.input.clientX - state.center.x);
		const delta_deg = ((pointer_angle - state.initial_pointer_angle) * 180) / Math.PI;
		state.angle = normalizeAngle(state.initial_angle + delta_deg, state.options);
		applyAngle(state.node, state.angle, state.options.origin ?? 'center', state.center);
		state.options.onRotate?.(state.event(session.input));
		this.#pumpPresence(state);
	}

	end(session: InteractionSession, _reason: EndReason): void {
		const state = session.target.data as RotateState;
		state.rotating = false;
		state.options.onRotateEnd?.(state.event(session.input));
		if (state.angle !== state.initial_angle) {
			this.#emitCommit(state, { type: 'rotate', target: state.targetId, angle: state.angle });
			state.pending_remote = null;
		} else if (state.pending_remote) {
			this.applyExternal(state, state.pending_remote);
		}
		for (const fn of state.presence_subscribers) fn(null);
	}

	#emitCommit(state: RotateState, op: RotateOp): void {
		state.options.onCommit?.(op);
		for (const fn of state.commit_subscribers) fn(op);
	}

	#pumpPresence(state: RotateState): void {
		if (state.presence_subscribers.size === 0) return;
		const frame: RotatePresence = { type: 'rotate', target: state.targetId, angle: state.angle };
		for (const fn of state.presence_subscribers) fn(frame);
	}

	/** Apply a remote rotate fact — set the angle and glide there. A no-op while a local rotate owns
	 *  the node (stashed, applied on end if the local gesture commits nothing). */
	applyExternal(state: RotateState, op: RotateOp): void {
		if (state.rotating) {
			state.pending_remote = op;
			return;
		}
		state.pending_remote = null;
		state.angle = op.angle;
		const node = state.node;
		if (node instanceof HTMLElement && node.style) node.style.transition = REMOTE_ROTATE_EASE;
		applyAngle(node, op.angle, state.options.origin ?? 'center', this.#pivotFor(state));
	}

	showRemotePresence(state: RotateState, frame: RotateRemoteFrame): void {
		if (state.rotating) return;
		state.remote_peer = frame.peerId;
		const node = state.node;
		if (node instanceof HTMLElement && node.style) node.style.transition = REMOTE_ROTATE_EASE;
		applyAngle(node, frame.angle, state.options.origin ?? 'center', this.#pivotFor(state));
	}

	clearRemotePresence(state: RotateState, peerId?: string): void {
		if (peerId && state.remote_peer !== peerId) return;
		state.remote_peer = null;
		if (state.rotating) return;
		const node = state.node;
		if (node instanceof HTMLElement && node.style) node.style.transition = REMOTE_ROTATE_EASE;
		applyAngle(node, state.angle, state.options.origin ?? 'center', this.#pivotFor(state));
	}

	/** The pivot in viewport coords for the current layout (remote applies happen outside a gesture,
	 *  so `state.center` may be stale — recompute from the live rect). */
	#pivotFor(state: RotateState): { x: number; y: number } {
		const rect = state.node.getBoundingClientRect();
		return pivotPoint(state.options.origin ?? 'center', {
			left: rect.left,
			top: rect.top,
			right: rect.right,
			bottom: rect.bottom,
		});
	}

	#findHandle(input: InteractionInput): DndNode | null {
		const path = isPointerInput(input) ? input.native.composedPath() : input.target ? [input.target] : [];
		for (const el of path) {
			if (!(el instanceof HTMLElement)) {
				if (el === document) break;
				continue;
			}
			if (el.getAttribute(ROTATE_HANDLE_ATTR) == null) continue;
			let owner: HTMLElement | null = el;
			while (owner) {
				if (this.#nodes.has(owner)) return owner;
				owner = owner.parentElement;
			}
		}
		return null;
	}
}

if (import.meta.vitest) {
	const { describe, it, expect } = import.meta.vitest;

	describe('normalizeAngle', () => {
		it('snaps to step then clamps to min/max', () => {
			expect(normalizeAngle(43, { step: 15 })).toBe(45);
			expect(normalizeAngle(7, { step: 15 })).toBe(0);
			expect(normalizeAngle(200, { max: 180 })).toBe(180);
			expect(normalizeAngle(-200, { min: -180 })).toBe(-180);
			expect(normalizeAngle(43, {})).toBe(43);
		});
	});

	describe('pivotPoint', () => {
		const rect = { left: 0, top: 0, right: 100, bottom: 80 };
		it('resolves center, corners, and a custom offset', () => {
			expect(pivotPoint('center', rect)).toEqual({ x: 50, y: 40 });
			expect(pivotPoint('tl', rect)).toEqual({ x: 0, y: 0 });
			expect(pivotPoint('br', rect)).toEqual({ x: 100, y: 80 });
			expect(pivotPoint({ x: 10, y: 20 }, rect)).toEqual({ x: 10, y: 20 });
		});
	});
}
