import { applyMove, moveOpFromIndices } from '../sortable/sortable.ts';
import { warnOnce } from '../utils.ts';
import type {
	CollabOp,
	CollabTarget,
	LocalPresence,
	Mirror,
	PresenceFrame,
	SortableOp,
} from '../collab-types.ts';

// Re-export the unified collab grammar from the barrel so `@neodrag/core/collab` is the one import
// site for the seam types (also reachable as `Room.Target`/`Room.Op`/… via the namespace).
export type {
	CollabTarget,
	CollabOp,
	SortableOp,
	DragOp,
	ResizeOp,
	RotateOp,
	LocalPresence,
	PresenceFrame,
	Mirror,
} from '../collab-types.ts';

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

/** Derive the stable anchor for inserting `itemId` at `toIndex` of `order`. */
export function anchorFor(order: readonly string[], itemId: string, to_index: number): InsertAnchor {
	const from = order.indexOf(itemId);
	if (from === -1) {
		// itemId not in this order yet (cross-list) — anchor purely on target neighbour.
		const afterId = to_index <= 0 ? null : (order[to_index - 1] ?? null);
		return { itemId, afterId };
	}
	const op = moveOpFromIndices(order, from, to_index);
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

/* ────────────────────────────────────────────────────────────────────────────
 * RoomReconciler — multi-list order algebra for the unified Room
 * ──────────────────────────────────────────────────────────────────────────── */

/** The sortable variant of a local presence frame — what `beginLocal`/`updateLocal` consume. */
type SortablePresenceFrame = Extract<LocalPresence, { type: 'sortable' }>;

/** Outcome of folding a remote sortable op while a local drag may be in flight. */
export interface RoomRebaseResult {
	/** The in-flight insert index after the fold (-1 when no drag, or the drag dissolved). */
	insertIndex: number;
	/** True when the fold shifted the in-flight insert index. */
	rebased: boolean;
	/** Whether a local drag is still in flight after the fold. */
	inflight: boolean;
}

/**
 * The Room's order engine. Anchor-based multi-list reconciliation (keyed by
 * target id) and adds `transfer` ops, so a kanban move between two lists folds both sides. Owns the
 * same mid-drag rebase: a remote op re-resolves the in-flight anchor against the shifted order so a
 * concurrent reorder moves the *neighbour*, not the ghost. Pure/DOM-free — the sortable handle owns
 * the visuals.
 */
export class RoomReconciler {
	readonly #orders = new Map<string, string[]>();
	#inflight: { target: string; from_target: string; item_id: string; after_id: string | null } | null =
		null;
	#insert_index = -1;

	/** Seed (or replace) the canonical order for one list. */
	seed(target: string, keys: readonly string[]): void {
		this.#orders.set(target, keys.slice());
	}

	/** Current canonical order for a list ('' fallback for an unseeded target). */
	orderOf(target: string): readonly string[] {
		return this.#orders.get(target) ?? [];
	}

	get isDragging(): boolean {
		return this.#inflight !== null;
	}

	/** Insert index the in-flight ghost occupies in its target list (-1 when idle). */
	get insertIndex(): number {
		return this.#insert_index;
	}

	/** Begin tracking a local in-flight sortable drag from a presence frame. */
	beginLocal(presence: SortablePresenceFrame): void {
		const order = this.orderOf(presence.target);
		const anchor = anchorFor(order, presence.itemId, presence.insertIndex);
		this.#inflight = {
			target: presence.target,
			from_target: presence.fromTarget,
			item_id: presence.itemId,
			after_id: anchor.afterId,
		};
		this.#insert_index = resolveInsertIndex(order, anchor);
	}

	/** Update the in-flight anchor as the local pointer moves. */
	updateLocal(presence: SortablePresenceFrame): void {
		const order = this.orderOf(presence.target);
		const anchor = anchorFor(order, presence.itemId, presence.insertIndex);
		this.#inflight = {
			target: presence.target,
			from_target: presence.fromTarget,
			item_id: presence.itemId,
			after_id: anchor.afterId,
		};
		this.#insert_index = resolveInsertIndex(order, anchor);
	}

	/** End the local drag, optionally folding the committed op into the canonical order(s). */
	endLocal(op?: SortableOp): void {
		if (op) this.#fold(op);
		this.#inflight = null;
		this.#insert_index = -1;
	}

	/**
	 * Fold a remote op into the canonical order(s) and rebase any in-flight drag. If the op
	 * *transfers away the very item being dragged*, the in-flight anchor is meaningless and is
	 * dropped; otherwise the anchor re-resolves against the shifted order (the drag continues).
	 */
	applyRemote(op: SortableOp): RoomRebaseResult {
		this.#fold(op);

		if (!this.#inflight) return { insertIndex: -1, rebased: false, inflight: false };

		const prev = this.#insert_index;

		// The dragged item was transferred out from under us → the anchor has no meaning.
		if (op.type === 'transfer' && op.itemId === this.#inflight.item_id) {
			this.#inflight = null;
			this.#insert_index = -1;
			return { insertIndex: -1, rebased: prev !== -1, inflight: false };
		}

		const order = this.orderOf(this.#inflight.target);
		const insert_index = resolveInsertIndex(order, {
			itemId: this.#inflight.item_id,
			afterId: this.#inflight.after_id,
		});
		this.#insert_index = insert_index;
		return { insertIndex: insert_index, rebased: insert_index !== prev, inflight: true };
	}

	/** Apply an op to the canonical order(s) — move within a list, transfer across two. */
	#fold(op: SortableOp): void {
		if (op.type === 'move') {
			this.seed(op.target, applyMove(this.orderOf(op.target), { itemId: op.itemId, afterId: op.afterId }));
			return;
		}
		// transfer: remove from `from`, insert into `target` after the anchor.
		this.seed(op.from, this.orderOf(op.from).filter((k) => k !== op.itemId));
		const to = this.orderOf(op.target).filter((k) => k !== op.itemId);
		const at =
			op.afterId === null
				? 0
				: to.indexOf(op.afterId) === -1
					? to.length
					: to.indexOf(op.afterId) + 1;
		to.splice(at, 0, op.itemId);
		this.seed(op.target, to);
	}
}

/* ────────────────────────────────────────────────────────────────────────────
 * presence — throttled presence channel + memory transport (merged from ./presence.ts)
 * ──────────────────────────────────────────────────────────────────────────── */

export type PresenceHandler = (peerId: string, presence: PresenceFrame | null) => void;

/** Pluggable transport for presence frames. Backends (Yjs Awareness, Liveblocks) implement it. */
export interface PresenceTransport {
	publish(presence: PresenceFrame | null): void;
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
	readonly #throttle_ms: number;
	readonly #remote = new Map<string, PresenceFrame>();
	readonly #listeners = new Set<PresenceHandler>();
	#off: (() => void) | null = null;

	#last_sent_at = -Infinity;
	#pending: PresenceFrame | null = null;
	#has_pending = false;
	#timer: ReturnType<typeof setTimeout> | null = null;

	constructor(transport: PresenceTransport, throttle_ms = 40) {
		this.#transport = transport;
		this.#throttle_ms = throttle_ms;
		this.#off = transport.subscribe((peerId, presence) => this.#on_remote(peerId, presence));
	}

	/** Broadcast our in-flight drag. `null` ends presence (flushed immediately). */
	broadcast(presence: PresenceFrame | null): void {
		if (presence === null) {
			this.#flush_null();
			return;
		}
		const elapsed = now() - this.#last_sent_at;
		if (elapsed >= this.#throttle_ms) {
			this.#send(presence);
			return;
		}
		// Coalesce: keep only the freshest frame, fire on the trailing edge.
		this.#pending = presence;
		this.#has_pending = true;
		if (this.#timer === null) {
			this.#timer = setTimeout(() => this.#trailing(), this.#throttle_ms - elapsed);
		}
	}

	/** All remote peers' in-flight presence, by peer id. */
	remotePresences(): ReadonlyMap<string, PresenceFrame> {
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
		if (!this.#has_pending || this.#pending === null) return;
		const frame = this.#pending;
		this.#pending = null;
		this.#has_pending = false;
		this.#send(frame);
	}

	#flush_null(): void {
		if (this.#timer !== null) {
			clearTimeout(this.#timer);
			this.#timer = null;
		}
		this.#pending = null;
		this.#has_pending = false;
		this.#last_sent_at = now();
		this.#transport.publish(null);
	}

	#send(presence: PresenceFrame): void {
		this.#last_sent_at = now();
		this.#transport.publish(presence);
	}

	#on_remote(peerId: string, presence: PresenceFrame | null): void {
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

	publish(presence: PresenceFrame | null): void {
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

/** Backend a {@link Room} needs: a durable op channel + an ephemeral presence one. */
export interface CollabBackend {
	/** Stable id for this peer (used as the presence key). */
	peerId: string;
	sendOp(op: CollabOp): void;
	onRemoteOp(handler: (op: CollabOp) => void): () => void;
	presence: PresenceTransport;
}

export interface RoomOptions {
	/** Presence throttle in ms. Default 40. */
	presenceThrottleMs?: number;
	/**
	 * Auto-clear a remote peer's presence this many ms after its last frame (when no terminal `null`
	 * frame arrived — e.g. the peer dropped offline mid-gesture). `0` disables the sweep. Default `0`.
	 */
	presenceTtlMs?: number;
	/** Called when a remote peer's in-flight presence changes (`null` = the gesture ended or expired). */
	onRemotePresence?: (frame: PresenceFrame | null) => void;
	/** Called for every remote op after it's routed + applied — an observability hook (e.g. a "synced"
	 *  pulse). The op is already applied to its target; this is purely a notification. */
	onRemoteOp?: (op: CollabOp) => void;
	/** Where to render a remote sortable drag's floating clone (see {@link Mirror}). */
	mirror?: Mirror;
}

/**
 * The unified collaborative orchestrator — the single public entry point. Any number of targets
 * (a sortable list, a draggable box, a resizable panel, a rotatable) `join` one Room over a
 * {@link CollabBackend}; the Room runs the full deep loop for every one:
 *
 *  - **outbound ops**: each target's commits flow out as durable `CollabOp`s (`move`/`transfer`/
 *    `drag`/`resize`/`rotate`), folded into the {@link RoomReconciler} for sortable lists.
 *  - **inbound ops**: a remote op is routed to its target by `op.target` and applied through the
 *    same path a local commit uses; sortable ops also rebase any in-flight drag (mid-drag rebase).
 *  - **presence**: in-flight gestures broadcast a throttled {@link PresenceFrame}; remote frames
 *    render a ghost on the matching target and arm a TTL sweep so a vanished peer leaves no stuck ghost.
 *
 * Construct with a backend (use `Room.memoryPair` for in-process tests/demos), then `room.add(target)`.
 */
export class Room {
	readonly #backend: CollabBackend;
	readonly #options: RoomOptions;
	readonly #presence: PresenceChannel;
	readonly #reconcile = new RoomReconciler();
	readonly #targets = new Map<string, CollabTarget>();
	/** Room-level subscriptions (backend op + presence), torn down only by `destroy()`. */
	readonly #cleanups: Array<() => void> = [];
	/** Per-target disposers — one per `add()` call; `destroy()` flushes all. */
	readonly #target_disposers = new Set<() => void>();
	readonly #ttl = new Map<string, ReturnType<typeof setTimeout>>();
	/** Reactive-state listeners (framework adapters subscribe for `peers`/`presences`). */
	readonly #subscribers = new Set<() => void>();
	/** Cached immutable state snapshot — invalidated on change so `getSnapshot` is referentially
	 *  stable between changes (required by React `useSyncExternalStore`). */
	#snapshot: { peers: readonly string[]; presences: ReadonlyMap<string, PresenceFrame> } | null = null;
	#destroyed = false;

	constructor(backend: CollabBackend, options: RoomOptions = {}) {
		this.#backend = backend;
		this.#options = options;
		this.#presence = new PresenceChannel(backend.presence, options.presenceThrottleMs);

		this.#cleanups.push(backend.onRemoteOp((op) => this.#on_remote_op(op)));
		this.#cleanups.push(
			this.#presence.onPresence((peerId, frame) => this.#on_remote_presence(peerId, frame)),
		);
	}

	/**
	 * Add a target (any object satisfying {@link CollabTarget}). `id` overrides the target's own id.
	 * Returns a disposer that removes just this target (its subs + map entry) — call it when the
	 * target unmounts. The framework adapters call this; `destroy()` flushes any that remain.
	 */
	add(target: CollabTarget, id?: string): () => void {
		if (id != null) target.update({ id });
		const target_id = id ?? target.targetId;
		if (id == null && !target.hasExplicitId) {
			warnOnce(
				'room:id',
				'a target joined a Room without an explicit `id` — auto ids are peer-local and will not match across collaborating clients. Pass `room.add(target, id)` or give the target a stable `id`.',
			);
		}
		this.#targets.set(target_id, target);
		const keys = target.keys?.();
		if (keys) this.#reconcile.seed(target_id, keys);

		// Local commits → fold (sortable) + send out the wire.
		const off_commit = target.onCommit((op) => {
			if (this.#destroyed) return;
			if (op.type === 'move' || op.type === 'transfer') this.#reconcile.endLocal(op);
			this.#backend.sendOp(op);
		});
		// Local presence → reconcile (sortable) + broadcast a throttled frame.
		const off_presence = target.onPresence((p) => {
			if (this.#destroyed) return;
			if (p === null) {
				this.#presence.broadcast(null);
				return;
			}
			let frame = { ...p, peerId: this.#backend.peerId } as PresenceFrame;
			if (p.type === 'sortable') {
				if (this.#reconcile.isDragging) this.#reconcile.updateLocal(p);
				else this.#reconcile.beginLocal(p);
				frame = { ...frame, insertIndex: this.#reconcile.insertIndex } as PresenceFrame;
			}
			this.#presence.broadcast(frame);
		});

		let disposed = false;
		const dispose = (): void => {
			if (disposed) return; // idempotent — React StrictMode add→dispose→add is safe
			disposed = true;
			off_commit();
			off_presence();
			// Only evict if the map still points at this target (a re-add under the same id may have replaced it).
			if (this.#targets.get(target_id) === target) this.#targets.delete(target_id);
			this.#target_disposers.delete(dispose);
			// Reconciler order is intentionally left seeded — harmless, re-seeds on next gesture.
		};
		this.#target_disposers.add(dispose);
		return dispose;
	}

	/** Subscribe to reactive room state (`peers`/`presences`) changes. Returns an unsubscribe fn. The
	 *  framework `useRoom`/`setRoom` wrappers bind this to their native reactive primitive. */
	subscribe(listener: () => void): () => void {
		this.#subscribers.add(listener);
		return () => this.#subscribers.delete(listener);
	}

	/** Connected peer ids (those with active in-flight presence). Referentially stable between changes. */
	get peers(): readonly string[] {
		return this.#snap().peers;
	}

	/** Remote peers' in-flight presence, by peer id. Referentially stable between changes. */
	get presences(): ReadonlyMap<string, PresenceFrame> {
		return this.#snap().presences;
	}

	#snap(): { peers: readonly string[]; presences: ReadonlyMap<string, PresenceFrame> } {
		if (!this.#snapshot) {
			const presences = new Map(this.#presence.remotePresences());
			this.#snapshot = { presences, peers: [...presences.keys()] };
		}
		return this.#snapshot;
	}

	#emit_change(): void {
		this.#snapshot = null; // invalidate cache before notifying so listeners read fresh
		for (const fn of this.#subscribers) fn();
	}

	/** Tear down every subscription (room-level + any remaining per-target). Targets' own `on*`
	 *  callbacks keep firing locally. */
	destroy(): void {
		this.#destroyed = true;
		for (const off of this.#cleanups) off();
		this.#cleanups.length = 0;
		for (const dispose of [...this.#target_disposers]) dispose();
		this.#target_disposers.clear();
		for (const t of this.#ttl.values()) clearTimeout(t);
		this.#ttl.clear();
		this.#subscribers.clear();
		this.#presence.dispose();
	}

	#on_remote_op(op: CollabOp): void {
		if (op.type === 'move' || op.type === 'transfer') this.#reconcile.applyRemote(op);
		this.#targets.get(op.target)?.applyExternal(op);
		this.#options.onRemoteOp?.(op);
	}

	#on_remote_presence(peerId: string, frame: PresenceFrame | null): void {
		if (frame === null) {
			for (const t of this.#targets.values()) t.clearRemotePresence(peerId);
			this.#clear_ttl(peerId);
			this.#options.onRemotePresence?.(null);
			this.#emit_change();
			return;
		}
		this.#targets.get(frame.target)?.showRemotePresence(frame, { mirror: this.#options.mirror });
		this.#arm_ttl(peerId);
		this.#options.onRemotePresence?.(frame);
		this.#emit_change();
	}

	#arm_ttl(peerId: string): void {
		this.#clear_ttl(peerId);
		const ttl = this.#options.presenceTtlMs ?? 0;
		if (ttl <= 0) return;
		this.#ttl.set(
			peerId,
			setTimeout(() => {
				this.#ttl.delete(peerId);
				for (const t of this.#targets.values()) t.clearRemotePresence(peerId, { ease: true });
				this.#options.onRemotePresence?.(null);
				this.#emit_change();
			}, ttl),
		);
	}

	#clear_ttl(peerId: string): void {
		const t = this.#ttl.get(peerId);
		if (t !== undefined) {
			clearTimeout(t);
			this.#ttl.delete(peerId);
		}
	}

	/** The ops-only minimal path (no presence) — wire a single target to a provider. The low-level
	 *  primitive under a full Room; returns a teardown fn. */
	static bind(target: CollabTarget, provider: CollabProvider): () => void {
		const off_commit = target.onCommit((op) => provider.sendOp(op));
		const off_remote = provider.onRemoteOp((op) => target.applyExternal(op));
		return () => {
			off_commit();
			off_remote();
		};
	}

	/** A single in-process backend (no network) — for tests/demos. */
	static memory(peerId: string): MemoryBackend {
		return new MemoryBackend(peerId);
	}

	/** Two connected in-process backends sharing op + presence channels — for two-peer tests/demos. */
	static memoryPair(idA: string, idB: string): [MemoryBackend, MemoryBackend] {
		return MemoryBackend.pair(idA, idB);
	}
}

// Type-only namespace merge — dotted `Room.Options`/`Room.Target`/… for the public surface. Holds
// ONLY type aliases (it erases to nothing at runtime); statics like `Room.bind`/`Room.memory` are
// real class members above, never declared here.
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Room {
	export type Options = RoomOptions;
	export type Target = CollabTarget;
	export type Op = CollabOp;
	export type Backend = CollabBackend;
	export type Provider = CollabProvider;
	export type Presence = PresenceFrame;
	export type Mirror = import('../collab-types.ts').Mirror;
}

/* ────────────────────────────────────────────────────────────────────────────
 * CollabProvider seam + in-process Memory backends
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * The ops-only seam {@link Room.bind} drives — a durable op channel with no presence. Per-backend
 * adapters (`@neodrag/yjs`, `@neodrag/liveblocks`, …) implement it; the core stays CRDT-agnostic.
 */
export interface CollabProvider {
	/** Publish a durable op to peers. */
	sendOp(op: CollabOp): void;
	/** Subscribe to remote ops. Returns an unsubscribe fn. */
	onRemoteOp(handler: (op: CollabOp) => void): () => void;
	/** Ephemeral presence, never persisted. Optional. */
	sendPresence?(presence: LocalPresence | null): void;
}

/** Trivial single-process provider connecting peers — for tests/demos (no network). */
export class MemoryCollab implements CollabProvider {
	readonly #handlers = new Set<(op: CollabOp) => void>();
	readonly #peers = new Set<MemoryCollab>();

	connect(other: MemoryCollab): void {
		this.#peers.add(other);
		other.#peers.add(this);
	}

	sendOp(op: CollabOp): void {
		for (const peer of this.#peers) {
			for (const handler of peer.#handlers) handler(op);
		}
	}

	onRemoteOp(handler: (op: CollabOp) => void): () => void {
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

	sendOp(op: CollabOp): void {
		this.#collab.sendOp(op);
	}

	onRemoteOp(handler: (op: CollabOp) => void): () => void {
		return this.#collab.onRemoteOp(handler);
	}
}
