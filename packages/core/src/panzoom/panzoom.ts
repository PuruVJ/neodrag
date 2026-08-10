import { Draggable } from '../drag/draggable.ts';
import type { DragEventData, DragPlugin, Point } from '../drag/drag.ts';
import type { CollabOp, LocalPresence, PresenceFrame } from '../collab-types.ts';
import type { Room } from '../collab/index.ts';
import { autoId, listen } from '../utils.ts';

export interface PanZoomTransform {
	/** World translate x in viewport px. */
	x: number;
	/** World translate y in viewport px. */
	y: number;
	/** World scale (1 = 100%). */
	scale: number;
}

export interface PanZoomOptions {
	/** Smallest allowed scale. Default `0.1`. */
	minScale?: number;
	/** Largest allowed scale. Default `8`. */
	maxScale?: number;
	/** Initial scale. Default `1`. */
	scale?: number;
	/** Initial translate x (viewport px). Default `0`. */
	x?: number;
	/** Initial translate y (viewport px). Default `0`. */
	y?: number;
	/** Stable string id — the `target` in the unified collab op grammar. Required in practice for
	 * collab (it must match across peers); an auto id is peer-local. */
	id?: string;
	/** Fires on every change — pan move, zoom, or programmatic set. The live-binding seam. */
	onChange?: (t: PanZoomTransform) => void;
	/** Pure op stream — a `{ type: 'panzoom', target, x, y, scale }` fact on every settled change
	 * (pan release, zoom, programmatic set). The last-write-wins seam `@neodrag/collab` subscribes to. */
	onCommit?: (op: CollabOp) => void;
}

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/**
 * Framework-agnostic pan/zoom viewport math. Holds the world's `{ x, y, scale }` transform and the
 * scale clamp, and keeps the point under the cursor fixed while zooming (the Figma/Miro move). It
 * never touches the DOM — applying the transform to the world layer and wiring pan/wheel/pinch input
 * is the wrapper's job. `x`/`y` are viewport-space px (pan is 1:1 with the pointer at any zoom);
 * `transformString()` assumes the world layer has `transform-origin: 0 0`.
 */
export class PanZoomController {
	x: number;
	y: number;
	scale: number;
	readonly #min: number;
	readonly #max: number;
	readonly #initial: PanZoomTransform;
	readonly #on_change?: (t: PanZoomTransform) => void;
	#pan_start: { x: number; y: number } | null = null;
	#panning = false;
	// ── collab seam ───────────────────────────────────────────────────────────
	#id?: string;
	readonly #auto_target_id = autoId('panzoom');
	readonly #on_commit?: (op: CollabOp) => void;
	readonly #commit_subscribers = new Set<(op: CollabOp) => void>();
	readonly #presence_subscribers = new Set<(p: LocalPresence | null) => void>();

	constructor(options: PanZoomOptions = {}) {
		this.#min = options.minScale ?? 0.1;
		this.#max = options.maxScale ?? 8;
		this.x = options.x ?? 0;
		this.y = options.y ?? 0;
		this.scale = clamp(options.scale ?? 1, this.#min, this.#max);
		this.#initial = { x: this.x, y: this.y, scale: this.scale };
		this.#on_change = options.onChange;
		this.#id = options.id;
		this.#on_commit = options.onCommit;
	}

	/** The viewport's stable string id — the `target` in the unified op grammar. */
	get targetId(): string {
		return this.#id ?? this.#auto_target_id;
	}
	get hasExplicitId(): boolean {
		return this.#id != null;
	}

	/** The current transform as a plain object. */
	get transform(): PanZoomTransform {
		return { x: this.x, y: this.y, scale: this.scale };
	}

	/** A CSS `transform` value for the world layer (needs `transform-origin: 0 0`). */
	transformString(): string {
		return `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
	}

	/** Replace any subset of the transform (programmatic / controlled set) and sync it. */
	setTransform(t: Partial<PanZoomTransform>): void {
		this.#apply(t);
		this.#commit();
	}

	/** Translate the world by `(dx, dy)` viewport px. */
	panBy(dx: number, dy: number): void {
		this.#apply({ x: this.x + dx, y: this.y + dy });
		this.#commit();
	}

	/**
	 * Zoom to an absolute `scale`, keeping the viewport-local point `(cx, cy)` fixed on screen so the
	 * content under the cursor doesn't drift. No-op once clamped against the scale bounds.
	 */
	zoomTo(scale: number, cx: number, cy: number): void {
		const next = clamp(scale, this.#min, this.#max);
		if (next === this.scale) return;
		// World point currently under (cx, cy); pin it across the scale change.
		const wx = (cx - this.x) / this.scale;
		const wy = (cy - this.y) / this.scale;
		this.scale = next;
		this.x = cx - wx * next;
		this.y = cy - wy * next;
		this.#emit();
		this.#commit();
	}

	/** Multiply the scale by `factor`, keeping `(cx, cy)` fixed. */
	zoomBy(factor: number, cx: number, cy: number): void {
		this.zoomTo(this.scale * factor, cx, cy);
	}

	/** Restore the initial transform. */
	reset(): void {
		this.setTransform({ x: this.#initial.x, y: this.#initial.y, scale: this.#initial.scale });
	}

	// ── pan-drag seam (the `pan` plugin drives these) ──────────────────────────
	/** Snapshot the translate at gesture start so the move is computed from a stable base. */
	beginPan(): void {
		this.#pan_start = { x: this.x, y: this.y };
		this.#panning = true;
	}
	/** Set the translate to the start plus the drag offset (viewport px). Streams live presence. */
	panTo(offsetX: number, offsetY: number): void {
		if (!this.#pan_start) return;
		this.x = this.#pan_start.x + offsetX;
		this.y = this.#pan_start.y + offsetY;
		this.#emit();
		this.#pump_presence();
	}
	endPan(): void {
		this.#pan_start = null;
		this.#panning = false;
		this.#commit(); // settled transform
		for (const fn of this.#presence_subscribers) fn(null);
	}

	// ── CollabTarget seam ──────────────────────────────────────────────────────
	/** The Room only ever passes `{ id }`. */
	update(options: { id?: string }): void {
		if (options.id !== undefined) this.#id = options.id;
	}
	onCommit(fn: (op: CollabOp) => void): () => void {
		this.#commit_subscribers.add(fn);
		return () => this.#commit_subscribers.delete(fn);
	}
	onPresence(fn: (p: LocalPresence | null) => void): () => void {
		this.#presence_subscribers.add(fn);
		return () => this.#presence_subscribers.delete(fn);
	}
	/** Apply a remote transform — last-write-wins. A no-op while a local pan owns the viewport (the
	 *  local gesture wins). Foreign kinds ignored. */
	applyExternal(op: CollabOp): void {
		if (op.type !== 'panzoom' || this.#panning) return;
		this.#apply({ x: op.x, y: op.y, scale: op.scale });
	}
	/** Render a remote peer's in-flight pan/zoom — set the live transform (no-op during a local pan). */
	showRemotePresence(frame: PresenceFrame): void {
		if (frame.type !== 'panzoom' || this.#panning) return;
		this.#apply({ x: frame.x, y: frame.y, scale: frame.scale });
	}
	// The committed op (or last presence frame) is authoritative — nothing to roll back.
	clearRemotePresence(): void {}

	/** Set state + fire `onChange` only — the path remote facts apply through, so it never re-emits a
	 *  commit (no echo loop). Scale is clamped. */
	#apply(t: Partial<PanZoomTransform>): void {
		if (t.x !== undefined) this.x = t.x;
		if (t.y !== undefined) this.y = t.y;
		if (t.scale !== undefined) this.scale = clamp(t.scale, this.#min, this.#max);
		this.#emit();
	}
	#commit(): void {
		const op: CollabOp = { type: 'panzoom', target: this.targetId, x: this.x, y: this.y, scale: this.scale };
		this.#on_commit?.(op);
		for (const fn of this.#commit_subscribers) fn(op);
	}
	#pump_presence(): void {
		if (this.#presence_subscribers.size === 0) return;
		const frame: LocalPresence = { type: 'panzoom', target: this.targetId, x: this.x, y: this.y, scale: this.scale };
		for (const fn of this.#presence_subscribers) fn(frame);
	}
	#emit(): void {
		this.#on_change?.(this.transform);
	}
}

/**
 * Drag plugin that pans a `PanZoomController`. The viewport is a `Draggable` running this plugin; on
 * each move it feeds the drag offset to the controller (which translates the *world* layer) and
 * returns `{ x: 0, y: 0 }` so the viewport element itself never translates — exactly the marquee
 * pattern. Spread the viewport with `Draggable({ use: [pan(controller)] })`.
 */
export function pan(controller: PanZoomController): DragPlugin {
	return {
		name: 'pan',
		onStart: () => controller.beginPan(),
		onMove: ({ offset }: DragEventData): Point => {
			controller.panTo(offset.x, offset.y);
			return { x: 0, y: 0 };
		},
		onEnd: () => controller.endPan(),
	};
}

export interface PanZoomBindOptions extends PanZoomOptions {
	/** Wheel-zoom sensitivity — scale multiplier per wheel delta unit. Default `0.0015`. */
	wheelSpeed?: number;
	/** Join a collab room — the viewport's transform syncs as a `panzoom` op (a shared canvas). */
	room?: Room;
}

/**
 * Framework-agnostic, DOM-aware pan/zoom binder — the engine-built infinite canvas. The **viewport**
 * is a `Draggable` running the `pan` plugin (drag empty space to pan) plus wheel and two-finger pinch
 * zoom toward the cursor; the **world** layer is the only thing that transforms. Register the two
 * elements with `viewport(el)` / `world(el)` (each returns a disposer, so they bind independently and
 * in any order), and read the live transform from `scale` / `x` / `y`. Framework wrappers map the two
 * register methods to refs/attachments and mirror `onChange` into reactive state; vanilla uses it
 * directly.
 */
export class PanZoom {
	readonly #ctrl: PanZoomController;
	readonly #wheel_speed: number;
	readonly #on_change?: (t: PanZoomTransform) => void;
	readonly #room: Room | undefined;
	readonly #id: string | undefined;
	#room_off: (() => void) | null = null;
	#viewport: HTMLElement | null = null;
	#world: HTMLElement | null = null;
	#drag: Draggable | null = null;
	// Two-finger pinch state. The engine's multitouch guard cancels the one-finger pan when the
	// second pointer lands, so pinch and pan never fight.
	readonly #pointers = new Map<number, { x: number; y: number }>();
	#pinch_dist = 0;

	constructor(options: PanZoomBindOptions = {}) {
		this.#wheel_speed = options.wheelSpeed ?? 0.0015;
		this.#on_change = options.onChange;
		this.#room = options.room;
		this.#id = options.id;
		this.#ctrl = new PanZoomController({
			...options,
			onChange: (t) => {
				this.#apply_world();
				this.#on_change?.(t);
			},
		});
	}

	/** The underlying collab target — its transform syncs across a room. */
	get target(): PanZoomController {
		return this.#ctrl;
	}

	get scale(): number {
		return this.#ctrl.scale;
	}
	get x(): number {
		return this.#ctrl.x;
	}
	get y(): number {
		return this.#ctrl.y;
	}
	get transform(): PanZoomTransform {
		return this.#ctrl.transform;
	}

	/** Register the clipping viewport element. Returns a disposer. */
	viewport(el: HTMLElement): () => void {
		this.#viewport = el;
		el.style.overflow = 'hidden';
		el.style.touchAction = 'none';
		if (!el.style.position) el.style.position = 'relative';
		this.#drag = new Draggable(el, { use: [pan(this.#ctrl)] });
		const unlisten = [
			listen(el, 'wheel', this.#on_wheel, { passive: false }),
			listen(el, 'pointerdown', this.#on_pointer_down),
			listen(el, 'pointermove', this.#on_pointer_move),
			listen(el, 'pointerup', this.#on_pointer_up),
			listen(el, 'pointercancel', this.#on_pointer_up),
		];
		// Collab: the viewport's transform joins the room (it syncs as a `panzoom` op — a shared canvas).
		if (this.#room) this.#room_off = this.#room.add(this.#ctrl, this.#id);
		return () => {
			for (const off of unlisten) off();
			this.#room_off?.();
			this.#room_off = null;
			this.#drag?.destroy();
			this.#drag = null;
			this.#pointers.clear();
			if (this.#viewport === el) this.#viewport = null;
		};
	}

	/** Register the inner content layer that pans and zooms. Returns a disposer. */
	world(el: HTMLElement): () => void {
		this.#world = el;
		el.style.transformOrigin = '0 0';
		this.#apply_world();
		return () => {
			if (this.#world === el) this.#world = null;
		};
	}

	/** Multiply the scale by `factor`, keeping `(cx, cy)` viewport-local fixed (default: centre). */
	zoomBy(factor: number, cx?: number, cy?: number): void {
		const c = this.#focus(cx, cy);
		this.#ctrl.zoomBy(factor, c.x, c.y);
	}
	/** Zoom to an absolute scale, keeping `(cx, cy)` viewport-local fixed (default: centre). */
	zoomTo(scale: number, cx?: number, cy?: number): void {
		const c = this.#focus(cx, cy);
		this.#ctrl.zoomTo(scale, c.x, c.y);
	}
	panBy(dx: number, dy: number): void {
		this.#ctrl.panBy(dx, dy);
	}
	setTransform(t: Partial<PanZoomTransform>): void {
		this.#ctrl.setTransform(t);
	}
	reset(): void {
		this.#ctrl.reset();
	}

	#apply_world(): void {
		if (this.#world) this.#world.style.transform = this.#ctrl.transformString();
	}
	#local(clientX: number, clientY: number): { x: number; y: number } {
		const r = this.#viewport!.getBoundingClientRect();
		return { x: clientX - r.left, y: clientY - r.top };
	}
	#focus(cx?: number, cy?: number): { x: number; y: number } {
		if (cx !== undefined && cy !== undefined) return { x: cx, y: cy };
		if (this.#viewport) {
			const r = this.#viewport.getBoundingClientRect();
			return { x: r.width / 2, y: r.height / 2 };
		}
		return { x: 0, y: 0 };
	}

	#on_wheel = (e: WheelEvent): void => {
		if (!this.#viewport) return;
		e.preventDefault();
		const { x, y } = this.#local(e.clientX, e.clientY);
		this.#ctrl.zoomBy(Math.exp(-e.deltaY * this.#wheel_speed), x, y);
	};
	#on_pointer_down = (e: PointerEvent): void => {
		this.#pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (this.#pointers.size === 2) this.#pinch_dist = this.#dist();
	};
	#on_pointer_move = (e: PointerEvent): void => {
		if (!this.#pointers.has(e.pointerId)) return;
		this.#pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (this.#pointers.size !== 2 || !this.#viewport) return;
		const d = this.#dist();
		if (this.#pinch_dist > 0) {
			const [a, b] = [...this.#pointers.values()];
			const mid = this.#local((a.x + b.x) / 2, (a.y + b.y) / 2);
			this.#ctrl.zoomBy(d / this.#pinch_dist, mid.x, mid.y);
		}
		this.#pinch_dist = d;
	};
	#on_pointer_up = (e: PointerEvent): void => {
		this.#pointers.delete(e.pointerId);
		if (this.#pointers.size < 2) this.#pinch_dist = 0;
	};
	#dist(): number {
		const [a, b] = [...this.#pointers.values()];
		return Math.hypot(a.x - b.x, a.y - b.y);
	}
}
