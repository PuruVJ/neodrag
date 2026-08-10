import { applyMove, diffToMoves, identityKey, indexAfterAnchor, type MoveOp } from '@neodrag/core/sortable';
import type { CollabBackend, CollabOp, PresenceFrame, PresenceTransport } from '@neodrag/core/collab';

// The before/after → anchor-move-sequence diff is core algebra, shared with @neodrag/liveblocks.
export { diffToMoves } from '@neodrag/core/sortable';

/**
 * Yjs adapter for the neodrag `Room`. Maps the WHOLE unified op set onto a `Y.Doc`'s top-level
 * shared types — one per collab target, keyed by the target id:
 *
 *  - a **sortable list** → a `Y.Array<string>` of keys (`move` reorders it; `transfer` deletes from
 *    the source array and inserts into the destination — two arrays, one transaction);
 *  - a **draggable / resizable** → a `Y.Map` holding the last-write-wins value (`{k:'drag',x,y}` /
 *    `{k:'resize',w,h}`).
 *
 * Outbound ops apply under our origin tag (so the echo is ignored). Inbound: a single
 * `afterTransaction` observer diffs every changed array against its previous order — reorders become
 * `move` ops, an item that left one array and joined another becomes a `transfer` — and reads every
 * changed value map into a `drag`/`resize` op. Presence rides `Y.Awareness`.
 *
 * Only the slices of the Yjs API we touch are declared structurally, so this typechecks without
 * bundling `yjs`; the app constructs the real `Y.Doc` + awareness and hands them in.
 */

/* ── structural Yjs shims ─────────────────────────────────────────────────── */

export interface YArrayLike {
	readonly length: number;
	insert(index: number, content: string[]): void;
	delete(index: number, length?: number): void;
	toArray(): string[];
}

export interface YMapLike {
	get(key: string): unknown;
	set(key: string, value: unknown): void;
	has(key: string): boolean;
}

/** A top-level shared type as it appears in `doc.share` / `transaction.changed` (array or map). */
export type YSharedType = YArrayLike | YMapLike;

export interface YTransactionLike {
	readonly origin: unknown;
	/** Yjs `Transaction.changed`: the shared types touched this transaction. */
	readonly changed: Map<YSharedType, Set<string | null>>;
}

export interface YDocLike {
	getArray(name: string): YArrayLike;
	getMap(name: string): YMapLike;
	transact(fn: () => void, origin?: unknown): void;
	on(event: 'afterTransaction', fn: (tr: YTransactionLike) => void): void;
	off(event: 'afterTransaction', fn: (tr: YTransactionLike) => void): void;
	/** Yjs `Doc.share`: name → top-level shared type. */
	readonly share: Map<string, YSharedType>;
}

/** Minimal structural view of the `y-protocols/awareness` surface this adapter uses. */
export interface YAwarenessLike {
	setLocalStateField(field: string, value: unknown): void;
	getStates(): Map<number, Record<string, unknown>>;
	on(event: 'change', fn: (changes: AwarenessChange, origin: unknown) => void): void;
	off(event: 'change', fn: (changes: AwarenessChange, origin: unknown) => void): void;
	readonly clientID: number;
}

export interface AwarenessChange {
	added: number[];
	updated: number[];
	removed: number[];
}

const ORIGIN = Symbol('neodrag.yjs');
const PRESENCE_FIELD = 'neodrag-presence';

// A top-level type integrated from a remote update is a bare `AbstractType` (no array/map methods)
// until `getArray`/`getMap` materializes it — so the kind can't be sniffed structurally. We instead
// encode it in the share name: a sortable list → `neodrag/list/<id>`, a value target → `neodrag/val/
// <id>`. Inbound, the prefix tells us which view to materialize; the app can read its lists at the
// same keys.
const LIST_PREFIX = 'neodrag/list/';
const VAL_PREFIX = 'neodrag/val/';
/** The `doc.share` key holding a sortable list's `Y.Array<string>` — bind your UI to read it. */
export const listName = (id: string): string => LIST_PREFIX + id;
/** The `doc.share` key holding a drag/resize target's value `Y.Map`. */
export const valName = (id: string): string => VAL_PREFIX + id;
function parseName(name: string): { kind: 'list' | 'val'; id: string } | null {
	if (name.startsWith(LIST_PREFIX)) return { kind: 'list', id: name.slice(LIST_PREFIX.length) };
	if (name.startsWith(VAL_PREFIX)) return { kind: 'val', id: name.slice(VAL_PREFIX.length) };
	return null;
}

/* ── array helpers ────────────────────────────────────────────────────────── */

function replaceArray(arr: YArrayLike, next: string[]): void {
	if (arr.length > 0) arr.delete(0, arr.length);
	arr.insert(0, next);
}

function removeKey(arr: YArrayLike, key: string): void {
	const i = arr.toArray().indexOf(key);
	if (i !== -1) arr.delete(i, 1);
}

function insertAfter(arr: YArrayLike, key: string, afterId: string | null): void {
	const keys = arr.toArray().filter((k) => k !== key);
	arr.insert(indexAfterAnchor(keys, afterId), [key]);
}

/** Apply an anchor `MoveOp` to a `Y.Array<string>` of keys (delete-all + reinsert the new order). */
export function applyMoveToYArray(arr: YArrayLike, op: MoveOp): void {
	replaceArray(arr, applyMove(arr.toArray(), op, identityKey));
}

/* ── value (drag/resize) helpers ──────────────────────────────────────────── */

type ValueState =
	| { k: 'drag'; x: number; y: number }
	| { k: 'resize'; w: number; h: number; l?: number; t?: number }
	| { k: 'rotate'; a: number };

function readValue(map: YMapLike): ValueState | null {
	const k = map.get('k');
	if (k === 'drag') return { k: 'drag', x: Number(map.get('x')), y: Number(map.get('y')) };
	if (k === 'resize') {
		const v: ValueState = { k: 'resize', w: Number(map.get('w')), h: Number(map.get('h')) };
		if (map.get('l') != null) v.l = Number(map.get('l'));
		if (map.get('t') != null) v.t = Number(map.get('t'));
		return v;
	}
	if (k === 'rotate') return { k: 'rotate', a: Number(map.get('a')) };
	return null;
}

/* ── presence ─────────────────────────────────────────────────────────────── */

/** Wrap a `Y.Awareness` as a neodrag presence transport. */
export class YjsPresenceTransport implements PresenceTransport {
	readonly #awareness: YAwarenessLike;
	readonly #handlers = new Set<(peerId: string, frame: PresenceFrame | null) => void>();
	#onChange: ((c: AwarenessChange, origin: unknown) => void) | null = null;

	constructor(awareness: YAwarenessLike) {
		this.#awareness = awareness;
	}

	publish(frame: PresenceFrame | null): void {
		this.#awareness.setLocalStateField(PRESENCE_FIELD, frame);
		this.#ensureSubscribed();
	}

	subscribe(handler: (peerId: string, frame: PresenceFrame | null) => void): () => void {
		this.#handlers.add(handler);
		this.#ensureSubscribed();
		// Replay current remote states so late subscribers see in-flight ghosts.
		for (const [client, state] of this.#awareness.getStates()) {
			if (client === this.#awareness.clientID) continue;
			const frame = state[PRESENCE_FIELD] as PresenceFrame | null | undefined;
			if (frame) handler(frame.peerId ?? String(client), frame);
		}
		return () => this.#handlers.delete(handler);
	}

	#ensureSubscribed(): void {
		if (this.#onChange) return;
		this.#onChange = (changes) => {
			const states = this.#awareness.getStates();
			for (const client of [...changes.added, ...changes.updated, ...changes.removed]) {
				if (client === this.#awareness.clientID) continue;
				const state = states.get(client);
				const frame = (state?.[PRESENCE_FIELD] as PresenceFrame | null | undefined) ?? null;
				for (const h of this.#handlers) h(frame?.peerId ?? String(client), frame);
			}
		};
		this.#awareness.on('change', this.#onChange);
	}

	dispose(): void {
		if (this.#onChange) this.#awareness.off('change', this.#onChange);
		this.#onChange = null;
		this.#handlers.clear();
	}
}

/* ── backend ──────────────────────────────────────────────────────────────── */

/**
 * Assemble a full `CollabBackend` from a shared `Y.Doc` + `Y.Awareness`. Every collab target the
 * room adds becomes a top-level shared type in the doc, keyed by its id. Handles the whole op set:
 * `move`/`transfer` (sortable arrays) and `drag`/`resize` (value maps).
 */
export function yjsBackend(peerId: string, doc: YDocLike, awareness: YAwarenessLike): CollabBackend {
	const handlers = new Set<(op: CollabOp) => void>();
	const lastOrders = new Map<string, string[]>();
	const lastValues = new Map<string, string>(); // id → JSON signature of the last value seen
	let onTxn: ((tr: YTransactionLike) => void) | null = null;

	const emit = (op: CollabOp) => {
		for (const h of handlers) h(op);
	};

	const handleTxn = (tr: YTransactionLike) => {
		// Collect the changed targets, keyed by bare id and materialized to a typed view.
		const arrays: { id: string; before: string[]; after: string[] }[] = [];
		const values: { id: string; value: ValueState }[] = [];
		// One reverse scan of doc.share per transaction, instead of a scan per changed type.
		const names = new Map<YSharedType, string>();
		for (const [name, t] of doc.share) names.set(t, name);
		for (const [type] of tr.changed) {
			const name = names.get(type) ?? null;
			const parsed = name ? parseName(name) : null;
			if (!parsed) continue;
			if (parsed.kind === 'list') {
				arrays.push({ id: parsed.id, before: lastOrders.get(parsed.id) ?? [], after: doc.getArray(name!).toArray() });
			} else {
				const v = readValue(doc.getMap(name!));
				if (v) values.push({ id: parsed.id, value: v });
			}
		}
		// Snapshot array orders + value signatures regardless of who caused the change, so the next
		// diff is correct and an unchanged re-touch (or our own echo) doesn't re-emit. A value op is
		// emitted only when its signature actually changed (LWW dedup — parity with the Liveblocks side).
		for (const a of arrays) lastOrders.set(a.id, a.after);
		const changedValues = values.filter((v) => lastValues.get(v.id) !== JSON.stringify(v.value));
		for (const v of values) lastValues.set(v.id, JSON.stringify(v.value));
		if (tr.origin === ORIGIN) return; // our own echo — state snapshotted above, nothing to emit

		// Value ops are LWW reads (only the ones whose value changed).
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

		// Sortable ops: an item that left one array and joined another → transfer; otherwise a pure
		// reorder of a single array → move.
		const gone = new Map<string, string>(); // item → source list id
		const arrived: { id: string; item: string }[] = [];
		for (const a of arrays) {
			const beforeSet = new Set(a.before);
			const afterSet = new Set(a.after);
			for (const k of a.before) if (!afterSet.has(k)) gone.set(k, a.id);
			for (const k of a.after) if (!beforeSet.has(k)) arrived.push({ id: a.id, item: k });
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
		for (const a of arrays) {
			// A consumed array (transfer source/dest) or a length change unexplained by a transfer is
			// an insert/remove, not a reorder — no `move` op for it.
			if (consumed.has(a.id) || a.before.length !== a.after.length) continue;
			// Emit a full sequence of moves so ANY reorder converges — a single transaction that moved
			// several items (e.g. an app bulk-sorting the array) replays exactly, not partially.
			for (const m of diffToMoves(a.before, a.after)) {
				emit({ type: 'move', target: a.id, itemId: m.itemId, afterId: m.afterId });
			}
		}
	};

	const ensureObserver = () => {
		if (onTxn) return;
		for (const name of doc.share.keys()) {
			const parsed = parseName(name);
			if (parsed?.kind === 'list') lastOrders.set(parsed.id, doc.getArray(name).toArray());
			else if (parsed?.kind === 'val') {
				const v = readValue(doc.getMap(name));
				if (v) lastValues.set(parsed.id, JSON.stringify(v));
			}
		}
		onTxn = handleTxn;
		doc.on('afterTransaction', onTxn);
	};

	return {
		peerId,
		sendOp(op: CollabOp) {
			doc.transact(() => {
				if (op.type === 'move') {
					applyMoveToYArray(doc.getArray(listName(op.target)), { itemId: op.itemId, afterId: op.afterId });
				} else if (op.type === 'transfer') {
					removeKey(doc.getArray(listName(op.from)), op.itemId);
					insertAfter(doc.getArray(listName(op.target)), op.itemId, op.afterId);
				} else if (op.type === 'drag') {
					const m = doc.getMap(valName(op.target));
					m.set('k', 'drag');
					m.set('x', op.x);
					m.set('y', op.y);
				} else if (op.type === 'resize') {
					const m = doc.getMap(valName(op.target));
					m.set('k', 'resize');
					m.set('w', op.width);
					m.set('h', op.height);
					if (op.left != null) m.set('l', op.left);
					if (op.top != null) m.set('t', op.top);
				} else if (op.type === 'rotate') {
					const m = doc.getMap(valName(op.target));
					m.set('k', 'rotate');
					m.set('a', op.angle);
				}
			}, ORIGIN);
		},
		onRemoteOp(handler: (op: CollabOp) => void) {
			handlers.add(handler);
			ensureObserver();
			return () => {
				handlers.delete(handler);
				if (handlers.size === 0 && onTxn) {
					doc.off('afterTransaction', onTxn);
					onTxn = null;
				}
			};
		},
		presence: new YjsPresenceTransport(awareness),
	};
}

/** Lazily import the real `yjs` (typed-only here). The app supplies the `Y.Doc`/`Y.Awareness`. */
export async function loadYjs(): Promise<unknown> {
	return import('yjs');
}
