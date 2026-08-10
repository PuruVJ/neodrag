import { applyMove, diffToMoves, identityKey, indexAfterAnchor, type MoveOp } from '@neodrag/core/sortable';
import type { CollabBackend, CollabOp, PresenceFrame, PresenceTransport } from '@neodrag/core/collab';

// The before/after → anchor-move-sequence diff is core algebra, shared with @neodrag/yjs.
export { diffToMoves } from '@neodrag/core/sortable';

/**
 * Liveblocks adapter for the neodrag `Room`. Maps the WHOLE unified op set onto the children of a
 * single shared `LiveMap` (Storage's root, or a nested map the app hands in) — one child per collab
 * target, keyed by the target id:
 *
 *  - a **sortable list** → a `LiveList<string>` of keys at `neodrag/list/<id>` (`move` reorders it
 *    via its native `.move()`; `transfer` deletes from the source list and inserts into the
 *    destination — two lists, one logical commit);
 *  - a **draggable / resizable** → a `LiveObject` at `neodrag/val/<id>` holding the last-write-wins
 *    value (`{k:'drag',x,y}` / `{k:'resize',w,h}`).
 *
 * Outbound ops mutate under an `applyingLocal` flag so the deep subscriber ignores the echo.
 * Inbound: one deep `room.subscribe(root, …, {isDeep:true})` recomputes every list child against its
 * previous order — reorders become `move` ops, an item that left one list and joined another becomes
 * a `transfer` — and reads every value child into a `drag`/`resize` op. Presence rides Liveblocks
 * Presence.
 *
 * Only the slices of the Liveblocks API we touch are declared structurally, so this typechecks
 * without bundling `@liveblocks/client`; the app constructs the real room + storage map and hands
 * them in, plus the `LiveList`/`LiveObject` constructors via {@link LiveStructureFactory}.
 */

/* ── structural Liveblocks shims ──────────────────────────────────────────── */

/** Minimal structural view of the `LiveList` surface this adapter uses. */
export interface LiveListLike {
	push(item: string): void;
	insert(item: string, index: number): void;
	delete(index: number): void;
	move(index: number, targetIndex: number): void;
	get(index: number): string | undefined;
	toArray(): string[];
	readonly length: number;
}

/** Minimal structural view of the `LiveObject` surface this adapter uses. */
export interface LiveObjectLike {
	get(key: string): unknown;
	set(key: string, value: unknown): void;
	toObject(): Record<string, unknown>;
}

/** Minimal structural view of the `LiveMap` (Storage root) surface this adapter uses. */
export interface LiveMapLike {
	get(key: string): LiveListLike | LiveObjectLike | undefined;
	set(key: string, value: LiveListLike | LiveObjectLike): void;
	has(key: string): boolean;
	keys(): IterableIterator<string>;
	entries(): IterableIterator<[string, LiveListLike | LiveObjectLike]>;
}

/**
 * The `LiveList`/`LiveObject` constructors, injected so the package stays decoupled from (and
 * fake-testable without) `@liveblocks/client`. Apps pass
 * `{ list: (i) => new LiveList(i), object: (i) => new LiveObject(i) }`.
 */
export interface LiveStructureFactory {
	list: (init: string[]) => LiveListLike;
	object: (init: Record<string, unknown>) => LiveObjectLike;
}

/** Minimal structural view of the Liveblocks `Room` surface this adapter uses. */
export interface RoomLike<P extends object> {
	/** Deep storage subscription — fires after any nested mutation of `node`. */
	subscribe(node: LiveMapLike, cb: () => void, options: { isDeep: true }): () => void;
	updatePresence(patch: Partial<P>): void;
	subscribe(event: 'others', cb: (others: ReadonlyArray<OtherLike<P>>) => void): () => void;
	getOthers(): ReadonlyArray<OtherLike<P>>;
	/** Group writes so deep subscribers fire once after the burst (Liveblocks' `doc.transact`). */
	batch<T>(fn: () => T): T;
}

export interface OtherLike<P> {
	connectionId: number;
	presence: P;
}

export interface PresenceShape {
	'neodrag-presence'?: PresenceFrame | null;
}

const PRESENCE_FIELD = 'neodrag-presence';

// A child read back off the map is a typed `LiveList`/`LiveObject`, but its kind still can't be
// sniffed reliably across the structural shim — and the app needs a known key to bind its lists to.
// So we encode the kind in the map key: a sortable list → `neodrag/list/<id>`, a value target →
// `neodrag/val/<id>`. Inbound, the prefix tells us which view a changed child is; the app reads its
// lists at the same keys.
const LIST_PREFIX = 'neodrag/list/';
const VAL_PREFIX = 'neodrag/val/';
/** The root-map key holding a sortable list's `LiveList<string>` — bind your UI to read it. */
export const listName = (id: string): string => LIST_PREFIX + id;
/** The root-map key holding a drag/resize target's value `LiveObject`. */
export const valName = (id: string): string => VAL_PREFIX + id;
function parseName(name: string): { kind: 'list' | 'val'; id: string } | null {
	if (name.startsWith(LIST_PREFIX)) return { kind: 'list', id: name.slice(LIST_PREFIX.length) };
	if (name.startsWith(VAL_PREFIX)) return { kind: 'val', id: name.slice(VAL_PREFIX.length) };
	return null;
}

/* ── list helpers ─────────────────────────────────────────────────────────── */

/**
 * Translate an anchor `MoveOp` into a `LiveList.move(from, to)`. Liveblocks' move is itself
 * conflict-aware (it rebases concurrent moves server-side), making it the natural target for our
 * anchor ops. We resolve the op against the list's current order to integer indices.
 */
export function applyMoveToLiveList(list: LiveListLike, op: MoveOp): void {
	const keys = list.toArray();
	const from = keys.indexOf(op.itemId);
	if (from === -1) return;
	const next = applyMove(keys, op, identityKey);
	const to = next.indexOf(op.itemId);
	if (to === from || to === -1) return;
	list.move(from, to);
}

function removeKey(list: LiveListLike, key: string): void {
	const i = list.toArray().indexOf(key);
	if (i !== -1) list.delete(i);
}

function insertAfter(list: LiveListLike, key: string, afterId: string | null): void {
	const keys = list.toArray().filter((k) => k !== key);
	list.insert(key, indexAfterAnchor(keys, afterId));
}

/* ── value (drag/resize) helpers ──────────────────────────────────────────── */

type ValueState =
	| { k: 'drag'; x: number; y: number }
	| { k: 'resize'; w: number; h: number; l?: number; t?: number }
	| { k: 'rotate'; a: number };

function readValue(obj: LiveObjectLike): ValueState | null {
	const k = obj.get('k');
	if (k === 'drag') return { k: 'drag', x: Number(obj.get('x')), y: Number(obj.get('y')) };
	if (k === 'resize') {
		const v: ValueState = { k: 'resize', w: Number(obj.get('w')), h: Number(obj.get('h')) };
		if (obj.get('l') != null) v.l = Number(obj.get('l'));
		if (obj.get('t') != null) v.t = Number(obj.get('t'));
		return v;
	}
	if (k === 'rotate') return { k: 'rotate', a: Number(obj.get('a')) };
	return null;
}

/* ── presence ─────────────────────────────────────────────────────────────── */

/** Wrap a Liveblocks room's Presence as a neodrag presence transport. */
export class LiveblocksPresenceTransport implements PresenceTransport {
	readonly #room: RoomLike<PresenceShape>;
	readonly #handlers = new Set<(peerId: string, frame: PresenceFrame | null) => void>();
	#off: (() => void) | null = null;

	constructor(room: RoomLike<PresenceShape>) {
		this.#room = room;
	}

	publish(frame: PresenceFrame | null): void {
		this.#room.updatePresence({ [PRESENCE_FIELD]: frame });
		this.#ensureSubscribed();
	}

	subscribe(handler: (peerId: string, frame: PresenceFrame | null) => void): () => void {
		this.#handlers.add(handler);
		this.#ensureSubscribed();
		// Replay current remote presence so late subscribers see in-flight ghosts.
		for (const other of this.#room.getOthers()) {
			const frame = other.presence[PRESENCE_FIELD];
			if (frame) handler(frame.peerId ?? String(other.connectionId), frame);
		}
		return () => this.#handlers.delete(handler);
	}

	#ensureSubscribed(): void {
		if (this.#off) return;
		this.#off = this.#room.subscribe('others', (others) => {
			for (const other of others) {
				const frame = other.presence[PRESENCE_FIELD] ?? null;
				for (const h of this.#handlers) h(frame?.peerId ?? String(other.connectionId), frame);
			}
		});
	}

	dispose(): void {
		this.#off?.();
		this.#off = null;
		this.#handlers.clear();
	}
}

/* ── backend ──────────────────────────────────────────────────────────────── */

/**
 * Assemble a full `CollabBackend` from a Liveblocks room + a shared `LiveMap` (`root`) the app hands
 * in (Storage's root or a nested map). Every collab target the room adds becomes a child of `root`,
 * keyed by its id; children are created lazily on first reference using `factory`. Handles the whole
 * op set: `move`/`transfer` (sortable lists) and `drag`/`resize` (value objects).
 */
export function liveblocksBackend(
	peerId: string,
	room: RoomLike<PresenceShape>,
	root: LiveMapLike,
	factory: LiveStructureFactory,
): CollabBackend {
	const handlers = new Set<(op: CollabOp) => void>();
	const lastOrders = new Map<string, string[]>();
	const lastValues = new Map<string, string>();
	let applyingLocal = false;
	let off: (() => void) | null = null;

	const emit = (op: CollabOp) => {
		for (const h of handlers) h(op);
	};

	const getOrCreateList = (name: string): LiveListLike => {
		const existing = root.get(name);
		if (existing) return existing as LiveListLike;
		const list = factory.list([]);
		root.set(name, list);
		return list;
	};

	const getOrCreateObject = (name: string): LiveObjectLike => {
		const existing = root.get(name);
		if (existing) return existing as LiveObjectLike;
		const obj = factory.object({});
		root.set(name, obj);
		return obj;
	};

	const handleChange = () => {
		// Collect the changed targets, keyed by bare id and materialized to a typed view. (The deep
		// subscription doesn't tell us *which* child changed, so we recompute every child — list diffs
		// fall out to no-ops, value reads are cheap LWW.)
		const lists: { id: string; before: string[]; after: string[] }[] = [];
		const values: { id: string; value: ValueState }[] = [];
		for (const [name, node] of root.entries()) {
			const parsed = parseName(name);
			if (!parsed) continue;
			if (parsed.kind === 'list') {
				lists.push({ id: parsed.id, before: lastOrders.get(parsed.id) ?? [], after: (node as LiveListLike).toArray() });
			} else {
				const v = readValue(node as LiveObjectLike);
				if (v) values.push({ id: parsed.id, value: v });
			}
		}
		// Snapshot list orders regardless of who caused the change, so the next diff is correct.
		for (const l of lists) lastOrders.set(l.id, l.after);
		// The deep subscription doesn't say *which* child changed (unlike Yjs's `tr.changed`), so we
		// dedupe value reads against their last seen state — emit only the ones that actually moved.
		const changedValues: typeof values = [];
		for (const v of values) {
			const sig = JSON.stringify(v.value);
			if (lastValues.get(v.id) === sig) continue;
			lastValues.set(v.id, sig);
			changedValues.push(v);
		}
		if (applyingLocal) return; // our own echo — state snapshotted above, nothing to emit

		// Value ops are last-write-wins reads.
		for (const { id, value } of changedValues) {
			if (value.k === 'drag') emit({ type: 'drag', target: id, x: value.x, y: value.y });
			else if (value.k === 'rotate') emit({ type: 'rotate', target: id, angle: value.a });
			else
				emit({
					type: 'resize',
					target: id,
					width: value.w,
					height: value.h,
					...(value.l != null ? { left: value.l } : {}),
					...(value.t != null ? { top: value.t } : {}),
				});
		}

		// Sortable ops: an item that left one list and joined another → transfer; otherwise a pure
		// reorder of a single list → move.
		const gone = new Map<string, string>(); // item → source list id
		const arrived: { id: string; item: string }[] = [];
		for (const l of lists) {
			const beforeSet = new Set(l.before);
			const afterSet = new Set(l.after);
			for (const k of l.before) if (!afterSet.has(k)) gone.set(k, l.id);
			for (const k of l.after) if (!beforeSet.has(k)) arrived.push({ id: l.id, item: k });
		}
		const consumed = new Set<string>();
		for (const { id, item } of arrived) {
			const from = gone.get(item);
			if (from !== undefined && from !== id) {
				const after = lastOrders.get(id) ?? [];
				const idx = after.indexOf(item);
				const afterId = idx <= 0 ? null : (after[idx - 1] ?? null);
				emit({ type: 'transfer', target: id, from, itemId: item, afterId });
				consumed.add(id);
				consumed.add(from);
				gone.delete(item);
			}
		}
		for (const l of lists) {
			// A consumed list (transfer source/dest) or a length change unexplained by a transfer is an
			// insert/remove, not a reorder — no `move` op for it.
			if (consumed.has(l.id) || l.before.length !== l.after.length) continue;
			// Full move sequence so ANY reorder (incl. a multi-item bulk edit in one batch) converges.
			for (const m of diffToMoves(l.before, l.after)) {
				emit({ type: 'move', target: l.id, itemId: m.itemId, afterId: m.afterId });
			}
		}
	};

	const ensureSubscribed = () => {
		if (off) return;
		// Seed the diff baselines from existing children so a pre-existing list/value isn't surfaced as
		// a spurious change on the first deep notification.
		for (const [name, node] of root.entries()) {
			const parsed = parseName(name);
			if (!parsed) continue;
			if (parsed.kind === 'list') lastOrders.set(parsed.id, (node as LiveListLike).toArray());
			else {
				const v = readValue(node as LiveObjectLike);
				if (v) lastValues.set(parsed.id, JSON.stringify(v));
			}
		}
		off = room.subscribe(root, handleChange, { isDeep: true });
	};

	return {
		peerId,
		sendOp(op: CollabOp) {
			// Mutate inside one batch (deep subscribers fire once after) under `applyingLocal`, so our
			// own echo is snapshotted but not surfaced — the Liveblocks analog of Yjs's origin tag.
			applyingLocal = true;
			try {
				room.batch(() => {
					if (op.type === 'move') {
						applyMoveToLiveList(getOrCreateList(listName(op.target)), { itemId: op.itemId, afterId: op.afterId });
					} else if (op.type === 'transfer') {
						removeKey(getOrCreateList(listName(op.from)), op.itemId);
						insertAfter(getOrCreateList(listName(op.target)), op.itemId, op.afterId);
					} else if (op.type === 'drag') {
						const o = getOrCreateObject(valName(op.target));
						o.set('k', 'drag');
						o.set('x', op.x);
						o.set('y', op.y);
					} else if (op.type === 'resize') {
						const o = getOrCreateObject(valName(op.target));
						o.set('k', 'resize');
						o.set('w', op.width);
						o.set('h', op.height);
						if (op.left != null) o.set('l', op.left);
						if (op.top != null) o.set('t', op.top);
					} else if (op.type === 'rotate') {
						const o = getOrCreateObject(valName(op.target));
						o.set('k', 'rotate');
						o.set('a', op.angle);
					}
				});
				// Re-snapshot list orders AND value signatures touched by this commit so the next remote
				// diff is grounded — and so the deep subscriber, which Liveblocks fires ASYNCHRONOUSLY
				// (after `applyingLocal` has already reset), sees our own write as a no-op and never
				// echoes it back to our own handler. (Lists were already covered; values were not, so a
				// local drag/resize self-echoed.)
				for (const [name, node] of root.entries()) {
					const parsed = parseName(name);
					if (parsed?.kind === 'list') lastOrders.set(parsed.id, (node as LiveListLike).toArray());
					else if (parsed?.kind === 'val') {
						const v = readValue(node as LiveObjectLike);
						if (v) lastValues.set(parsed.id, JSON.stringify(v));
					}
				}
			} finally {
				applyingLocal = false;
			}
		},
		onRemoteOp(handler: (op: CollabOp) => void) {
			handlers.add(handler);
			ensureSubscribed();
			return () => {
				handlers.delete(handler);
				if (handlers.size === 0 && off) {
					off();
					off = null;
				}
			};
		},
		presence: new LiveblocksPresenceTransport(room),
	};
}


/** Lazily import the real `@liveblocks/client` (typed-only here). */
export async function loadLiveblocks(): Promise<unknown> {
	return import('@liveblocks/client');
}
