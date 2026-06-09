import type { EndReason } from '../types.ts';
import {
	isNativeDndInput,
	nativeDropFiles,
	nativeDropText,
	type InteractionInput,
} from '../interaction-input.ts';
import type { Point, RectLike } from '../drag/drag.ts';
import type { Capability, DndNode, InteractionSession, ResolvedTarget } from '../types.ts';
import { listen } from '../utils.ts';

/**
 * Collision ranking policies. `'pointer'` and `'closestCenter'` are the originals ported from
 * `drop-targets.ts`. `'closestEdge'` and `'intersection'` are the richer strategies the deep-drop
 * port adds — `closestEdge` ranks by distance to the nearest rect edge (good for list inserts),
 * `intersection` ranks by overlap area with a probe rect (the dragged element), so the zone the
 * dragged element *covers most* wins. All four tie-break only when at least one candidate opts in.
 */
export type CollisionPolicy = 'pointer' | 'closestCenter' | 'closestEdge' | 'intersection';

/**
 * The v1 collision seam. Drop hit-testing flows through a pluggable index so the
 * spatial-index moonshot (quad-tree/R-tree) and off-DOM geometry backends (virtual/canvas)
 * drop in without touching the drop capability. Default impl is a trivial linear scan.
 */
export interface CollisionIndex<T> {
	insert(id: T, rect: RectLike): void;
	update(id: T, rect: RectLike): void;
	remove(id: T): void;
	clear(): void;
	/** Ids whose rect contains the point. */
	query(x: number, y: number): T[];
}

export class LinearCollisionIndex<T> implements CollisionIndex<T> {
	readonly #rects = new Map<T, RectLike>();

	insert(id: T, rect: RectLike): void {
		this.#rects.set(id, rect);
	}
	update(id: T, rect: RectLike): void {
		this.#rects.set(id, rect);
	}
	remove(id: T): void {
		this.#rects.delete(id);
	}
	clear(): void {
		this.#rects.clear();
	}
	query(x: number, y: number): T[] {
		const hits: T[] = [];
		for (const [id, r] of this.#rects) {
			if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) hits.push(id);
		}
		return hits;
	}
}

export function centerDistanceSq(r: RectLike, x: number, y: number): number {
	const cx = (r.left + r.right) / 2;
	const cy = (r.top + r.bottom) / 2;
	const dx = x - cx;
	const dy = y - cy;
	return dx * dx + dy * dy;
}

/** Squared distance from a point to the nearest edge of `r` (0 when the point is inside). */
export function edgeDistanceSq(r: RectLike, x: number, y: number): number {
	const dx = Math.max(r.left - x, 0, x - r.right);
	const dy = Math.max(r.top - y, 0, y - r.bottom);
	return dx * dx + dy * dy;
}

/** Overlap area (px²) between two rects; 0 when disjoint. Used by the `'intersection'` policy. */
export function intersectionArea(a: RectLike, b: RectLike): number {
	const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
	const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
	return w > 0 && h > 0 ? w * h : 0;
}

export interface RankCandidate {
	rect: RectLike;
	priority: number;
	policy: CollisionPolicy;
}

/** Probe geometry for richer strategies: the dragged element's current rect (for `intersection`). */
export interface RankContext {
	probeRect?: RectLike | null;
}

/** True when `a` should rank ahead of `b` for the closest-* / intersection policies at (x,y). */
function beatsTie<T extends RankCandidate>(a: T, b: T, x: number, y: number, ctx?: RankContext): boolean {
	// `intersection` only kicks in when we have a probe rect to overlap against.
	if ((a.policy === 'intersection' || b.policy === 'intersection') && ctx?.probeRect) {
		return intersectionArea(a.rect, ctx.probeRect) > intersectionArea(b.rect, ctx.probeRect);
	}
	if (a.policy === 'closestEdge' || b.policy === 'closestEdge') {
		return edgeDistanceSq(a.rect, x, y) < edgeDistanceSq(b.rect, x, y);
	}
	if (a.policy === 'closestCenter' || b.policy === 'closestCenter') {
		return centerDistanceSq(a.rect, x, y) < centerDistanceSq(b.rect, x, y);
	}
	return false;
}

/**
 * The single ranking function (replaces the duplicate logic the teardown found in
 * `drop-targets.ts` and `interaction-coordinator.ts`). Highest priority wins; ties are
 * broken by the strategy either candidate prefers (closest-center / closest-edge / max
 * intersection-area). `ctx.probeRect` is the dragged element's rect for the area strategy.
 */
export function rankDrop<T extends RankCandidate>(
	candidates: T[],
	x: number,
	y: number,
	ctx?: RankContext,
): T | null {
	if (candidates.length === 0) return null;
	let best = candidates[0]!;
	for (let i = 1; i < candidates.length; i++) {
		const c = candidates[i]!;
		if (c.priority > best.priority) {
			best = c;
			continue;
		}
		if (c.priority < best.priority) continue;
		if (beatsTie(c, best, x, y, ctx)) best = c;
	}
	return best;
}

/**
 * Multi-sample hit-testing presets. The original `drop-targets.ts` only ever hit-tested the
 * bare pointer (one point), which means a zone is "entered" only when the *cursor* crosses it —
 * a large dragged element can visually overlap a zone with its edge while the cursor is still
 * outside. Multi-sampling fixes that: we hit-test several points of the dragged element's rect,
 * not just the pointer, so a zone counts as hit when *any* sampled point lands inside it.
 *
 *  - `'pointer'`  : just the pointer (legacy behaviour, cheapest).
 *  - `'corners'`  : pointer + the 4 rect corners (edge overlap is detected).
 *  - `'edges'`    : pointer + 4 corners + 4 edge midpoints (denser; thin zones between corners).
 *  - `'center'`   : pointer + rect center (intent-following without edge bleed).
 *  - `'all'`      : pointer + corners + edge midpoints + center (densest).
 */
export type DropSampleMode = 'pointer' | 'corners' | 'edges' | 'center' | 'all';

/**
 * A sampler turns a pointer position + the dragged element's current rect into the set of points
 * to hit-test this frame. This is the `dropPointerSamples` seam ported from the original engine
 * extension hook (`extension-registry.ts`), now a first-class drop option. Custom samplers (e.g.
 * "follow the leading edge in the drag direction") plug in by passing a function.
 */
export type DropSampler = (ctx: { pointer: Point; rect: RectLike | null }) => Point[];

function corners(rect: RectLike): Point[] {
	return [
		{ x: rect.left, y: rect.top },
		{ x: rect.right, y: rect.top },
		{ x: rect.left, y: rect.bottom },
		{ x: rect.right, y: rect.bottom },
	];
}

function edgeMidpoints(rect: RectLike): Point[] {
	const cx = (rect.left + rect.right) / 2;
	const cy = (rect.top + rect.bottom) / 2;
	return [
		{ x: cx, y: rect.top },
		{ x: cx, y: rect.bottom },
		{ x: rect.left, y: cy },
		{ x: rect.right, y: cy },
	];
}

function center(rect: RectLike): Point {
	return { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 };
}

/** Resolve the `dropPointerSamples` option (mode preset OR custom sampler) to a sampler fn. */
export function resolveSampler(mode: DropSampleMode | DropSampler | undefined): DropSampler {
	if (typeof mode === 'function') return mode;
	const m = mode ?? 'pointer';
	if (m === 'pointer') return ({ pointer }) => [pointer];
	return ({ pointer, rect }) => {
		const pts: Point[] = [pointer];
		if (!rect) return pts;
		if (m === 'center') {
			pts.push(center(rect));
			return pts;
		}
		pts.push(...corners(rect));
		if (m === 'edges' || m === 'all') pts.push(...edgeMidpoints(rect));
		if (m === 'all') pts.push(center(rect));
		return pts;
	};
}

/**
 * rAF coalescer ported from `drop-targets.ts` (`queueUpdate`/`flush`/`reset`). Pointer moves can
 * fire many times per frame (high-Hz mice, coalesced native events). Hit-testing every move is
 * wasteful — the geometry only matters once per paint. This batches: any number of `schedule()`
 * calls inside one frame collapse to a single `run` callback at the next animation frame, and the
 * latest value wins. `flush()` runs synchronously (for the drop commit on pointerup), cancelling
 * any pending frame so we never double-run.
 */
export class RafBatch<T> {
	readonly #run: (value: T) => void;
	#rafId = 0;
	#pending: T | null = null;
	#has = false;

	constructor(run: (value: T) => void) {
		this.#run = run;
	}

	/** True while a frame is queued but not yet fired. */
	get scheduled(): boolean {
		return this.#rafId !== 0;
	}

	/** Coalesce: store the latest value, schedule one frame if none is pending. */
	schedule(value: T): void {
		this.#pending = value;
		this.#has = true;
		if (this.#rafId) return;
		this.#rafId = requestAnimationFrame(() => {
			this.#rafId = 0;
			if (!this.#has) return;
			const v = this.#pending as T;
			this.#has = false;
			this.#pending = null;
			this.#run(v);
		});
	}

	/** Run synchronously now (drop/end path), cancelling any pending frame. */
	flush(value: T): void {
		this.cancel();
		this.#has = false;
		this.#pending = null;
		this.#run(value);
	}

	/** Cancel a pending frame and drop the stored value without running. */
	cancel(): void {
		if (this.#rafId) {
			cancelAnimationFrame(this.#rafId);
			this.#rafId = 0;
		}
		this.#has = false;
		this.#pending = null;
	}
}

export interface VirtualCollisionOptions<T> {
	/**
	 * The virtualizer's on-screen set — the ids whose rects are currently rendered/visible.
	 * When supplied, `query` only hit-tests these ids, so cost is O(visible) regardless of how
	 * many rects are stored. Off-screen rects are kept (for cheap update/insert as items scroll
	 * into view) but never matched.
	 */
	visible?: () => Iterable<T>;
}

/**
 * The flagship perf arena's drop-in for the {@link CollisionIndex} seam. Stores rects in a Map
 * exactly like `LinearCollisionIndex`, but when a `visible()` provider is given the query phase
 * iterates only the virtualizer's on-screen ids — turning a 100k-item drop/sortable hit-test
 * into an O(visible) scan. Without the option it degrades to plain linear behavior.
 */
export class VirtualCollisionIndex<T> implements CollisionIndex<T> {
	readonly #rects = new Map<T, RectLike>();
	readonly #visible?: () => Iterable<T>;

	constructor(options?: VirtualCollisionOptions<T>) {
		this.#visible = options?.visible;
	}

	insert(id: T, rect: RectLike): void {
		this.#rects.set(id, rect);
	}
	update(id: T, rect: RectLike): void {
		this.#rects.set(id, rect);
	}
	remove(id: T): void {
		this.#rects.delete(id);
	}
	clear(): void {
		this.#rects.clear();
	}

	query(x: number, y: number): T[] {
		const hits: T[] = [];
		// Restrict to the on-screen set when virtualized; otherwise scan everything (linear).
		const ids = this.#visible ? this.#visible() : this.#rects.keys();
		for (const id of ids) {
			const r = this.#rects.get(id);
			if (r === undefined) continue; // visible() may name an id that was removed/not yet inserted.
			if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) hits.push(id);
		}
		return hits;
	}
}

export interface DropEventData {
	zone: DndNode;
	/** The dragged element for an in-app drag; `null` for an OS (native) file/text drop. */
	dragNode: DndNode | null;
	data: unknown;
	input: InteractionInput;
	/** OS-dropped files — populated only on `onDrop` of a native drop (empty otherwise). */
	files?: File[];
	/** OS-dropped text — populated only on `onDrop` of a native drop. */
	text?: string;
}

/** What `accepts` receives. `dragNode`/`data` are null for a native drop; `types` lists the OS
 * payload kinds (e.g. `'Files'`, `'text/plain'`), available throughout a native drag. */
export interface DropAcceptCtx {
	dragNode: DndNode | null;
	data: unknown;
	files?: File[];
	text?: string;
	types?: readonly string[];
}

export interface DropOptions {
	/** Filter which drags this zone accepts. Receives the drag node + its `dragData` (or the native
	 * payload kinds). */
	accepts?: (ctx: DropAcceptCtx) => boolean;
	collision?: CollisionPolicy;
	priority?: number;
	/** Grow the hit rect by N px on each side. */
	hitExpand?: number;
	/** Opt this zone into OS drag-and-drop (files / selected text). Arms the native sensor on the
	 * shared engine; the drop arrives through `onDrop` with `e.files` / `e.text`. */
	native?: boolean;
	onEnter?: (e: DropEventData) => void;
	/* see DropEngineOptions for engine-wide knobs (samples, batching) that aren't per-zone */
	onOver?: (e: DropEventData) => void;
	onLeave?: (e: DropEventData) => void;
	onDrop?: (e: DropEventData) => void;
}

/** Engine-wide drop knobs (one per `Drop` capability, not per zone). */
export interface DropEngineOptions {
	/**
	 * Multi-sample hit-testing (ported from the original `dropPointerSamples` extension hook).
	 * Hit-test several points of the dragged element's rect instead of only the pointer, so a
	 * zone is entered when the element's *edge* overlaps even if the cursor doesn't. A preset
	 * mode string or a custom sampler. Default `'pointer'` (legacy single-point behaviour).
	 */
	dropPointerSamples?: DropSampleMode | DropSampler;
	/**
	 * Coalesce per-move hit-tests into one per animation frame (ported from `drop-targets.ts`).
	 * N pointer moves inside one frame → one hit-test, with a synchronous flush on drop. Default
	 * `false` (hit-test synchronously on every move). Opt in for high-Hz pointers / large zone
	 * counts where per-move hit-testing is the bottleneck.
	 */
	coalesce?: boolean;
	/** Swap in an off-DOM / spatial-index backend for the {@link CollisionIndex} seam. */
	index?: () => CollisionIndex<DropState>;
}

const DROP_MARKER = 'data-neodrag-over';

export class DropState {
	isOver = false;
	/** Rect cached at drag-start (invalidated on scroll/resize) — avoids a reflow per move. */
	rect: RectLike | null = null;
	constructor(
		readonly node: DndNode,
		public options: DropOptions,
	) {}
}

export class DropHandle {
	readonly #drop: Drop;
	readonly #state: DropState;

	constructor(drop: Drop, state: DropState) {
		this.#drop = drop;
		this.#state = state;
	}

	update(options: Partial<DropOptions>): void {
		Object.assign(this.#state.options, options);
	}

	destroy(): void {
		this.#drop._unbind(this.#state.node);
		this.#state.node.removeAttribute(DROP_MARKER);
	}
}

function expand(r: RectLike, by: number): RectLike {
	if (!by) return r;
	return { left: r.left - by, top: r.top - by, right: r.right + by, bottom: r.bottom + by };
}

const DROP_KEY = Symbol('neodrag.drop');

/**
 * The drop capability. Never claims a pointerdown — it *observes* drag sessions (via the
 * engine's observer hook) and hit-tests registered zones through the pluggable
 * `CollisionIndex`. Collision/priority/hit-expand are immutable options, not plugins.
 */
export class Drop implements Capability {
	readonly key = DROP_KEY;
	readonly name = 'drop';
	readonly #zones = new Map<DndNode, DropState>();
	readonly #index: CollisionIndex<DropState>;
	readonly #sampler: DropSampler;
	readonly #samplesNeedRect: boolean;
	readonly #coalesce: boolean;
	readonly #batch: RafBatch<InteractionSession>;
	#over = new Set<DropState>();
	#overNext = new Set<DropState>();
	#hitSeen = new Set<DropState>();
	#hitCount = 0;
	// Zone rects are measured once per drag and reused every move; a scroll/resize during the
	// drag invalidates them so the next hit-test re-measures. Turns N reflows/move → N/drag.
	#measured = false;
	readonly #onInvalidate = (): void => {
		this.#measured = false;
	};
	#unlistenInvalidation: Array<() => void> = [];

	constructor(options: DropEngineOptions = {}) {
		this.#index = options.index ? options.index() : new LinearCollisionIndex<DropState>();
		this.#sampler = resolveSampler(options.dropPointerSamples);
		// The default 'pointer' sampler ignores the dragged element's rect — don't pay a reflow
		// for it every move. Multi-sample modes / custom samplers do need it.
		this.#samplesNeedRect =
			options.dropPointerSamples != null && options.dropPointerSamples !== 'pointer';
		this.#coalesce = options.coalesce === true;
		this.#batch = new RafBatch<InteractionSession>((session) => this.#updateOver(session));
	}

	/** @internal Count of hit-tests run — lets tests assert N moves coalesce to one. */
	get hitCount(): number {
		return this.#hitCount;
	}

	/** @internal True while a coalesced hit-test frame is queued. */
	get pendingFrame(): boolean {
		return this.#batch.scheduled;
	}

	bind(node: DndNode, options: DropOptions = {}): DropHandle {
		const state = new DropState(node, options);
		this.#zones.set(node, state);
		this.#measured = false; // re-measure if a zone is added mid-drag
		return new DropHandle(this, state);
	}

	/** @internal */
	_unbind(node: DndNode): void {
		this.#zones.delete(node);
		this.#measured = false;
	}

	// Drop never owns a pointerdown.
	resolve(): ResolvedTarget | null {
		return null;
	}
	start(): void {}
	move(): void {}
	end(): void {}

	observe(session: InteractionSession, phase: 'start' | 'move' | 'end', _reason?: EndReason): void {
		if (phase === 'move') {
			// Coalesce N moves/frame into one hit-test; sync fallback when batching is off.
			if (this.#coalesce) this.#batch.schedule(session);
			else this.#updateOver(session);
		} else if (phase === 'end') {
			this.#commit(session, _reason);
			this.#teardownInvalidation();
		} else if (phase === 'start') {
			this.#batch.cancel();
			this.#hitCount = 0;
			this.#measured = false;
			this.#setupInvalidation();
		}
	}

	#setupInvalidation(): void {
		if (typeof window === 'undefined') return;
		// scroll is captured (any scroll container) + passive; both just mark rects dirty.
		this.#unlistenInvalidation.push(
			listen(window, 'scroll', this.#onInvalidate, { capture: true, passive: true }),
			listen(window, 'resize', this.#onInvalidate, { passive: true }),
		);
	}

	#teardownInvalidation(): void {
		for (const off of this.#unlistenInvalidation) off();
		this.#unlistenInvalidation.length = 0;
	}

	/** Measure every (accepted) zone's rect once, populate the index. Cheap re-runs are no-ops. */
	#ensureMeasured(session: InteractionSession): void {
		if (this.#measured) return;
		const input = session.input;
		const native = isNativeDndInput(input);
		const dragNode = native ? null : session.target.node;
		const data = native ? null : session.data;
		const types = native && input.dataTransfer ? [...input.dataTransfer.types] : undefined;
		this.#index.clear();
		for (const [node, state] of this.#zones) {
			// A native (OS) drag only lands on zones that opted in with `native: true`; a pointer drag
			// never lands on a native-only intent's own anchor node.
			if (native ? !state.options.native : node === dragNode) {
				state.rect = null;
				continue;
			}
			if (state.options.accepts && !state.options.accepts({ dragNode, data, types })) {
				state.rect = null;
				continue;
			}
			const rect = expand(node.getBoundingClientRect(), state.options.hitExpand ?? 0);
			state.rect = rect;
			this.#index.insert(state, rect);
		}
		this.#measured = true;
	}

	/** Sample points to hit-test this frame: pointer + element-rect samples (multi-sample). */
	#samplePoints(session: InteractionSession): Point[] {
		const pointer = { x: session.input.clientX, y: session.input.clientY };
		return this.#sampler({ pointer, rect: this.#samplesNeedRect ? this.#dragRect(session) : null });
	}

	#dragRect(session: InteractionSession): RectLike | null {
		if (isNativeDndInput(session.input)) return null; // no element — hit-test the pointer only
		const node = session.target.node;
		if (typeof node.getBoundingClientRect !== 'function') return null;
		return node.getBoundingClientRect();
	}

	/** Build the candidate set by hit-testing every sample point and unioning the matches. */
	#candidates(session: InteractionSession): DropState[] {
		this.#hitCount++;
		this.#ensureMeasured(session);

		const seen = this.#hitSeen;
		seen.clear();
		const out: DropState[] = [];
		for (const pt of this.#samplePoints(session)) {
			for (const hit of this.#index.query(pt.x, pt.y)) {
				if (seen.has(hit)) continue;
				seen.add(hit);
				out.push(hit);
			}
		}
		return out;
	}

	#best(session: InteractionSession, candidates: DropState[]): DropState | null {
		const probeRect = this.#dragRect(session);
		const ranked: (RankCandidate & { state: DropState })[] = candidates.map((state) => ({
			state,
			rect: state.rect ?? state.node.getBoundingClientRect(),
			priority: state.options.priority ?? 0,
			policy: state.options.collision ?? 'pointer',
		}));
		const top = rankDrop(ranked, session.input.clientX, session.input.clientY, { probeRect });
		return top ? top.state : null;
	}

	#updateOver(session: InteractionSession): void {
		const candidates = this.#candidates(session);
		// Reuse a second Set instead of allocating one per move; swap the two at the end.
		const next = this.#overNext;
		next.clear();
		for (const c of candidates) next.add(c);

		for (const state of this.#over) {
			if (!next.has(state)) this.#leave(state, session);
		}
		for (const state of next) {
			if (!state.isOver) this.#enter(state, session);
		}
		this.#overNext = this.#over;
		this.#over = next;

		const best = this.#best(session, candidates);
		if (best) best.options.onOver?.(this.#event(best, session));
	}

	#commit(session: InteractionSession, reason?: EndReason): void {
		// Flush synchronously: a pending coalesced frame must not fire after the session ends.
		this.#batch.cancel();
		// A cancel (Escape, or a native drag that left the document) settles zones but never drops.
		if (reason !== 'cancel') {
			const candidates = this.#candidates(session);
			const best = this.#best(session, candidates);
			if (best) best.options.onDrop?.(this.#event(best, session));
		}
		for (const state of this.#over) this.#leave(state, session);
		this.#over.clear();
	}

	#enter(state: DropState, session: InteractionSession): void {
		state.isOver = true;
		state.node.setAttribute(DROP_MARKER, '');
		state.options.onEnter?.(this.#event(state, session));
	}

	#leave(state: DropState, session: InteractionSession): void {
		state.isOver = false;
		state.node.removeAttribute(DROP_MARKER);
		state.options.onLeave?.(this.#event(state, session));
	}

	#event(state: DropState, session: InteractionSession): DropEventData {
		const input = session.input;
		if (isNativeDndInput(input)) {
			// File/text content is only readable on the `drop` phase (the spec hides it during hover).
			const onDrop = input.phase === 'end';
			return {
				zone: state.node,
				dragNode: null,
				data: null,
				input,
				files: onDrop ? nativeDropFiles(input.dataTransfer) : [],
				text: onDrop ? nativeDropText(input.dataTransfer) : '',
			};
		}
		return {
			zone: state.node,
			dragNode: session.target.node,
			data: session.data,
			input,
		};
	}
}
