import {
	applyMove,
	moveOpFromIndices,
	type MoveOp,
	type SortableHandle,
	type SortablePresence,
} from '../sortable/sortable.ts';

/* ────────────────────────────────────────────────────────────────────────────
 * reconcile — mid-drag rebase engine (merged from ./reconcile.ts)
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Anchor-based description of an in-flight insert. `afterId` is the key the dragged item
 * would land immediately after (`null` = front). Unlike a raw `toIndex`, an anchor survives
 * concurrent remote inserts/deletes — which is the whole reason a mid-drag rebase converges.
 */
export interface InsertAnchor {
	itemId: string;
	afterId: string | null;
}

/**
 * The live, optimistic-local order a peer is staring at. The reconcile engine keeps this in
 * lock-step with the canonical list and re-derives in-flight inserts against it after every
 * remote op, so a remote reorder arriving mid-drag *moves the neighbour*, not the ghost.
 */
export interface ReconcileState {
	/** Canonical confirmed order (remote-truth + locally-committed ops). */
	order: string[];
	/** In-flight local drag as a stable anchor, or null when not dragging. */
	inflight: InsertAnchor | null;
}

/** Outcome of feeding a remote op while a local drag is in flight. */
export interface RebaseResult {
	/** The new canonical order after the remote op. */
	order: string[];
	/** The in-flight insert re-resolved against `order`, or null if it dissolved. */
	inflight: InsertAnchor | null;
	/** New zero-based insert index the local ghost should occupy in the *displayed* order. */
	insertIndex: number;
	/** True when the remote op forced the in-flight insert index to shift. */
	rebased: boolean;
}

/** Derive the stable anchor for inserting `itemId` at `toIndex` of `order`. */
export function anchorFor(order: readonly string[], itemId: string, toIndex: number): InsertAnchor {
	const from = order.indexOf(itemId);
	if (from === -1) {
		// itemId not in this order yet (cross-list) — anchor purely on target neighbour.
		const afterId = toIndex <= 0 ? null : (order[toIndex - 1] ?? null);
		return { itemId, afterId };
	}
	const op = moveOpFromIndices(order, from, toIndex);
	return { itemId: op.itemId, afterId: op.afterId };
}

/**
 * Resolve an anchor to a concrete zero-based insert index in `order` (the index the dragged
 * item occupies *after* removal of itself). Mirrors `applyMove`'s placement rules so the
 * displayed ghost and the eventual committed op agree.
 */
export function resolveInsertIndex(order: readonly string[], anchor: InsertAnchor): number {
	const without = order.filter((k) => k !== anchor.itemId);
	if (anchor.afterId === null) return 0;
	const at = without.indexOf(anchor.afterId);
	if (at === -1) return without.length; // anchor gone → append (matches applyMove fallback)
	return at + 1;
}

/**
 * The collab reconcile engine. Owns the optimistic-local order and performs **mid-drag
 * rebase**: when a remote op lands while a local drag is in flight, it snapshots, applies the
 * remote op to the canonical order, then re-resolves the in-flight anchor against the new
 * order — so the drag continues uninterrupted and both peers converge.
 *
 * It is intentionally pure/DOM-free: the sortable capability owns the visuals; this owns the
 * order algebra. `bindCollab` wires the two together.
 */
export class ReconcileEngine {
	#order: string[];
	#inflight: InsertAnchor | null = null;
	/** The canonical order frozen at drag start, used to detect whether a rebase shifted us. */
	#dragBaseIndex = -1;

	constructor(initial: readonly string[]) {
		this.#order = initial.slice();
	}

	get order(): readonly string[] {
		return this.#order;
	}

	get inflight(): InsertAnchor | null {
		return this.#inflight;
	}

	get isDragging(): boolean {
		return this.#inflight !== null;
	}

	/** Insert index the in-flight ghost currently occupies in the canonical order (-1 if idle). */
	get insertIndex(): number {
		return this.#dragBaseIndex;
	}

	/** Replace the canonical order wholesale (framework re-pushed a snapshot). */
	syncOrder(order: readonly string[]): void {
		this.#order = order.slice();
	}

	/** Begin tracking a local in-flight drag from a sortable presence snapshot. */
	beginLocal(presence: SortablePresence): InsertAnchor {
		const anchor = anchorFor(this.#order, presence.dragKey, presence.toIndex);
		this.#inflight = anchor;
		this.#dragBaseIndex = resolveInsertIndex(this.#order, anchor);
		return anchor;
	}

	/** Update the in-flight insert as the local pointer moves. Returns the resolved index. */
	updateLocal(presence: SortablePresence): number {
		const anchor = anchorFor(this.#order, presence.dragKey, presence.toIndex);
		this.#inflight = anchor;
		const idx = resolveInsertIndex(this.#order, anchor);
		this.#dragBaseIndex = idx;
		return idx;
	}

	/** End the local drag. If `committedOp` is given, fold it into the canonical order. */
	endLocal(committedOp?: MoveOp): void {
		if (committedOp) this.#order = applyMove(this.#order, committedOp);
		this.#inflight = null;
		this.#dragBaseIndex = -1;
	}

	/**
	 * Fold a remote op into the canonical order. When a drag is in flight this performs the
	 * mid-drag rebase: snapshot the anchor, apply the remote op, re-resolve the anchor against
	 * the new order. The drag is never cancelled — its insert index simply shifts if needed.
	 */
	applyRemote(op: MoveOp): RebaseResult {
		const before = this.#inflight;
		const prevIndex = this.#dragBaseIndex;
		this.#order = applyMove(this.#order, op);

		if (!before) {
			return { order: this.#order, inflight: null, insertIndex: -1, rebased: false };
		}

		// Re-resolve the SAME anchor against the new order. The anchor (afterId) is stable, so
		// the ghost stays after the same neighbour even though absolute indices shifted.
		let anchor = before;
		// If the remote op moved our own dragged item out from under us (it shouldn't, since we
		// hold it locally), keep the anchor but recompute itemId placement defensively.
		const insertIndex = resolveInsertIndex(this.#order, anchor);
		this.#dragBaseIndex = insertIndex;
		this.#inflight = anchor;
		return {
			order: this.#order,
			inflight: anchor,
			insertIndex,
			rebased: insertIndex !== prevIndex,
		};
	}

	/** Snapshot for debugging/tests. */
	snapshot(): ReconcileState {
		return { order: this.#order.slice(), inflight: this.#inflight };
	}
}

/* ────────────────────────────────────────────────────────────────────────────
 * presence — throttled presence channel + memory transport (merged from ./presence.ts)
 * ──────────────────────────────────────────────────────────────────────────── */

/** A point in client coordinates — the live pointer of a remote dragger. */
export interface PresencePoint {
	x: number;
	y: number;
}

/**
 * Ephemeral in-flight presence shared between peers. Extends the sortable's own
 * `SortablePresence` with a resolved `insertIndex` (post-rebase) and a live `pointer`, so a
 * remote peer can render a ghost placeholder where the dragger intends to drop. Never
 * persisted — dropped the instant the drag ends.
 */
export interface CollabPresence extends SortablePresence {
	/** Stable peer id (one in-flight drag per peer). */
	peerId: string;
	/** Insert index re-resolved against the receiver's order (the ghost slot). */
	insertIndex: number;
	/** Live pointer position, for a follow-the-cursor ghost. */
	pointer: PresencePoint | null;
}

export type PresenceHandler = (peerId: string, presence: CollabPresence | null) => void;

/** Pluggable transport for presence frames. Backends (Yjs Awareness, Liveblocks) implement it. */
export interface PresenceTransport {
	publish(presence: CollabPresence | null): void;
	subscribe(handler: PresenceHandler): () => void;
}

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

/**
 * Throttled presence broadcaster + remote-presence store. Outbound frames are rate-limited
 * (leading + trailing edge) so a 120Hz pointer doesn't flood the channel; inbound frames are
 * stored per-peer and surfaced for ghost rendering. A `null` publish (drag end) always flushes
 * immediately so peers never see a stuck ghost.
 */
export class PresenceChannel {
	readonly #transport: PresenceTransport;
	readonly #throttleMs: number;
	readonly #remote = new Map<string, CollabPresence>();
	readonly #listeners = new Set<PresenceHandler>();
	#off: (() => void) | null = null;

	#lastSentAt = -Infinity;
	#pending: CollabPresence | null = null;
	#hasPending = false;
	#timer: ReturnType<typeof setTimeout> | null = null;

	constructor(transport: PresenceTransport, throttleMs = 40) {
		this.#transport = transport;
		this.#throttleMs = throttleMs;
		this.#off = transport.subscribe((peerId, presence) => this.#onRemote(peerId, presence));
	}

	/** Broadcast our in-flight drag. `null` ends presence (flushed immediately). */
	broadcast(presence: CollabPresence | null): void {
		if (presence === null) {
			this.#flushNull();
			return;
		}
		const elapsed = now() - this.#lastSentAt;
		if (elapsed >= this.#throttleMs) {
			this.#send(presence);
			return;
		}
		// Coalesce: keep only the freshest frame, fire on the trailing edge.
		this.#pending = presence;
		this.#hasPending = true;
		if (this.#timer === null) {
			this.#timer = setTimeout(() => this.#trailing(), this.#throttleMs - elapsed);
		}
	}

	/** All remote peers' in-flight presence, by peer id. */
	remotePresences(): ReadonlyMap<string, CollabPresence> {
		return this.#remote;
	}

	/** Subscribe to remote presence changes (for ghost rendering). */
	onPresence(handler: PresenceHandler): () => void {
		this.#listeners.add(handler);
		return () => this.#listeners.delete(handler);
	}

	dispose(): void {
		if (this.#timer !== null) {
			clearTimeout(this.#timer);
			this.#timer = null;
		}
		this.#off?.();
		this.#off = null;
		this.#listeners.clear();
		this.#remote.clear();
	}

	#trailing(): void {
		this.#timer = null;
		if (!this.#hasPending || this.#pending === null) return;
		const frame = this.#pending;
		this.#pending = null;
		this.#hasPending = false;
		this.#send(frame);
	}

	#flushNull(): void {
		if (this.#timer !== null) {
			clearTimeout(this.#timer);
			this.#timer = null;
		}
		this.#pending = null;
		this.#hasPending = false;
		this.#lastSentAt = now();
		this.#transport.publish(null);
	}

	#send(presence: CollabPresence): void {
		this.#lastSentAt = now();
		this.#transport.publish(presence);
	}

	#onRemote(peerId: string, presence: CollabPresence | null): void {
		if (presence === null) this.#remote.delete(peerId);
		else this.#remote.set(peerId, presence);
		for (const l of this.#listeners) l(peerId, presence);
	}
}

/**
 * In-process presence transport mirroring `MemoryCollab` — connect two channels and presence
 * frames round-trip. For tests/demos with no network.
 */
export class MemoryPresence implements PresenceTransport {
	readonly #peerId: string;
	readonly #handlers = new Set<PresenceHandler>();
	readonly #peers = new Set<MemoryPresence>();

	constructor(peerId: string) {
		this.#peerId = peerId;
	}

	connect(other: MemoryPresence): void {
		this.#peers.add(other);
		other.#peers.add(this);
	}

	publish(presence: CollabPresence | null): void {
		for (const peer of this.#peers) {
			for (const h of peer.#handlers) h(this.#peerId, presence);
		}
	}

	subscribe(handler: PresenceHandler): () => void {
		this.#handlers.add(handler);
		return () => this.#handlers.delete(handler);
	}
}

/* ────────────────────────────────────────────────────────────────────────────
 * session — the deep collab session (merged from ./session.ts)
 * ──────────────────────────────────────────────────────────────────────────── */

/** Backend a deep collab session needs: a durable op channel + an ephemeral presence one. */
export interface CollabBackend {
	/** Stable id for this peer (used as the presence key). */
	peerId: string;
	sendOp(op: MoveOp): void;
	onRemoteOp(handler: (op: MoveOp) => void): () => void;
	presence: PresenceTransport;
}

export interface CollabSessionOptions {
	/** Initial key order (canonical). The session keeps this in lock-step thereafter. */
	order: string[];
	/** Presence throttle in ms. Default 40. */
	presenceThrottleMs?: number;
	/** Called when remote presence (a peer's in-flight drag) changes — render a ghost. */
	onRemotePresence?: (peerId: string, presence: CollabPresence | null) => void;
	/** Called after a remote op rebases the local in-flight drag (insert index shifted). */
	onRebase?: (insertIndex: number) => void;
}

/**
 * The real collab session — the headline. It binds one `SortableHandle` to a `CollabBackend`,
 * and runs the full deep loop:
 *
 *  - **outbound ops**: local commits flow out as anchor `MoveOp`s (durable).
 *  - **inbound ops**: remote ops reconcile through `applyExternal` *and* are folded into the
 *    `ReconcileEngine`. If a local drag is in flight, the op triggers a **mid-drag rebase** —
 *    the in-flight insert anchor is re-resolved against the new order; the drag continues.
 *  - **presence**: each `pump()` while dragging broadcasts our in-flight `{dragKey, insertIndex,
 *    pointer}` (throttled). Remote presence is surfaced for ghost placeholders.
 *
 * Deterministic: tests `pump()` it explicitly; an app can also let it self-pump via rAF.
 */
export class CollabSession {
	readonly #handle: SortableHandle;
	readonly #backend: CollabBackend;
	readonly #reconcile: ReconcileEngine;
	readonly #presence: PresenceChannel;
	readonly #options: CollabSessionOptions;
	readonly #cleanups: Array<() => void> = [];

	#dragging = false;
	#lastPointer: PresencePoint | null = null;
	#offPresence: (() => void) | null = null;

	constructor(handle: SortableHandle, backend: CollabBackend, options: CollabSessionOptions) {
		this.#handle = handle;
		this.#backend = backend;
		this.#options = options;
		this.#reconcile = new ReconcileEngine(options.order);
		this.#presence = new PresenceChannel(backend.presence, options.presenceThrottleMs);

		// Local commits flow out as durable ops AND fold into the canonical order.
		handle.update({
			onCommit: (op) => {
				this.#reconcile.endLocal(op);
				this.#dragging = false;
				this.#presence.broadcast(null);
				backend.sendOp(op);
			},
		});

		// Remote ops: reconcile the DOM list, fold into the engine (mid-drag rebase if needed).
		this.#cleanups.push(
			backend.onRemoteOp((op) => {
				this.#handle.applyExternal(op);
				const result = this.#reconcile.applyRemote(op);
				if (result.inflight) {
					this.#broadcastInflight();
					if (result.rebased) this.#options.onRebase?.(result.insertIndex);
				}
			}),
		);

		if (options.onRemotePresence) {
			this.#offPresence = this.#presence.onPresence(options.onRemotePresence);
		}
	}

	/** The reconcile engine (canonical order + in-flight anchor) — for inspection/tests. */
	get reconcile(): ReconcileEngine {
		return this.#reconcile;
	}

	/** Remote peers' in-flight presence, by peer id — render a ghost per entry. */
	remotePresences(): ReadonlyMap<string, CollabPresence> {
		return this.#presence.remotePresences();
	}

	/** Re-push the canonical order when the framework's item array changes. */
	syncOrder(order: string[]): void {
		this.#reconcile.syncOrder(order);
	}

	/**
	 * Pump one tick of local presence. Call from the sortable move observer (or rAF). Reads the
	 * sortable's live `presence()`, maps it through the reconcile engine to a stable insert
	 * index, and broadcasts it (throttled). Idempotent when nothing is in flight.
	 */
	pump(pointer?: PresencePoint): void {
		if (pointer) this.#lastPointer = pointer;
		const presence = this.#handle.presence();
		if (!presence) {
			if (this.#dragging) {
				this.#dragging = false;
				this.#presence.broadcast(null);
			}
			return;
		}
		if (!this.#dragging) {
			this.#dragging = true;
			this.#reconcile.beginLocal(presence);
		} else {
			this.#reconcile.updateLocal(presence);
		}
		this.#broadcastInflight();
	}

	dispose(): void {
		for (const off of this.#cleanups) off();
		this.#cleanups.length = 0;
		this.#offPresence?.();
		this.#offPresence = null;
		this.#presence.dispose();
		this.#handle.update({ onCommit: undefined });
	}

	/**
	 * Broadcast the current in-flight frame. Reads the *already-resolved* insert index from the
	 * reconcile engine (which may have just rebased) rather than re-deriving from `toIndex` — so
	 * a remote op that shifted the anchor's absolute slot is reflected, not clobbered.
	 */
	#broadcastInflight(): void {
		const presence = this.#handle.presence();
		if (!presence) return;
		const insertIndex = this.#reconcile.isDragging
			? this.#reconcile.insertIndex
			: presence.toIndex;
		const frame: CollabPresence = {
			...presence,
			peerId: this.#backend.peerId,
			insertIndex,
			pointer: this.#lastPointer,
		};
		this.#presence.broadcast(frame);
	}
}

/* ────────────────────────────────────────────────────────────────────────────
 * CollabProvider seam + in-process Memory backends
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * `@neodrag/collab` — opt-in collaborative layer. The core stays CRDT-agnostic; this binds a
 * sortable's CRDT-ready seams (`onCommit` op-stream + `applyExternal`) to any backend via a
 * thin `CollabProvider`. Per-backend adapters (`collab-yjs`, `collab-liveblocks`, …) just
 * implement this interface.
 */
export interface CollabProvider {
	/** Publish a durable anchor move op to peers. */
	sendOp(op: MoveOp): void;
	/** Subscribe to remote ops. Returns an unsubscribe fn. */
	onRemoteOp(handler: (op: MoveOp) => void): () => void;
	/** Ephemeral presence (in-flight drag), never persisted. Optional. */
	sendPresence?(presence: SortablePresence | null): void;
}

/**
 * Wire a sortable handle to a provider: local commits flow out as ops; remote ops are
 * reconciled back through the same reorder path (`applyExternal`). Returns a teardown fn.
 */
export function bindCollab(handle: CollabTarget, provider: CollabProvider): () => void {
	handle.update({ onCommit: (op) => provider.sendOp(op) });
	const off = provider.onRemoteOp((op) => handle.applyExternal(op));
	return () => {
		off();
		handle.update({ onCommit: undefined });
	};
}

/**
 * The minimal sortable seam `bindCollab` needs — satisfied by both the low-level
 * `SortableHandle` and the public `SortableList` class.
 */
export interface CollabTarget {
	update(options: { onCommit?: ((op: MoveOp) => void) | undefined }): void;
	applyExternal(op: MoveOp): void;
}

/** Trivial single-process provider connecting peers — for tests/demos (no network). */
export class MemoryCollab implements CollabProvider {
	readonly #handlers = new Set<(op: MoveOp) => void>();
	readonly #peers = new Set<MemoryCollab>();

	connect(other: MemoryCollab): void {
		this.#peers.add(other);
		other.#peers.add(this);
	}

	sendOp(op: MoveOp): void {
		for (const peer of this.#peers) {
			for (const handler of peer.#handlers) handler(op);
		}
	}

	onRemoteOp(handler: (op: MoveOp) => void): () => void {
		this.#handlers.add(handler);
		return () => this.#handlers.delete(handler);
	}
}

/**
 * A complete in-process `CollabBackend` (durable ops via `MemoryCollab` + ephemeral presence
 * via `MemoryPresence`). Connect two with `MemoryBackend.pair(...)` for a two-peer test.
 */
export class MemoryBackend implements CollabBackend {
	readonly #collab = new MemoryCollab();
	readonly presence: MemoryPresence;

	constructor(readonly peerId: string) {
		this.presence = new MemoryPresence(peerId);
	}

	/** Build two connected backends sharing both an op channel and a presence channel. */
	static pair(idA: string, idB: string): [MemoryBackend, MemoryBackend] {
		const a = new MemoryBackend(idA);
		const b = new MemoryBackend(idB);
		a.#collab.connect(b.#collab);
		a.presence.connect(b.presence);
		return [a, b];
	}

	sendOp(op: MoveOp): void {
		this.#collab.sendOp(op);
	}

	onRemoteOp(handler: (op: MoveOp) => void): () => void {
		return this.#collab.onRemoteOp(handler);
	}
}
