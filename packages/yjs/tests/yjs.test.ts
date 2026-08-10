import type { CollabOp } from '@neodrag/core/collab';
import * as Y from 'yjs';
import { describe, expect, it } from 'vitest';
import {
	applyMoveToYArray,
	diffToMoves,
	listName,
	valName,
	YjsPresenceTransport,
	yjsBackend,
	type YAwarenessLike,
	type YDocLike,
} from '../src/index.ts';

/** Two Y.Docs wired so updates round-trip (a `'net'` origin guard stops the echo loop). */
function syncedDocs(): [Y.Doc, Y.Doc] {
	const a = new Y.Doc();
	const b = new Y.Doc();
	a.on('update', (u: Uint8Array, origin: unknown) => {
		if (origin !== 'net') Y.applyUpdate(b, u, 'net');
	});
	b.on('update', (u: Uint8Array, origin: unknown) => {
		if (origin !== 'net') Y.applyUpdate(a, u, 'net');
	});
	return [a, b];
}

const doc = (d: Y.Doc) => d as unknown as YDocLike;

/** A no-op awareness — presence isn't exercised by the op tests. */
function nullAwareness(clientID = 1): YAwarenessLike {
	return { setLocalStateField() {}, getStates: () => new Map(), on() {}, off() {}, clientID };
}

/** Seed a list (under its share key) on a doc and let it sync, BEFORE any backend subscribes. */
function seedList(a: Y.Doc, id: string, keys: string[]) {
	a.getArray<string>(listName(id)).insert(0, keys);
}
/** Read a synced list's order back off a doc. */
const order = (d: Y.Doc, id: string) => d.getArray<string>(listName(id)).toArray();

describe('@neodrag/yjs — full op set over a shared doc', () => {
	it('move: a reorder on A converges to B as a move op', () => {
		const [da, db] = syncedDocs();
		seedList(da, 'tasks', ['0', '1', '2']);
		const A = yjsBackend('A', doc(da), nullAwareness(1));
		const ops: CollabOp[] = [];
		yjsBackend('B', doc(db), nullAwareness(2)).onRemoteOp((op) => ops.push(op));

		A.sendOp({ type: 'move', target: 'tasks', itemId: '0', afterId: '1' });

		// B re-derives an *equivalent* move op from the observed Y.Array change (CRDT-native: the wire
		// carries state, not the op verbatim), so assert convergence + shape rather than op identity.
		expect(ops).toHaveLength(1);
		expect(ops[0]).toMatchObject({ type: 'move', target: 'tasks' });
		expect(order(db, 'tasks')).toEqual(['1', '0', '2']);
		expect(order(da, 'tasks')).toEqual(['1', '0', '2']);
	});

	it('transfer: a cross-list move on A converges to B as a transfer op (no duplicate)', () => {
		const [da, db] = syncedDocs();
		seedList(da, 'todo', ['a0', 'a1']);
		seedList(da, 'done', ['b0']);
		const A = yjsBackend('A', doc(da), nullAwareness(1));
		const ops: CollabOp[] = [];
		yjsBackend('B', doc(db), nullAwareness(2)).onRemoteOp((op) => ops.push(op));

		A.sendOp({ type: 'transfer', target: 'done', from: 'todo', itemId: 'a0', afterId: 'b0' });

		expect(ops).toEqual([{ type: 'transfer', target: 'done', from: 'todo', itemId: 'a0', afterId: 'b0' }]);
		expect(order(db, 'todo')).toEqual(['a1']);
		expect(order(db, 'done')).toEqual(['b0', 'a0']);
	});

	it('transfer to the front (afterId null)', () => {
		const [da, db] = syncedDocs();
		seedList(da, 'todo', ['a0']);
		seedList(da, 'done', ['b0', 'b1']);
		const A = yjsBackend('A', doc(da), nullAwareness(1));
		const ops: CollabOp[] = [];
		yjsBackend('B', doc(db), nullAwareness(2)).onRemoteOp((op) => ops.push(op));

		A.sendOp({ type: 'transfer', target: 'done', from: 'todo', itemId: 'a0', afterId: null });

		expect(ops).toEqual([{ type: 'transfer', target: 'done', from: 'todo', itemId: 'a0', afterId: null }]);
		expect(order(db, 'done')).toEqual(['a0', 'b0', 'b1']);
	});

	it('drag: a value commit on A converges to B as a LWW drag op', () => {
		const [da, db] = syncedDocs();
		const A = yjsBackend('A', doc(da), nullAwareness(1));
		const ops: CollabOp[] = [];
		yjsBackend('B', doc(db), nullAwareness(2)).onRemoteOp((op) => ops.push(op));

		A.sendOp({ type: 'drag', target: 'box', x: 60, y: 40 });

		expect(ops).toEqual([{ type: 'drag', target: 'box', x: 60, y: 40 }]);
		const m = db.getMap(valName('box'));
		expect([m.get('x'), m.get('y')]).toEqual([60, 40]);
	});

	it('resize: a value commit on A converges to B as a LWW resize op', () => {
		const [da, db] = syncedDocs();
		const A = yjsBackend('A', doc(da), nullAwareness(1));
		const ops: CollabOp[] = [];
		yjsBackend('B', doc(db), nullAwareness(2)).onRemoteOp((op) => ops.push(op));

		A.sendOp({ type: 'resize', target: 'panel', width: 200, height: 150 });

		expect(ops).toEqual([{ type: 'resize', target: 'panel', width: 200, height: 150 }]);
	});

	it('rotate: an angle commit on A converges to B as a LWW rotate op', () => {
		const [da, db] = syncedDocs();
		const A = yjsBackend('A', doc(da), nullAwareness(1));
		const ops: CollabOp[] = [];
		yjsBackend('B', doc(db), nullAwareness(2)).onRemoteOp((op) => ops.push(op));

		A.sendOp({ type: 'rotate', target: 'knob', angle: 90 });

		expect(ops).toEqual([{ type: 'rotate', target: 'knob', angle: 90 }]);
	});

	it('resize: a west/north resize carries left/top across the wire', () => {
		const [da, db] = syncedDocs();
		const A = yjsBackend('A', doc(da), nullAwareness(1));
		const ops: CollabOp[] = [];
		yjsBackend('B', doc(db), nullAwareness(2)).onRemoteOp((op) => ops.push(op));

		A.sendOp({ type: 'resize', target: 'panel', width: 140, height: 120, left: -40, top: -30 });

		expect(ops).toEqual([{ type: 'resize', target: 'panel', width: 140, height: 120, left: -40, top: -30 }]);
	});

	it('the latest drag wins (LWW): only the final value is observed after rapid commits', () => {
		const [da, db] = syncedDocs();
		const A = yjsBackend('A', doc(da), nullAwareness(1));
		const ops: CollabOp[] = [];
		yjsBackend('B', doc(db), nullAwareness(2)).onRemoteOp((op) => ops.push(op));

		A.sendOp({ type: 'drag', target: 'box', x: 10, y: 10 });
		A.sendOp({ type: 'drag', target: 'box', x: 99, y: 99 });

		expect(ops.at(-1)).toEqual({ type: 'drag', target: 'box', x: 99, y: 99 });
		const m = db.getMap(valName('box'));
		expect([m.get('x'), m.get('y')]).toEqual([99, 99]);
	});

	it("does not echo a peer's own ops back to itself", () => {
		const [da, db] = syncedDocs();
		seedList(da, 'tasks', ['0', '1', '2']);
		const ownOps: CollabOp[] = [];
		const A = yjsBackend('A', doc(da), nullAwareness(1));
		A.onRemoteOp((op) => ownOps.push(op));
		yjsBackend('B', doc(db), nullAwareness(2)).onRemoteOp(() => {});

		A.sendOp({ type: 'move', target: 'tasks', itemId: '0', afterId: '1' });

		expect(ownOps).toEqual([]); // A's own commit is not surfaced as a remote op
	});

	it('mixed targets: a list + a box + a panel all sync through one doc', () => {
		const [da, db] = syncedDocs();
		seedList(da, 'tasks', ['0', '1']);
		const A = yjsBackend('A', doc(da), nullAwareness(1));
		const ops: CollabOp[] = [];
		yjsBackend('B', doc(db), nullAwareness(2)).onRemoteOp((op) => ops.push(op));

		A.sendOp({ type: 'move', target: 'tasks', itemId: '1', afterId: null });
		A.sendOp({ type: 'drag', target: 'box', x: 5, y: 6 });
		A.sendOp({ type: 'resize', target: 'panel', width: 80, height: 90 });

		expect(ops).toEqual([
			{ type: 'move', target: 'tasks', itemId: '1', afterId: null },
			{ type: 'drag', target: 'box', x: 5, y: 6 },
			{ type: 'resize', target: 'panel', width: 80, height: 90 },
		]);
	});
});

describe('@neodrag/yjs — pure helpers', () => {
	it('applyMoveToYArray reorders a real Y.Array', () => {
		const d = new Y.Doc();
		const arr = d.getArray<string>('l');
		arr.insert(0, ['a', 'b', 'c', 'd']);
		applyMoveToYArray(arr, { itemId: 'a', afterId: 'c' });
		expect(arr.toArray()).toEqual(['b', 'c', 'a', 'd']);
	});


	it('diffToMoves reconstructs ANY permutation as a converging move sequence', () => {
		// Replay the moves the way the Room's applyExternal does (remove by key, insert after anchor).
		const replay = (before: string[], moves: { itemId: string; afterId: string | null }[]) => {
			let cur = before.slice();
			for (const m of moves) {
				cur = cur.filter((k) => k !== m.itemId);
				const at = m.afterId === null ? 0 : cur.indexOf(m.afterId) + 1;
				cur.splice(at, 0, m.itemId);
			}
			return cur;
		};
		const cases: [string[], string[]][] = [
			[['a', 'b', 'c', 'd'], ['c', 'd', 'a', 'b']], // block move
			[['a', 'b', 'c', 'd'], ['d', 'c', 'b', 'a']], // reverse
			[['a', 'b', 'c'], ['c', 'b', 'a']],
			[['a', 'b', 'c', 'd'], ['a', 'c', 'b', 'd']], // single swap → one move
			[['a', 'b', 'c', 'd', 'e'], ['e', 'a', 'd', 'b', 'c']],
		];
		for (const [before, after] of cases) {
			expect(replay(before, diffToMoves(before, after))).toEqual(after);
		}
		expect(diffToMoves(['a', 'b', 'c'], ['a', 'b', 'c'])).toEqual([]); // no-op
		expect(diffToMoves(['a', 'b', 'c', 'd'], ['a', 'c', 'b', 'd'])).toHaveLength(1); // single move stays single
	});
});

describe('@neodrag/yjs — presence', () => {
	/** A pair of fake awarenesses that forward local-state changes to each other. */
	function awarenessPair(): [YAwarenessLike, YAwarenessLike] {
		const make = (id: number): YAwarenessLike & { _peer?: AwForward; _state: Record<string, unknown> } => {
			const listeners = new Set<(c: { added: number[]; updated: number[]; removed: number[] }, o: unknown) => void>();
			const self = {
				clientID: id,
				_state: {} as Record<string, unknown>,
				setLocalStateField(field: string, value: unknown) {
					self._state[field] = value;
					self._peer?.(id, { ...self._state });
				},
				getStates: () => remoteStates,
				on: (_e: 'change', fn: (c: { added: number[]; updated: number[]; removed: number[] }, o: unknown) => void) =>
					listeners.add(fn),
				off: (_e: 'change', fn: (c: { added: number[]; updated: number[]; removed: number[] }, o: unknown) => void) =>
					listeners.delete(fn),
				_notify: (client: number, state: Record<string, unknown>) => {
					remoteStates.set(client, state);
					for (const l of listeners) l({ added: [], updated: [client], removed: [] }, null);
				},
				_peer: undefined as AwForward,
			};
			const remoteStates = new Map<number, Record<string, unknown>>();
			return self;
		};
		type AwForward = ((client: number, state: Record<string, unknown>) => void) | undefined;
		const a = make(1);
		const b = make(2);
		a._peer = (c, s) => b._notify(c, s);
		b._peer = (c, s) => a._notify(c, s);
		return [a, b];
	}

	it('round-trips a presence frame between peers and stamps the publisher id', () => {
		const [awA, awB] = awarenessPair();
		new YjsPresenceTransport(awA).publish({
			type: 'drag',
			peerId: 'A',
			target: 'box',
			x: 1,
			y: 2,
		});
		const got: Array<{ peerId: string; frame: unknown }> = [];
		new YjsPresenceTransport(awB).subscribe((peerId, frame) => got.push({ peerId, frame }));
		new YjsPresenceTransport(awA).publish({ type: 'drag', peerId: 'A', target: 'box', x: 3, y: 4 });
		expect(got.at(-1)).toEqual({ peerId: 'A', frame: { type: 'drag', peerId: 'A', target: 'box', x: 3, y: 4 } });
	});
});
