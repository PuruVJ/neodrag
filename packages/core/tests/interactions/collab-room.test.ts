import { afterEach, describe, expect, it } from 'vitest';
import { Interactions } from '../../src/engine.ts';
import { Sortable } from '../../src/sortable/sortable.ts';
import { Drag } from '../../src/drag/drag.ts';
import { Resize, type ResizeOptions } from '../../src/resize/resize.ts';
import { MemoryBackend, Room, RoomReconciler, type RoomOptions } from '../../src/collab/index.ts';
import type { CollabOp, PresenceFrame } from '../../src/collab-types.ts';
import { input, mockRect, translate } from './_browser.ts';


/** A sortable peer: a DOM list kept in sync from onReorder (mutated in place, so `options.items`
 *  stays live), an engine, and a Room over `backend`. */
function sortablePeer(backend: MemoryBackend, ids: string[], id = 'list', roomOpts: RoomOptions = {}) {
	const container = document.createElement('ul');
	const nodes = new Map<string, HTMLElement>();
	const items = ids.map((k) => ({ id: k }));
	const render = () => {
		container.innerHTML = '';
		nodes.clear();
		items.forEach((it, i) => {
			const li = document.createElement('li');
			li.setAttribute('data-neodrag-sortable-key', it.id);
			container.appendChild(li);
			mockRect(li, { left: 0, top: i * 50, right: 100, bottom: i * 50 + 50 });
			nodes.set(it.id, li);
		});
	};
	render();
	document.body.appendChild(container);

	const dnd = new Interactions({ defaultSensors: false });
	const sortable = new Sortable();
	dnd.use(sortable);
	const handle = sortable.bind(container, {
		items,
		id,
		onReorder: (next) => {
			items.length = 0;
			items.push(...(next as { id: string }[]));
			render();
		},
	});

	const room = new Room(backend, roomOpts);
	room.add(handle, id);

	return {
		container,
		room,
		order: () => items.map((it) => it.id),
		drag: (k: string, toY: number) => {
			const from = nodes.get(k)!;
			const startY = items.findIndex((it) => it.id === k) * 50 + 25;
			dnd.host.onInteractionStart(input(from, 'start', 10, startY));
			dnd.host.onInteractionMove(input(from, 'move', 10, toY));
			dnd.host.onInteractionEnd(input(from, 'end', 10, toY));
		},
		dragHalf: (k: string, toY: number) => {
			const from = nodes.get(k)!;
			const startY = items.findIndex((it) => it.id === k) * 50 + 25;
			dnd.host.onInteractionStart(input(from, 'start', 10, startY));
			dnd.host.onInteractionMove(input(from, 'move', 10, toY));
		},
		dragMove: (k: string, toY: number) => dnd.host.onInteractionMove(input(nodes.get(k)!, 'move', 10, toY)),
		dragEnd: (k: string, toY: number) => dnd.host.onInteractionEnd(input(nodes.get(k)!, 'end', 10, toY)),
	};
}

/** A two-list kanban peer — both lists on ONE shared Sortable + Interactions + Room (as a real
 *  page would, via the shared capability), so cross-list transfer ops resolve both sides. */
function kanbanPeer(backend: MemoryBackend, todoIds: string[], doneIds: string[]) {
	const dnd = new Interactions({ defaultSensors: false });
	const sortable = new Sortable();
	dnd.use(sortable);
	const room = new Room(backend);

	const makeList = (ids: string[], id: string, baseLeft: number) => {
		const container = document.createElement('ul');
		const items = ids.map((k) => ({ id: k }));
		const render = () => {
			container.innerHTML = '';
			items.forEach((it, i) => {
				const li = document.createElement('li');
				li.setAttribute('data-neodrag-sortable-key', it.id);
				container.appendChild(li);
				mockRect(li, { left: baseLeft, top: i * 50, right: baseLeft + 100, bottom: i * 50 + 50 });
			});
		};
		render();
		document.body.appendChild(container);
		const handle = sortable.bind(container, {
			items,
			id,
			group: 'kanban',
			onReorder: (next) => {
				items.length = 0;
				items.push(...(next as { id: string }[]));
				render();
			},
			onTransfer: (op) => {
				items.splice(op.to, 0, op.item as { id: string });
				render();
			},
		});
		room.add(handle, id);
		return { order: () => items.map((it) => it.id) };
	};

	return { room, todo: makeList(todoIds, 'todo', 0), done: makeList(doneIds, 'done', 200) };
}

/** A draggable peer over `backend`. */
function dragPeer(backend: MemoryBackend, id = 'box') {
	const node = document.createElement('div');
	document.body.appendChild(node);
	const dnd = new Interactions({ defaultSensors: false });
	const drag = new Drag();
	dnd.use(drag);
	const handle = drag.bind(node, { id });
	const room = new Room(backend);
	room.add(handle, id);
	return {
		node,
		room,
		drag: (toX: number, toY: number) => {
			dnd.host.onInteractionStart(input(node, 'start', 0, 0));
			dnd.host.onInteractionMove(input(node, 'move', toX, toY));
			dnd.host.onInteractionEnd(input(node, 'end', toX, toY));
		},
	};
}

/** A resizable peer over `backend`. */
function resizePeer(backend: MemoryBackend, id = 'panel', options: ResizeOptions = {}) {
	const box = document.createElement('div');
	const grip = document.createElement('div');
	grip.setAttribute('data-neodrag-resize-handle', 'se');
	box.appendChild(grip);
	document.body.appendChild(box);
	mockRect(box, { left: 0, top: 0, right: 100, bottom: 80 });
	const dnd = new Interactions({ defaultSensors: false });
	const resize = new Resize();
	dnd.use(resize);
	const handle = resize.bind(box, { id, ...options });
	const room = new Room(backend);
	room.add(handle, id);
	return {
		box,
		room,
		resize: (toX: number, toY: number) => {
			dnd.host.onInteractionStart(input(grip, 'start', 100, 80));
			dnd.host.onInteractionMove(input(grip, 'move', toX, toY));
			dnd.host.onInteractionEnd(input(grip, 'end', toX, toY));
		},
	};
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('Room — unified collab', () => {
	it('sortable: a local reorder on A converges to B', () => {
		const [ba, bb] = MemoryBackend.pair('A', 'B');
		const A = sortablePeer(ba, ['0', '1', '2'], 'tasks');
		const B = sortablePeer(bb, ['0', '1', '2'], 'tasks');
		A.drag('0', 80); // '0' past '1's midpoint (75) → lands after '1'
		expect(A.order()).toEqual(['1', '0', '2']);
		expect(B.order()).toEqual(['1', '0', '2']);
	});

	it('drag: a box committed on A translates B', () => {
		const [ba, bb] = MemoryBackend.pair('A', 'B');
		const A = dragPeer(ba, 'box');
		const B = dragPeer(bb, 'box');
		A.drag(60, 40);
		expect(translate(A.node)).toEqual({ x: 60, y: 40 });
		expect(translate(B.node)).toEqual({ x: 60, y: 40 });
	});

	it('resize: a panel sized on A sizes B', () => {
		const [ba, bb] = MemoryBackend.pair('A', 'B');
		const A = resizePeer(ba, 'panel');
		const B = resizePeer(bb, 'panel');
		A.resize(140, 110);
		expect(A.box.style.width).toBe('140px');
		expect(B.box.style.width).toBe('140px');
		expect(B.box.style.height).toBe('110px');
	});

	it('sortable: a remote drag renders a ghost on B mid-flight, cleared on end', () => {
		const [ba, bb] = MemoryBackend.pair('A', 'B');
		const A = sortablePeer(ba, ['0', '1', '2'], 'tasks', { presenceThrottleMs: 0 });
		const B = sortablePeer(bb, ['0', '1', '2'], 'tasks', { presenceThrottleMs: 0 });
		const ghost = () => B.container.querySelector('[data-neodrag-sortable-remote-ghost]');
		A.dragHalf('0', 80);
		expect(ghost()).not.toBeNull();
		A.dragEnd('0', 80);
		expect(ghost()).toBeNull();
		expect(B.order()).toEqual(['1', '0', '2']);
	});

	it('transfer: a remote transfer op converges the receiving peer with no duplicate', () => {
		const [ba, bb] = MemoryBackend.pair('A', 'B');
		const B = kanbanPeer(bb, ['a0', 'a1'], ['b0']);
		// A remote peer committed a transfer of 'a0' from todo into done, after 'b0'.
		ba.sendOp({ type: 'transfer', target: 'done', from: 'todo', itemId: 'a0', afterId: 'b0' });
		expect(B.todo.order()).toEqual(['a1']);
		expect(B.done.order()).toEqual(['b0', 'a0']);
		expect(B.done.order().filter((k) => k === 'a0')).toHaveLength(1);
	});

	it('mid-drag rebase: a remote op arriving while A drags still converges both peers', async () => {
		const [ba, bb] = MemoryBackend.pair('A', 'B');
		const A = sortablePeer(ba, ['0', '1', '2', '3'], 'tasks', { presenceThrottleMs: 0 });
		const B = sortablePeer(bb, ['0', '1', '2', '3'], 'tasks', { presenceThrottleMs: 0 });
		// A picks up '3' heading to land after '0' (drag not yet released).
		A.dragHalf('3', 60); // y=60 → past 0's mid (25), before 1's mid (75) → after '0'
		// B reorders '1' to the front and commits — the op reaches A mid-drag.
		B.drag('1', 5);
		expect(B.order()).toEqual(['1', '0', '2', '3']);
		// A releases — its rebased commit lands '3' after '0' on the now-shifted order.
		A.dragEnd('3', 60);
		// A's commit reaches B in the same tick as B's own just-committed reorder; the engine
		// frame-sequences it so B resolves it against a caught-up DOM. One frame lands the drain —
		// exactly as real frames would elapse between two users' gestures.
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		expect(A.order()).toEqual(B.order());
		const final = A.order();
		expect(final.indexOf('3')).toBe(final.indexOf('0') + 1);
		expect(final[0]).toBe('1');
	});

	it("destroy: stops wire sends but the target's own onCommit still fires", () => {
		const [ba, bb] = MemoryBackend.pair('A', 'B');
		const ownOps: CollabOp[] = [];
		const node = document.createElement('div');
		document.body.appendChild(node);
		const dnd = new Interactions({ defaultSensors: false });
		const drag = new Drag();
		dnd.use(drag);
		const handle = drag.bind(node, { id: 'box', onCommit: (op) => ownOps.push(op) });
		const room = new Room(ba);
		room.add(handle, 'box');
		const B = dragPeer(bb, 'box');

		room.destroy();
		dnd.host.onInteractionStart(input(node, 'start', 0, 0));
		dnd.host.onInteractionMove(input(node, 'move', 30, 20));
		dnd.host.onInteractionEnd(input(node, 'end', 30, 20));

		expect(ownOps).toHaveLength(1); // user's own onCommit still fires
		expect(translate(B.node)).toEqual({ x: 0, y: 0 }); // but nothing reached B (room torn down)
	});

	// Presence TTL: a peer that vanishes mid-gesture (no terminal null frame) must not leave a
	// permanent ghost — the Room sweeps it after `presenceTtlMs`.
	const ghostOf = (peer: { container: HTMLElement }) =>
		peer.container.querySelector('[data-neodrag-sortable-remote-ghost]');

	it('presence TTL: a stale ghost is auto-cleared when the peer goes silent', async () => {
		const [ba, bb] = MemoryBackend.pair('A', 'B');
		const A = sortablePeer(ba, ['0', '1', '2'], 'tasks', { presenceThrottleMs: 0 });
		const B = sortablePeer(bb, ['0', '1', '2'], 'tasks', { presenceThrottleMs: 0, presenceTtlMs: 60 });
		A.dragHalf('0', 80); // publishes presence, never ends
		expect(ghostOf(B)).not.toBeNull();
		await new Promise((r) => setTimeout(r, 120));
		expect(ghostOf(B)).toBeNull(); // swept by TTL, even though A never released
		A.dragEnd('0', 80); // keep afterEach teardown clean
	});

	it('presence TTL: each frame re-arms the timer, so an active peer keeps its ghost', async () => {
		const [ba, bb] = MemoryBackend.pair('A', 'B');
		const A = sortablePeer(ba, ['0', '1', '2'], 'tasks', { presenceThrottleMs: 0 });
		const B = sortablePeer(bb, ['0', '1', '2'], 'tasks', { presenceThrottleMs: 0, presenceTtlMs: 60 });
		A.dragHalf('0', 80);
		await new Promise((r) => setTimeout(r, 40));
		A.dragMove('0', 90); // a fresh frame at 40ms re-arms the 60ms timer
		await new Promise((r) => setTimeout(r, 40)); // 80ms since first frame, 40ms since last → still alive
		expect(ghostOf(B)).not.toBeNull();
		await new Promise((r) => setTimeout(r, 80)); // 120ms of silence since the last frame → swept
		expect(ghostOf(B)).toBeNull();
		A.dragEnd('0', 90);
	});

	it('presence TTL: presenceTtlMs 0 disables the sweep (ghost persists)', async () => {
		const [ba, bb] = MemoryBackend.pair('A', 'B');
		const A = sortablePeer(ba, ['0', '1', '2'], 'tasks', { presenceThrottleMs: 0 });
		const B = sortablePeer(bb, ['0', '1', '2'], 'tasks', { presenceThrottleMs: 0, presenceTtlMs: 0 });
		A.dragHalf('0', 80);
		expect(ghostOf(B)).not.toBeNull();
		await new Promise((r) => setTimeout(r, 120));
		expect(ghostOf(B)).not.toBeNull(); // never expires
		A.dragEnd('0', 80);
	});

	it('presence TTL: expiry notifies onRemotePresence with a terminal null', async () => {
		const [ba, bb] = MemoryBackend.pair('A', 'B');
		const frames: (PresenceFrame | null)[] = [];
		const A = sortablePeer(ba, ['0', '1', '2'], 'tasks', { presenceThrottleMs: 0 });
		sortablePeer(bb, ['0', '1', '2'], 'tasks', {
			presenceThrottleMs: 0,
			presenceTtlMs: 60,
			onRemotePresence: (f) => frames.push(f),
		});
		A.dragHalf('0', 80);
		await new Promise((r) => setTimeout(r, 120));
		expect(frames.at(-1)).toBeNull(); // the sweep surfaced as a null frame to the app
		A.dragEnd('0', 80);
	});
});

describe('RoomReconciler', () => {
	// Regression (review R4): when a remote transfer carries the item we're mid-dragging out of its
	// list, the in-flight anchor is meaningless — it must be dropped, not kept broadcasting a phantom.
	it('drops the in-flight anchor when the dragged item is transferred away mid-drag', () => {
		const r = new RoomReconciler();
		r.seed('todo', ['x', 'y', 'z']);
		r.seed('done', ['m']);
		r.beginLocal({ type: 'sortable', target: 'todo', fromTarget: 'todo', itemId: 'x', insertIndex: 1, rel: null });
		expect(r.isDragging).toBe(true);

		const result = r.applyRemote({ type: 'transfer', target: 'done', from: 'todo', itemId: 'x', afterId: 'm' });
		expect(r.isDragging).toBe(false); // anchor dropped
		expect(result.insertIndex).toBe(-1);
		expect([...r.orderOf('done')]).toEqual(['m', 'x']); // the fold still applied
		expect([...r.orderOf('todo')]).toEqual(['y', 'z']);
	});

	// A remote op that moves a *neighbour* (not the dragged item) rebases the in-flight index.
	it('rebases the in-flight insert index when a remote move shifts the anchor neighbour', () => {
		const r = new RoomReconciler();
		r.seed('list', ['0', '1', '2', '3']);
		r.beginLocal({ type: 'sortable', target: 'list', fromTarget: 'list', itemId: '3', insertIndex: 1, rel: null }); // after '0'
		const before = r.insertIndex;
		r.applyRemote({ type: 'move', target: 'list', itemId: '1', afterId: null }); // '1' → front, shifts '0'
		expect(r.isDragging).toBe(true);
		expect(r.insertIndex).not.toBe(before); // index rebased, drag continues
	});
});
