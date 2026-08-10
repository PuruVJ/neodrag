import { applyMove, identityKey } from '@neodrag/core/sortable';
import type { CollabOp, PresenceFrame } from '@neodrag/core/collab';
import { describe, expect, it } from 'vitest';
import {
	applyMoveToLiveList,
	liveblocksBackend,
	LiveblocksPresenceTransport,
	listName,
	valName,
	type LiveListLike,
	type LiveMapLike,
	type LiveObjectLike,
	type LiveStructureFactory,
	type OtherLike,
	type PresenceShape,
	type RoomLike,
} from '../src/index.ts';

/* ────────────────────────────────────────────────────────────────────────────
 * Tiny in-memory fakes of the LiveList / LiveObject / LiveMap / Room surface.
 *
 * Liveblocks has no offline runtime, so we model a two-peer "server": each peer owns its own
 * LiveMap of structures, and a shared `Hub` mirrors every mutation onto the twin peer's structures
 * (by key/index) and fires both peers' deep subscribers — a `replaying` guard stops the echo loop,
 * exactly like the Yjs suite's `'net'` origin guard.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Routes a mutation made on one peer's structures to the twin peer, then notifies both rooms' deep
 * subscribers — modelling the server echo. A `replaying` guard stops the bounce-back, and a depth
 * counter coalesces a synchronous burst (e.g. the three `set`s of one drag commit) into a SINGLE
 * notification fired once the twin is fully consistent, mirroring how `Y.applyUpdate` lands a whole
 * `transact` as one `afterTransaction`.
 */
class Hub {
	rooms: [FakeRoom, FakeRoom] | null = null;
	#replaying = false;
	#depth = 0;
	#dirty = false;

	/** Bracket one public structure mutation; the outermost flushes the coalesced notification. */
	burst(run: () => void): void {
		this.#depth++;
		try {
			run();
		} finally {
			this.#depth--;
			if (this.#depth === 0 && this.#dirty) {
				this.#dirty = false;
				this.notify();
			}
		}
	}

	/** Apply `mutate` to the twin's structure at `name`, guarded so it doesn't bounce back. */
	mirror(origin: FakeMap, name: string, kind: 'list' | 'object', mutate: (twin: FakeLiveList | FakeLiveObject) => void): void {
		this.#dirty = true;
		if (!this.rooms || this.#replaying) return;
		this.#replaying = true;
		try {
			const twinMap = origin === this.rooms[0].root ? this.rooms[1].root : this.rooms[0].root;
			let twin = twinMap.raw.get(name);
			if (!twin) {
				twin = kind === 'list' ? new FakeLiveList([], twinMap) : new FakeLiveObject({}, twinMap);
				twinMap.adopt(name, twin);
			}
			mutate(twin);
		} finally {
			this.#replaying = false;
		}
	}

	/**
	 * A child was *created* on one peer's map → replicate it (with its initial contents, like
	 * `set(key, new LiveList([...]))` would on the server) onto the other peer's map.
	 */
	mirrorCreate(origin: FakeMap, name: string, kind: 'list' | 'object'): void {
		this.#dirty = true;
		if (!this.rooms || this.#replaying) return;
		const twinMap = origin === this.rooms[0].root ? this.rooms[1].root : this.rooms[0].root;
		if (twinMap.raw.has(name)) return;
		const source = origin.raw.get(name);
		this.#replaying = true;
		try {
			const twin =
				kind === 'list'
					? new FakeLiveList((source as FakeLiveList | undefined)?.toArray() ?? [], twinMap)
					: new FakeLiveObject((source as FakeLiveObject | undefined)?.toObject() ?? {}, twinMap);
			twinMap.adopt(name, twin);
		} finally {
			this.#replaying = false;
		}
	}

	notify(): void {
		if (!this.rooms) return;
		for (const r of this.rooms) r.fireDeep();
	}
}

class FakeLiveList implements LiveListLike {
	items: string[];
	#map: FakeMap;
	#name = '';

	constructor(initial: string[], map: FakeMap) {
		this.items = initial.slice();
		this.#map = map;
	}

	/** Set by the owning map when this list is registered under `name`. */
	bind(name: string): void {
		this.#name = name;
	}

	get length(): number {
		return this.items.length;
	}

	push(item: string): void {
		this.#mirror(
			() => this.items.push(item),
			(t) => t.items.push(item),
		);
	}

	insert(item: string, index: number): void {
		this.#mirror(
			() => this.items.splice(index, 0, item),
			(t) => t.items.splice(index, 0, item),
		);
	}

	delete(index: number): void {
		this.#mirror(
			() => this.items.splice(index, 1),
			(t) => t.items.splice(index, 1),
		);
	}

	move(index: number, targetIndex: number): void {
		this.#mirror(
			() => {
				const [moved] = this.items.splice(index, 1);
				this.items.splice(targetIndex, 0, moved!);
			},
			(t) => {
				const [m] = t.items.splice(index, 1);
				t.items.splice(targetIndex, 0, m!);
			},
		);
	}

	get(index: number): string | undefined {
		return this.items[index];
	}

	toArray(): string[] {
		return this.items.slice();
	}

	#mirror(local: () => void, mutate: (twin: FakeLiveList) => void): void {
		this.#map.hub.burst(() => {
			local();
			this.#map.hub.mirror(this.#map, this.#name, 'list', (t) => mutate(t as FakeLiveList));
		});
	}
}

class FakeLiveObject implements LiveObjectLike {
	data: Record<string, unknown>;
	#map: FakeMap;
	#name = '';

	constructor(initial: Record<string, unknown>, map: FakeMap) {
		this.data = { ...initial };
		this.#map = map;
	}

	bind(name: string): void {
		this.#name = name;
	}

	get(key: string): unknown {
		return this.data[key];
	}

	set(key: string, value: unknown): void {
		this.#map.hub.burst(() => {
			this.data[key] = value;
			this.#map.hub.mirror(this.#map, this.#name, 'object', (t) => {
				(t as FakeLiveObject).data[key] = value;
			});
		});
	}

	toObject(): Record<string, unknown> {
		return { ...this.data };
	}
}

class FakeMap implements LiveMapLike {
	raw = new Map<string, FakeLiveList | FakeLiveObject>();
	hub: Hub;

	constructor(hub: Hub) {
		this.hub = hub;
	}

	get(key: string): LiveListLike | LiveObjectLike | undefined {
		return this.raw.get(key);
	}

	set(key: string, value: LiveListLike | LiveObjectLike): void {
		const node = value as FakeLiveList | FakeLiveObject;
		this.hub.burst(() => {
			node.bind(key);
			this.raw.set(key, node);
			this.hub.mirrorCreate(this, key, node instanceof FakeLiveList ? 'list' : 'object');
		});
	}

	/** Register a mirrored twin without re-mirroring it back (used by the Hub). */
	adopt(key: string, node: FakeLiveList | FakeLiveObject): void {
		node.bind(key);
		this.raw.set(key, node);
	}

	has(key: string): boolean {
		return this.raw.has(key);
	}

	keys(): IterableIterator<string> {
		return this.raw.keys();
	}

	entries(): IterableIterator<[string, LiveListLike | LiveObjectLike]> {
		return this.raw.entries();
	}
}

class FakeRoom implements RoomLike<PresenceShape> {
	root: FakeMap;
	#deep = new Set<() => void>();
	#others: OtherLike<PresenceShape>[] = [];
	#othersListeners = new Set<(others: ReadonlyArray<OtherLike<PresenceShape>>) => void>();
	localPresence: PresenceShape = {};

	constructor(hub: Hub) {
		this.root = new FakeMap(hub);
	}

	subscribe(
		nodeOrEvent: LiveMapLike | 'others',
		cb: (arg: never) => void,
		_options?: { isDeep: true },
	): () => void {
		if (nodeOrEvent === 'others') {
			const listener = cb as (others: ReadonlyArray<OtherLike<PresenceShape>>) => void;
			this.#othersListeners.add(listener);
			return () => this.#othersListeners.delete(listener);
		}
		const listener = cb as () => void;
		this.#deep.add(listener);
		return () => this.#deep.delete(listener);
	}

	updatePresence(patch: Partial<PresenceShape>): void {
		this.localPresence = { ...this.localPresence, ...patch };
	}

	getOthers(): ReadonlyArray<OtherLike<PresenceShape>> {
		return this.#others;
	}

	/** Group writes so deep subscribers fire once after the burst (Liveblocks' `room.batch`). */
	batch<T>(fn: () => T): T {
		let out!: T;
		this.root.hub.burst(() => {
			out = fn();
		});
		return out;
	}

	fireDeep(): void {
		for (const cb of this.#deep) cb();
	}

	/** Simulate a remote peer's presence arriving. */
	remotePresence(connectionId: number, frame: PresenceFrame | null): void {
		this.#others = [{ connectionId, presence: { 'neodrag-presence': frame } }];
		for (const l of this.#othersListeners) l(this.#others);
	}
}

/** A pair of rooms wired through one Hub so a write on A's structures propagates to B's. */
function syncedRooms(): [FakeRoom, FakeRoom] {
	const hub = new Hub();
	const a = new FakeRoom(hub);
	const b = new FakeRoom(hub);
	hub.rooms = [a, b];
	return [a, b];
}

/** The factory apps pass — here it allocates fakes bound to a given room's root map. */
const factoryFor = (room: FakeRoom): LiveStructureFactory => ({
	list: (init) => new FakeLiveList(init, room.root),
	object: (init) => new FakeLiveObject(init, room.root),
});

/** Seed a list (under its map key) on a room's root and let it mirror, BEFORE any backend subscribes. */
function seedList(room: FakeRoom, id: string, keys: string[]): void {
	const list = new FakeLiveList(keys, room.root);
	room.root.set(listName(id), list);
}
/** Read a list's order back off a room. */
const order = (room: FakeRoom, id: string): string[] => (room.root.get(listName(id)) as FakeLiveList).toArray();

describe('@neodrag/liveblocks — full op set over a shared root map', () => {
	it('move: a reorder on A converges to B as a move op', () => {
		const [ra, rb] = syncedRooms();
		seedList(ra, 'tasks', ['0', '1', '2']);
		const A = liveblocksBackend('A', ra, ra.root, factoryFor(ra));
		const ops: CollabOp[] = [];
		liveblocksBackend('B', rb, rb.root, factoryFor(rb)).onRemoteOp((op) => ops.push(op));

		A.sendOp({ type: 'move', target: 'tasks', itemId: '0', afterId: '1' });

		// B re-derives an *equivalent* move op from the observed LiveList change (the wire carries
		// state, not the op verbatim), so assert convergence + shape rather than op identity.
		expect(ops).toHaveLength(1);
		expect(ops[0]).toMatchObject({ type: 'move', target: 'tasks' });
		expect(order(rb, 'tasks')).toEqual(['1', '0', '2']);
		expect(order(ra, 'tasks')).toEqual(['1', '0', '2']);
	});

	it('transfer: a cross-list move on A converges to B as a transfer op (no duplicate)', () => {
		const [ra, rb] = syncedRooms();
		seedList(ra, 'todo', ['a0', 'a1']);
		seedList(ra, 'done', ['b0']);
		const A = liveblocksBackend('A', ra, ra.root, factoryFor(ra));
		const ops: CollabOp[] = [];
		liveblocksBackend('B', rb, rb.root, factoryFor(rb)).onRemoteOp((op) => ops.push(op));

		A.sendOp({ type: 'transfer', target: 'done', from: 'todo', itemId: 'a0', afterId: 'b0' });

		expect(ops).toEqual([{ type: 'transfer', target: 'done', from: 'todo', itemId: 'a0', afterId: 'b0' }]);
		expect(order(rb, 'todo')).toEqual(['a1']);
		expect(order(rb, 'done')).toEqual(['b0', 'a0']);
		expect(order(ra, 'done')).toEqual(['b0', 'a0']);
	});

	it('transfer to the front (afterId null)', () => {
		const [ra, rb] = syncedRooms();
		seedList(ra, 'todo', ['a0']);
		seedList(ra, 'done', ['b0', 'b1']);
		const A = liveblocksBackend('A', ra, ra.root, factoryFor(ra));
		const ops: CollabOp[] = [];
		liveblocksBackend('B', rb, rb.root, factoryFor(rb)).onRemoteOp((op) => ops.push(op));

		A.sendOp({ type: 'transfer', target: 'done', from: 'todo', itemId: 'a0', afterId: null });

		expect(ops).toEqual([{ type: 'transfer', target: 'done', from: 'todo', itemId: 'a0', afterId: null }]);
		expect(order(rb, 'done')).toEqual(['a0', 'b0', 'b1']);
	});

	it('drag: a value commit on A converges to B as a LWW drag op', () => {
		const [ra, rb] = syncedRooms();
		const A = liveblocksBackend('A', ra, ra.root, factoryFor(ra));
		const ops: CollabOp[] = [];
		liveblocksBackend('B', rb, rb.root, factoryFor(rb)).onRemoteOp((op) => ops.push(op));

		A.sendOp({ type: 'drag', target: 'box', x: 60, y: 40 });

		expect(ops).toEqual([{ type: 'drag', target: 'box', x: 60, y: 40 }]);
		const o = rb.root.get(valName('box')) as FakeLiveObject;
		expect([o.get('x'), o.get('y')]).toEqual([60, 40]);
	});

	it('resize: a value commit on A converges to B as a LWW resize op', () => {
		const [ra, rb] = syncedRooms();
		const A = liveblocksBackend('A', ra, ra.root, factoryFor(ra));
		const ops: CollabOp[] = [];
		liveblocksBackend('B', rb, rb.root, factoryFor(rb)).onRemoteOp((op) => ops.push(op));

		A.sendOp({ type: 'resize', target: 'panel', width: 200, height: 150 });

		expect(ops).toEqual([{ type: 'resize', target: 'panel', width: 200, height: 150 }]);
	});

	it('rotate: an angle commit on A converges to B as a LWW rotate op', () => {
		const [ra, rb] = syncedRooms();
		const A = liveblocksBackend('A', ra, ra.root, factoryFor(ra));
		const ops: CollabOp[] = [];
		liveblocksBackend('B', rb, rb.root, factoryFor(rb)).onRemoteOp((op) => ops.push(op));

		A.sendOp({ type: 'rotate', target: 'knob', angle: 90 });

		expect(ops).toEqual([{ type: 'rotate', target: 'knob', angle: 90 }]);
	});

	it('resize: a west/north resize carries left/top across the wire', () => {
		const [ra, rb] = syncedRooms();
		const A = liveblocksBackend('A', ra, ra.root, factoryFor(ra));
		const ops: CollabOp[] = [];
		liveblocksBackend('B', rb, rb.root, factoryFor(rb)).onRemoteOp((op) => ops.push(op));

		A.sendOp({ type: 'resize', target: 'panel', width: 140, height: 120, left: -40, top: -30 });

		expect(ops).toEqual([{ type: 'resize', target: 'panel', width: 140, height: 120, left: -40, top: -30 }]);
	});

	it('the latest drag wins (LWW): only the final value is observed after rapid commits', () => {
		const [ra, rb] = syncedRooms();
		const A = liveblocksBackend('A', ra, ra.root, factoryFor(ra));
		const ops: CollabOp[] = [];
		liveblocksBackend('B', rb, rb.root, factoryFor(rb)).onRemoteOp((op) => ops.push(op));

		A.sendOp({ type: 'drag', target: 'box', x: 10, y: 10 });
		A.sendOp({ type: 'drag', target: 'box', x: 99, y: 99 });

		expect(ops.at(-1)).toEqual({ type: 'drag', target: 'box', x: 99, y: 99 });
		const o = rb.root.get(valName('box')) as FakeLiveObject;
		expect([o.get('x'), o.get('y')]).toEqual([99, 99]);
	});

	it("does not echo a peer's own ops back to itself", () => {
		const [ra, rb] = syncedRooms();
		seedList(ra, 'tasks', ['0', '1', '2']);
		const ownOps: CollabOp[] = [];
		const A = liveblocksBackend('A', ra, ra.root, factoryFor(ra));
		A.onRemoteOp((op) => ownOps.push(op));
		liveblocksBackend('B', rb, rb.root, factoryFor(rb)).onRemoteOp(() => {});

		A.sendOp({ type: 'move', target: 'tasks', itemId: '0', afterId: '1' });

		expect(ownOps).toEqual([]); // A's own commit is not surfaced as a remote op
	});

	it('mixed targets: a list + a box + a panel all sync through one root', () => {
		const [ra, rb] = syncedRooms();
		seedList(ra, 'tasks', ['0', '1']);
		const A = liveblocksBackend('A', ra, ra.root, factoryFor(ra));
		const ops: CollabOp[] = [];
		liveblocksBackend('B', rb, rb.root, factoryFor(rb)).onRemoteOp((op) => ops.push(op));

		A.sendOp({ type: 'move', target: 'tasks', itemId: '1', afterId: null });
		A.sendOp({ type: 'drag', target: 'box', x: 5, y: 6 });
		A.sendOp({ type: 'resize', target: 'panel', width: 80, height: 90 });

		expect(ops).toEqual([
			{ type: 'move', target: 'tasks', itemId: '1', afterId: null },
			{ type: 'drag', target: 'box', x: 5, y: 6 },
			{ type: 'resize', target: 'panel', width: 80, height: 90 },
		]);
		expect(order(rb, 'tasks')).toEqual(['1', '0']);
	});
});

describe('@neodrag/liveblocks — pure helpers', () => {
	it('applyMoveToLiveList reorders the list to match applyMove (front)', () => {
		const list = new FakeLiveList(['a', 'b', 'c'], new FakeMap(new Hub()));
		const op = { itemId: 'c', afterId: null };
		applyMoveToLiveList(list, op);
		expect(list.toArray()).toEqual(applyMove(['a', 'b', 'c'], op, identityKey));
		expect(list.toArray()).toEqual(['c', 'a', 'b']);
	});

	it('applyMoveToLiveList reorders the list to match applyMove (middle)', () => {
		const list = new FakeLiveList(['a', 'b', 'c', 'd'], new FakeMap(new Hub()));
		const op = { itemId: 'a', afterId: 'c' };
		applyMoveToLiveList(list, op);
		expect(list.toArray()).toEqual(applyMove(['a', 'b', 'c', 'd'], op, identityKey));
		expect(list.toArray()).toEqual(['b', 'c', 'a', 'd']);
	});

	it('applyMoveToLiveList is a no-op when the item is absent', () => {
		const list = new FakeLiveList(['a', 'b', 'c'], new FakeMap(new Hub()));
		applyMoveToLiveList(list, { itemId: 'z', afterId: null });
		expect(list.toArray()).toEqual(['a', 'b', 'c']);
	});

});

describe('@neodrag/liveblocks — presence', () => {
	it('surfaces remote presence frames keyed by their peerId', () => {
		const room = new FakeRoom(new Hub());
		const seen: Array<{ peerId: string; type: string | null }> = [];
		new LiveblocksPresenceTransport(room).subscribe((peerId, frame) => seen.push({ peerId, type: frame?.type ?? null }));
		room.remotePresence(7, { type: 'drag', target: 'box', x: 1, y: 2, peerId: 'peer-2' });
		expect(seen).toEqual([{ peerId: 'peer-2', type: 'drag' }]);
	});

	it('round-trips a presence frame through a backend and stamps the publisher id', () => {
		const room = new FakeRoom(new Hub());
		const backend = liveblocksBackend('peer-1', room, room.root, factoryFor(room));
		const seen: Array<{ peerId: string; frame: unknown }> = [];
		backend.presence.subscribe((peerId, frame) => seen.push({ peerId, frame }));
		room.remotePresence(7, { type: 'drag', target: 'box', x: 3, y: 4, peerId: 'peer-2' });
		expect(seen.at(-1)).toEqual({ peerId: 'peer-2', frame: { type: 'drag', target: 'box', x: 3, y: 4, peerId: 'peer-2' } });
	});
});
