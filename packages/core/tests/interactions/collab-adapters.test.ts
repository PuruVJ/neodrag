import { describe, expect, it } from 'vitest';
import type { MoveOp } from '../../src/sortable/sortable.ts';
import {
	applyMoveToYArray,
	diffToMoveOp as yDiff,
	YjsPresenceTransport,
	yjsProvider,
	yjsBackend,
	type YArrayEventLike,
	type YArrayLike,
	type YAwarenessLike,
	type YTransactionLike,
	type AwarenessChange,
} from '../../src/collab/yjs.ts';
import {
	applyMoveToLiveList,
	liveblocksBackend,
	liveblocksProvider,
	LiveblocksPresenceTransport,
	type LiveListLike,
	type OtherLike,
	type RoomLike,
	type SortablePresenceShape,
} from '../../src/collab/liveblocks.ts';
import type { CollabPresence } from '../../src/collab/index.ts';

// ───────────────────────── Yjs fakes ─────────────────────────

const ORIGIN_HOLDER: { value: unknown } = { value: null };

class FakeYArray implements YArrayLike<string> {
	#data: string[];
	#observers = new Set<(e: YArrayEventLike, t: YTransactionLike) => void>();
	doc: { transact(fn: () => void, origin?: unknown): void } | null;

	constructor(initial: string[]) {
		this.#data = initial.slice();
		this.doc = {
			transact: (fn, origin) => {
				ORIGIN_HOLDER.value = origin ?? null;
				fn();
				this.#emit({ local: true, origin: origin ?? null });
				ORIGIN_HOLDER.value = null;
			},
		};
	}
	get length() {
		return this.#data.length;
	}
	get(i: number) {
		return this.#data[i]!;
	}
	insert(i: number, content: string[]) {
		this.#data.splice(i, 0, ...content);
	}
	delete(i: number, len = 1) {
		this.#data.splice(i, len);
	}
	toArray() {
		return this.#data.slice();
	}
	observe(fn: (e: YArrayEventLike, t: YTransactionLike) => void) {
		this.#observers.add(fn);
	}
	unobserve(fn: (e: YArrayEventLike, t: YTransactionLike) => void) {
		this.#observers.delete(fn);
	}
	/** Simulate a remote peer mutating the array (origin not ours). */
	remoteSet(next: string[]) {
		this.#data = next.slice();
		this.#emit({ local: false, origin: 'remote' });
	}
	#emit(t: YTransactionLike) {
		for (const o of this.#observers) o({ changes: null }, t);
	}
}

class FakeAwareness implements YAwarenessLike {
	readonly clientID: number;
	#states = new Map<number, Record<string, unknown>>();
	#handlers = new Set<(c: AwarenessChange, o: unknown) => void>();
	#peers = new Set<FakeAwareness>();

	constructor(clientID: number) {
		this.clientID = clientID;
		this.#states.set(clientID, {});
	}
	link(other: FakeAwareness) {
		this.#peers.add(other);
		other.#peers.add(this);
	}
	setLocalStateField(field: string, value: unknown) {
		const st = { ...(this.#states.get(this.clientID) ?? {}), [field]: value };
		this.#states.set(this.clientID, st);
		for (const peer of this.#peers) peer.#receive(this.clientID, st);
	}
	getStates() {
		return this.#states;
	}
	on(_e: 'change', fn: (c: AwarenessChange, o: unknown) => void) {
		this.#handlers.add(fn);
	}
	off(_e: 'change', fn: (c: AwarenessChange, o: unknown) => void) {
		this.#handlers.delete(fn);
	}
	#receive(clientID: number, state: Record<string, unknown>) {
		const known = this.#states.has(clientID);
		this.#states.set(clientID, state);
		const change: AwarenessChange = known
			? { added: [], updated: [clientID], removed: [] }
			: { added: [clientID], updated: [], removed: [] };
		for (const h of this.#handlers) h(change, 'remote');
	}
}

const presence = (peerId: string, idx: number): CollabPresence => ({
	peerId,
	dragKey: 'x',
	fromIndex: 0,
	toIndex: idx,
	insertIndex: idx,
	pointer: { x: 1, y: 2 },
});

describe('Yjs adapter shell', () => {
	it('maps an anchor MoveOp onto a Y.Array as delete+insert', () => {
		const arr = new FakeYArray(['a', 'b', 'c']);
		applyMoveToYArray(arr, { itemId: 'a', afterId: 'c' });
		expect(arr.toArray()).toEqual(['b', 'c', 'a']);
	});

	it('provider applies local ops and ignores its own echo', () => {
		const arr = new FakeYArray(['a', 'b', 'c']);
		const provider = yjsProvider(arr);
		const received: MoveOp[] = [];
		provider.onRemoteOp((op) => received.push(op));

		provider.sendOp({ itemId: 'a', afterId: 'c' }); // local → echoed back, must be ignored
		expect(arr.toArray()).toEqual(['b', 'c', 'a']);
		expect(received).toHaveLength(0);

		// a genuine remote mutation surfaces as a MoveOp
		arr.remoteSet(['c', 'b', 'a']); // moved 'c' to front
		expect(received).toEqual([{ itemId: 'c', afterId: null }]);
	});

	it('presence transport round-trips through Y.Awareness', () => {
		const awA = new FakeAwareness(1);
		const awB = new FakeAwareness(2);
		awA.link(awB);
		const ta = new YjsPresenceTransport(awA);
		const tb = new YjsPresenceTransport(awB);
		const seen: Array<CollabPresence | null> = [];
		tb.subscribe((_id, p) => seen.push(p));

		ta.publish(presence('A', 3));
		expect(seen).toHaveLength(1);
		expect(seen[0]).toMatchObject({ peerId: 'A', insertIndex: 3 });

		ta.publish(null);
		expect(seen[seen.length - 1]).toBe(null);

		ta.dispose();
		tb.dispose();
	});

	it('yjsBackend composes provider + presence', () => {
		const arr = new FakeYArray(['a', 'b']);
		const aw = new FakeAwareness(1);
		const backend = yjsBackend('peer', arr, aw);
		expect(backend.peerId).toBe('peer');
		expect(typeof backend.sendOp).toBe('function');
		expect(backend.presence).toBeInstanceOf(YjsPresenceTransport);
	});

	it('diffToMoveOp recovers a move from a before/after order', () => {
		expect(yDiff(['a', 'b', 'c'], ['c', 'a', 'b'])).toEqual({ itemId: 'c', afterId: null });
		expect(yDiff(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(null);
	});
});

// ───────────────────────── Liveblocks fakes ─────────────────────────

class FakeLiveList implements LiveListLike {
	#data: string[];
	#subs = new Set<(node: LiveListLike) => void>();
	constructor(initial: string[]) {
		this.#data = initial.slice();
	}
	get length() {
		return this.#data.length;
	}
	push(item: string) {
		this.#data.push(item);
		this.#notify();
	}
	insert(item: string, index: number) {
		this.#data.splice(index, 0, item);
		this.#notify();
	}
	delete(index: number) {
		this.#data.splice(index, 1);
		this.#notify();
	}
	move(index: number, target: number) {
		const [item] = this.#data.splice(index, 1);
		this.#data.splice(target, 0, item!);
		this.#notify();
	}
	get(index: number) {
		return this.#data[index];
	}
	toArray() {
		return this.#data.slice();
	}
	_sub(cb: (node: LiveListLike) => void) {
		this.#subs.add(cb);
		return () => this.#subs.delete(cb);
	}
	#notify() {
		for (const s of this.#subs) s(this);
	}
}

class FakeRoom implements RoomLike<SortablePresenceShape> {
	#presence: SortablePresenceShape = {};
	#others = new Map<number, OtherLike<SortablePresenceShape>>();
	#otherSubs = new Set<(o: ReadonlyArray<OtherLike<SortablePresenceShape>>) => void>();
	#peers = new Set<FakeRoom>();
	readonly id: number;
	constructor(id: number) {
		this.id = id;
	}
	link(other: FakeRoom) {
		this.#peers.add(other);
		other.#peers.add(this);
	}
	// LiveList overload
	subscribe(node: LiveListLike, cb: (node: LiveListLike) => void): () => void;
	// 'others' overload
	subscribe(
		event: 'others',
		cb: (others: ReadonlyArray<OtherLike<SortablePresenceShape>>) => void,
	): () => void;
	subscribe(a: unknown, b: unknown): () => void {
		if (a === 'others') {
			const cb = b as (o: ReadonlyArray<OtherLike<SortablePresenceShape>>) => void;
			this.#otherSubs.add(cb);
			return () => this.#otherSubs.delete(cb);
		}
		return (a as FakeLiveList)._sub(b as (node: LiveListLike) => void);
	}
	updatePresence(patch: Partial<SortablePresenceShape>) {
		this.#presence = { ...this.#presence, ...patch };
		for (const peer of this.#peers) peer.#receiveOther(this.id, this.#presence);
	}
	subscribeUpdatePresence() {}
	getOthers() {
		return [...this.#others.values()];
	}
	#receiveOther(connectionId: number, presence: SortablePresenceShape) {
		this.#others.set(connectionId, { connectionId, presence });
		for (const s of this.#otherSubs) s([...this.#others.values()]);
	}
}

describe('Liveblocks adapter shell', () => {
	it('maps an anchor MoveOp onto LiveList.move', () => {
		const list = new FakeLiveList(['a', 'b', 'c']);
		applyMoveToLiveList(list, { itemId: 'a', afterId: 'c' });
		expect(list.toArray()).toEqual(['b', 'c', 'a']);
	});

	it('provider applies local ops without echoing, surfaces remote moves', () => {
		const room = new FakeRoom(1);
		const list = new FakeLiveList(['a', 'b', 'c']);
		const provider = liveblocksProvider(room, list);
		const received: MoveOp[] = [];
		provider.onRemoteOp((op) => received.push(op));

		provider.sendOp({ itemId: 'a', afterId: 'c' });
		expect(list.toArray()).toEqual(['b', 'c', 'a']);
		expect(received).toHaveLength(0); // own move not echoed

		// genuine remote move
		list.move(0, 2); // [b,c,a] → [c,a,b]
		expect(list.toArray()).toEqual(['c', 'a', 'b']);
		expect(received).toEqual([{ itemId: 'c', afterId: null }]);
	});

	it('presence transport round-trips through Liveblocks Presence', () => {
		const roomA = new FakeRoom(1);
		const roomB = new FakeRoom(2);
		roomA.link(roomB);
		const ta = new LiveblocksPresenceTransport(roomA);
		const tb = new LiveblocksPresenceTransport(roomB);
		const seen: Array<CollabPresence | null> = [];
		tb.subscribe((_id, p) => seen.push(p));

		ta.publish(presence('A', 2));
		expect(seen[seen.length - 1]).toMatchObject({ peerId: 'A', insertIndex: 2 });

		ta.publish(null);
		expect(seen[seen.length - 1]).toBe(null);

		ta.dispose();
		tb.dispose();
	});

	it('liveblocksBackend composes provider + presence', () => {
		const room = new FakeRoom(1);
		const list = new FakeLiveList(['a']);
		const backend = liveblocksBackend('peer', room, list);
		expect(backend.peerId).toBe('peer');
		expect(backend.presence).toBeInstanceOf(LiveblocksPresenceTransport);
	});
});
