/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryBackend, MemoryCollab, Room } from '../../src/collab/index.ts';
import { Interactions } from '../../src/engine.ts';
import { programmaticToInput } from '../../src/interaction-input.ts';
import { Sortable, type MoveOp } from '../../src/sortable/sortable.ts';

function input(target: HTMLElement, phase: 'start' | 'move' | 'end', x: number, y: number) {
	return programmaticToInput({ phase, clientX: x, clientY: y, pointerId: 1, target });
}

function makeList() {
	const container = document.createElement('ul');
	const nodes: HTMLElement[] = [];
	for (let i = 0; i < 3; i++) {
		const li = document.createElement('li');
		li.setAttribute('data-neodrag-sortable-key', String(i));
		container.appendChild(li);
		li.getBoundingClientRect = () =>
			({
				left: 0,
				top: i * 50,
				right: 100,
				bottom: i * 50 + 50,
				width: 100,
				height: 50,
				x: 0,
				y: i * 50,
				toJSON() {},
			}) as DOMRect;
		nodes.push(li);
	}
	document.body.appendChild(container);
	return { container, nodes };
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('@neodrag/collab — two-peer convergence', () => {
	it('a reorder on peer A reconciles to peer B via anchor ops', () => {
		const itemsA = [{ id: '0' }, { id: '1' }, { id: '2' }];
		const itemsB = [{ id: '0' }, { id: '1' }, { id: '2' }];
		let resultB: { next: { id: string }[]; op: MoveOp } | null = null;

		const dndA = new Interactions({ defaultSensors: false });
		const sortA = new Sortable();
		dndA.use(sortA);
		const a = makeList();
		const handleA = sortA.bind(a.container, { items: itemsA, id: 'list', onReorder: () => {} });

		const dndB = new Interactions({ defaultSensors: false });
		const sortB = new Sortable();
		dndB.use(sortB);
		const b = makeList();
		const handleB = sortB.bind(b.container, {
			items: itemsB,
			id: 'list',
			onReorder: (next, op) => (resultB = { next, op }),
		});

		const provA = new MemoryCollab();
		const provB = new MemoryCollab();
		provA.connect(provB);
		Room.bind(handleA, provA);
		Room.bind(handleB, provB);

		// reorder on A: drag item 0 past item 1's midpoint
		dndA.host.onInteractionStart(input(a.nodes[0], 'start', 10, 25));
		dndA.host.onInteractionMove(input(a.nodes[0], 'move', 10, 80));
		dndA.host.onInteractionEnd(input(a.nodes[0], 'end', 10, 80));

		// B received the op and reconciled
		expect(resultB).not.toBeNull();
		expect(resultB!.op).toEqual({ itemId: '0', afterId: '1' });
		expect(resultB!.next.map((x) => x.id)).toEqual(['1', '0', '2']);
	});
});

/** A sortable peer joined to its own Room over `backend`, exposing the join disposer + what its
 *  `onReorder` received, so a test can watch convergence (or the lack of it after a dispose). */
function sortablePeer(backend: MemoryBackend, id = 'list') {
	const items = [{ id: '0' }, { id: '1' }, { id: '2' }];
	const received: { next: { id: string }[]; op: MoveOp }[] = [];
	const dnd = new Interactions({ defaultSensors: false });
	const sortable = new Sortable();
	dnd.use(sortable);
	const { container, nodes } = makeList();
	const handle = sortable.bind(container, {
		items,
		id,
		onReorder: (next, op) => {
			received.push({ next: next as { id: string }[], op });
			items.length = 0;
			items.push(...(next as { id: string }[]));
		},
	});
	const room = new Room(backend);
	const off = room.add(handle, id);
	const startY = (k: string) => items.findIndex((it) => it.id === k) * 50 + 25;
	return {
		room,
		handle,
		off,
		received,
		order: () => items.map((it) => it.id),
		rejoin: () => room.add(handle, id),
		drag: (k: string, toY: number) => {
			dnd.host.onInteractionStart(input(nodes[Number(k)], 'start', 10, startY(k)));
			dnd.host.onInteractionMove(input(nodes[Number(k)], 'move', 10, toY));
			dnd.host.onInteractionEnd(input(nodes[Number(k)], 'end', 10, toY));
		},
		dragHalf: (k: string, toY: number) => {
			dnd.host.onInteractionStart(input(nodes[Number(k)], 'start', 10, startY(k)));
			dnd.host.onInteractionMove(input(nodes[Number(k)], 'move', 10, toY));
		},
		dragEnd: (k: string, toY: number) =>
			dnd.host.onInteractionEnd(input(nodes[Number(k)], 'end', 10, toY)),
	};
}

describe('Room.add — membership lifecycle', () => {
	it('returns a disposer that detaches the target from the wire, and is idempotent', () => {
		const [ba, bb] = MemoryBackend.pair('A', 'B');
		const A = sortablePeer(ba);
		const B = sortablePeer(bb);

		A.off(); // A leaves the room

		A.drag('0', 80); // reorder on A
		expect(A.order()).toEqual(['1', '0', '2']); // A still reorders locally
		expect(B.received).toHaveLength(0); // ...but B never hears about it — A is detached

		expect(() => {
			A.off();
			A.off();
		}).not.toThrow(); // double-dispose is safe (React StrictMode add→dispose→dispose)
	});

	it('a target re-added under the same id resumes syncing (React StrictMode remount)', () => {
		const [ba, bb] = MemoryBackend.pair('A', 'B');
		const A = sortablePeer(ba);
		const B = sortablePeer(bb);

		A.off();
		A.rejoin(); // mount → unmount → mount

		A.drag('0', 80);
		expect(B.received).toHaveLength(1);
		expect(B.order()).toEqual(['1', '0', '2']);
	});
});

describe('Room.subscribe / peers / presences — reactive state', () => {
	it('fires on a remote in-flight gesture and clears when it ends', () => {
		const [ba, bb] = MemoryBackend.pair('A', 'B');
		const A = sortablePeer(ba);
		const B = sortablePeer(bb);
		let notifications = 0;
		const unsub = B.room.subscribe(() => notifications++);

		expect(B.room.peers).toEqual([]);
		expect(B.room.presences.size).toBe(0);

		A.dragHalf('0', 60); // in-flight on A (start + move, no end)
		expect(B.room.peers).toContain('A');
		expect(B.room.presences.has('A')).toBe(true);
		expect(notifications).toBeGreaterThan(0);

		const before = notifications;
		A.dragEnd('0', 60); // gesture ends → presence cleared
		expect(B.room.peers).toEqual([]);
		expect(B.room.presences.size).toBe(0);
		expect(notifications).toBeGreaterThan(before);

		unsub();
	});

	it('the peers/presences snapshots are referentially stable between changes', () => {
		const [ba] = MemoryBackend.pair('A', 'B');
		const A = sortablePeer(ba);
		const peers1 = A.room.peers;
		const presences1 = A.room.presences;
		// No change happened → same cached references (required by React useSyncExternalStore).
		expect(A.room.peers).toBe(peers1);
		expect(A.room.presences).toBe(presences1);
	});
});
