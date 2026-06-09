import { applyMove, type MoveOp } from '../sortable/sortable.ts';
import type {
	CollabBackend,
	CollabPresence,
	CollabProvider,
	PresenceHandler,
	PresenceTransport,
} from './index.ts';

/**
 * Liveblocks adapter shell. Maps neodrag's anchor `MoveOp`s onto a `LiveList<string>` (the key
 * order, via its native `.move()`) and presence onto Liveblocks Presence. As with the Yjs
 * adapter we declare only the API slices we touch so this typechecks without `@liveblocks/client`
 * installed; the real room/list is created by the app and handed in.
 */

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

/** Minimal structural view of the Liveblocks `Room` surface this adapter uses. */
export interface RoomLike<P extends object> {
	subscribe(node: LiveListLike, cb: (node: LiveListLike) => void): () => void;
	updatePresence(patch: Partial<P>): void;
	subscribe(
		event: 'others',
		cb: (others: ReadonlyArray<OtherLike<P>>) => void,
		options?: { isDeep?: boolean },
	): () => void;
	getOthers(): ReadonlyArray<OtherLike<P>>;
}

export interface OtherLike<P> {
	connectionId: number;
	presence: P;
}

export interface SortablePresenceShape {
	'neodrag-sortable'?: CollabPresence | null;
}

/**
 * Translate an anchor `MoveOp` into a `LiveList.move(from, to)`. Liveblocks' move is itself
 * conflict-aware (it rebases concurrent moves server-side), making it the natural target for
 * our anchor ops. We resolve the op against the list's current order to integer indices.
 */
export function applyMoveToLiveList(list: LiveListLike, op: MoveOp): void {
	const keys = list.toArray();
	const from = keys.indexOf(op.itemId);
	if (from === -1) return;
	const next = applyMove(keys, op);
	const to = next.indexOf(op.itemId);
	if (to === from || to === -1) return;
	list.move(from, to);
}

/** Wrap a Liveblocks room's Presence as a neodrag presence transport. */
export class LiveblocksPresenceTransport implements PresenceTransport {
	readonly #room: RoomLike<SortablePresenceShape>;
	readonly #handlers = new Set<PresenceHandler>();
	#off: (() => void) | null = null;

	constructor(room: RoomLike<SortablePresenceShape>) {
		this.#room = room;
	}

	publish(presence: CollabPresence | null): void {
		this.#room.updatePresence({ 'neodrag-sortable': presence });
		this.#ensureSubscribed();
	}

	subscribe(handler: PresenceHandler): () => void {
		this.#handlers.add(handler);
		this.#ensureSubscribed();
		for (const other of this.#room.getOthers()) {
			const p = other.presence['neodrag-sortable'];
			if (p) handler(p.peerId, p);
		}
		return () => this.#handlers.delete(handler);
	}

	#ensureSubscribed(): void {
		if (this.#off) return;
		this.#off = this.#room.subscribe('others', (others) => {
			for (const other of others) {
				const p = other.presence['neodrag-sortable'] ?? null;
				for (const h of this.#handlers) h(p?.peerId ?? String(other.connectionId), p);
			}
		});
	}

	dispose(): void {
		this.#off?.();
		this.#off = null;
		this.#handlers.clear();
	}
}

/**
 * Build a `CollabProvider` (durable op channel) backed by a shared `LiveList<string>`. Local
 * ops apply via `applyMoveToLiveList`; remote `LiveList` changes are diffed back into anchor
 * `MoveOp`s.
 */
export function liveblocksProvider(
	room: RoomLike<SortablePresenceShape>,
	list: LiveListLike,
): CollabProvider {
	let lastOrder = list.toArray();
	const handlers = new Set<(op: MoveOp) => void>();
	let applyingLocal = false;
	let off: (() => void) | null = null;

	const ensureSubscribed = () => {
		if (off) return;
		off = room.subscribe(list, (node) => {
			const next = node.toArray();
			const op = diffToMoveOp(lastOrder, next);
			lastOrder = next;
			if (applyingLocal || !op) return;
			for (const h of handlers) h(op);
		});
	};

	return {
		sendOp(op) {
			applyingLocal = true;
			try {
				applyMoveToLiveList(list, op);
				lastOrder = list.toArray();
			} finally {
				applyingLocal = false;
			}
		},
		onRemoteOp(handler) {
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
	};
}

/** Assemble a full `CollabBackend` from a Liveblocks room + its key `LiveList`. */
export function liveblocksBackend(
	peerId: string,
	room: RoomLike<SortablePresenceShape>,
	list: LiveListLike,
): CollabBackend {
	const provider = liveblocksProvider(room, list);
	return {
		peerId,
		sendOp: (op) => provider.sendOp(op),
		onRemoteOp: (h) => provider.onRemoteOp(h),
		presence: new LiveblocksPresenceTransport(room),
	};
}

/** Recover a single anchor `MoveOp` from a before/after key order (shared with the Yjs adapter). */
export function diffToMoveOp(before: readonly string[], after: readonly string[]): MoveOp | null {
	if (before.length !== after.length) {
		const moved = after.find((k, i) => before[i] !== k);
		if (!moved) return null;
		const at = after.indexOf(moved);
		return { itemId: moved, afterId: at === 0 ? null : (after[at - 1] ?? null) };
	}
	let first = -1;
	for (let i = 0; i < before.length; i++) {
		if (before[i] !== after[i]) {
			first = i;
			break;
		}
	}
	if (first === -1) return null;
	const moved = after[first]!;
	const at = after.indexOf(moved);
	return { itemId: moved, afterId: at === 0 ? null : (after[at - 1] ?? null) };
}

/** Lazily import the real `@liveblocks/client` (typed-only here). */
export async function loadLiveblocks(): Promise<unknown> {
	// @ts-expect-error optional peer dep — not installed in this package.
	return import('@liveblocks/client');
}
