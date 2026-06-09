import { applyMove, type MoveOp } from '../sortable/sortable.ts';
import type {
	CollabBackend,
	CollabPresence,
	CollabProvider,
	PresenceHandler,
	PresenceTransport,
} from './index.ts';

/**
 * Yjs adapter shell. Maps neodrag's anchor `MoveOp`s onto a `Y.Array<string>` (the key order)
 * and presence onto `Y.Awareness`. We declare only the slices of the Yjs API we touch so this
 * module typechecks without the peer dep installed; the real `yjs` is imported lazily by the
 * caller and handed in. Bring your own `Y.Array` (already shared via a provider) + awareness.
 */

/** Minimal structural view of the Yjs `Y.Array` surface this adapter uses. */
export interface YArrayLike<T> {
	length: number;
	get(index: number): T;
	insert(index: number, content: T[]): void;
	delete(index: number, length?: number): void;
	toArray(): T[];
	observe(fn: (event: YArrayEventLike, txn: YTransactionLike) => void): void;
	unobserve(fn: (event: YArrayEventLike, txn: YTransactionLike) => void): void;
	doc: YDocLike | null;
}

export interface YArrayEventLike {
	// Yjs delta is rich; we re-read the array wholesale, so we only need the marker.
	readonly changes: unknown;
}

export interface YTransactionLike {
	readonly local: boolean;
	readonly origin: unknown;
}

export interface YDocLike {
	transact(fn: () => void, origin?: unknown): void;
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
const PRESENCE_FIELD = 'neodrag-sortable';

/**
 * Apply an anchor `MoveOp` to a `Y.Array<string>` of keys as a delete+insert pair, inside a
 * single transaction tagged with our origin (so we can ignore the echo in `observe`). This is
 * the CRDT-correct translation: anchors survive concurrent edits, and Y.Array merges the
 * delete/insert deterministically across peers.
 */
export function applyMoveToYArray(arr: YArrayLike<string>, op: MoveOp): void {
	const run = () => {
		const keys = arr.toArray();
		const next = applyMove(keys, op);
		// Replace wholesale — simplest deterministic mapping; Y.Array diffs internally.
		if (arr.length > 0) arr.delete(0, arr.length);
		arr.insert(0, next);
	};
	if (arr.doc) arr.doc.transact(run, ORIGIN);
	else run();
}

/** Wrap a `Y.Awareness` as a neodrag presence transport. */
export class YjsPresenceTransport implements PresenceTransport {
	readonly #awareness: YAwarenessLike;
	readonly #handlers = new Set<PresenceHandler>();
	#onChange: ((c: AwarenessChange, origin: unknown) => void) | null = null;

	constructor(awareness: YAwarenessLike) {
		this.#awareness = awareness;
	}

	publish(presence: CollabPresence | null): void {
		this.#awareness.setLocalStateField(PRESENCE_FIELD, presence);
		this.#ensureSubscribed();
	}

	subscribe(handler: PresenceHandler): () => void {
		this.#handlers.add(handler);
		this.#ensureSubscribed();
		// Replay current remote states so late subscribers see in-flight ghosts.
		for (const [client, state] of this.#awareness.getStates()) {
			if (client === this.#awareness.clientID) continue;
			const p = state[PRESENCE_FIELD] as CollabPresence | null | undefined;
			if (p) handler(p.peerId, p);
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
				const p = (state?.[PRESENCE_FIELD] as CollabPresence | null | undefined) ?? null;
				for (const h of this.#handlers) h(p?.peerId ?? String(client), p);
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

/**
 * Build a `CollabProvider` (durable op channel) backed by a shared `Y.Array<string>`. Remote
 * Y.Array mutations are surfaced as anchor `MoveOp`s by diffing the previous order. Local ops
 * apply via `applyMoveToYArray` under our origin tag and are not echoed back.
 */
export function yjsProvider(arr: YArrayLike<string>): CollabProvider {
	let lastOrder = arr.toArray();
	const handlers = new Set<(op: MoveOp) => void>();
	let observer: ((e: YArrayEventLike, t: YTransactionLike) => void) | null = null;

	const ensureObserver = () => {
		if (observer) return;
		observer = (_event, txn) => {
			if (txn.origin === ORIGIN) {
				lastOrder = arr.toArray();
				return; // our own echo
			}
			const next = arr.toArray();
			const op = diffToMoveOp(lastOrder, next);
			lastOrder = next;
			if (op) for (const h of handlers) h(op);
		};
		arr.observe(observer);
	};

	return {
		sendOp(op) {
			applyMoveToYArray(arr, op);
			lastOrder = arr.toArray();
		},
		onRemoteOp(handler) {
			handlers.add(handler);
			ensureObserver();
			return () => {
				handlers.delete(handler);
				if (handlers.size === 0 && observer) {
					arr.unobserve(observer);
					observer = null;
				}
			};
		},
	};
}

/** Assemble a full `CollabBackend` from a shared Y.Array + Y.Awareness. */
export function yjsBackend(
	peerId: string,
	arr: YArrayLike<string>,
	awareness: YAwarenessLike,
): CollabBackend {
	const provider = yjsProvider(arr);
	return {
		peerId,
		sendOp: (op) => provider.sendOp(op),
		onRemoteOp: (h) => provider.onRemoteOp(h),
		presence: new YjsPresenceTransport(awareness),
	};
}

/**
 * Recover a single anchor `MoveOp` from a before/after key order. One item changes position;
 * we find the moved key and its new predecessor. Returns null when the order is unchanged.
 */
export function diffToMoveOp(before: readonly string[], after: readonly string[]): MoveOp | null {
	if (before.length !== after.length) {
		// Fall back to "first positional difference" — find the displaced item.
		const moved = after.find((k, i) => before[i] !== k);
		if (!moved) return null;
		const at = after.indexOf(moved);
		return { itemId: moved, afterId: at === 0 ? null : (after[at - 1] ?? null) };
	}
	let first = -1;
	let last = -1;
	for (let i = 0; i < before.length; i++) {
		if (before[i] !== after[i]) {
			if (first === -1) first = i;
			last = i;
		}
	}
	if (first === -1) return null;
	// The moved item is the one whose neighbourhood changed; derive from the resulting order.
	const beforeSet = before.slice(first, last + 1);
	const afterSeg = after.slice(first, last + 1);
	// Moved item: present in both but at the segment boundary that shifted everyone else.
	const moved =
		afterSeg.find((k) => beforeSet.indexOf(k) !== afterSeg.indexOf(k) && k === after[first]) ??
		after[first];
	const at = after.indexOf(moved!);
	return { itemId: moved!, afterId: at === 0 ? null : (after[at - 1] ?? null) };
}

/** Lazily import the real `yjs` (typed-only here). The app supplies `Y.Array`/`Y.Awareness`. */
export async function loadYjs(): Promise<unknown> {
	// @ts-expect-error optional peer dep — not installed in this package.
	return import('yjs');
}
