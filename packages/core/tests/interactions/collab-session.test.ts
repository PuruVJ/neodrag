/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import {
	CollabSession,
	MemoryBackend,
	bindCollab,
	type CollabPresence,
} from '../../src/collab/index.ts';
import { Interactions } from '../../src/engine.ts';
import { programmaticToInput } from '../../src/interaction-input.ts';
import type { MoveOp } from '../../src/sortable/sortable.ts';
import { Sortable } from '../../src/sortable/sortable.ts';

interface Item {
	id: string;
}

function input(target: HTMLElement, phase: 'start' | 'move' | 'end', x: number, y: number) {
	return programmaticToInput({ phase, clientX: x, clientY: y, pointerId: 1, target });
}

function mockRect(el: HTMLElement, top: number) {
	el.getBoundingClientRect = () =>
		({
			left: 0,
			top,
			right: 100,
			bottom: top + 50,
			width: 100,
			height: 50,
			x: 0,
			y: top,
			toJSON() {},
		}) as DOMRect;
}

/** A peer: its own Interactions + Sortable + DOM list, with `items` kept in sync from onReorder. */
function makePeer(ids: string[]) {
	const container = document.createElement('ul');
	const nodes = new Map<string, HTMLElement>();
	const items: Item[] = ids.map((id) => ({ id }));

	const render = () => {
		container.innerHTML = '';
		nodes.clear();
		items.forEach((it, i) => {
			const li = document.createElement('li');
			li.setAttribute('data-sortable-key', it.id);
			container.appendChild(li);
			mockRect(li, i * 50);
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
		
		onReorder: (next) => {
			items.length = 0;
			items.push(...(next as Item[]));
			render();
		},
	});

	return {
		container,
		dnd,
		sortable,
		handle,
		items,
		order: () => items.map((it) => it.id),
		node: (id: string) => nodes.get(id)!,
	};
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('CollabSession — two-peer convergence + mid-drag rebase', () => {
	it('a local reorder on A converges to B (durable op path)', () => {
		const A = makePeer(['0', '1', '2']);
		const B = makePeer(['0', '1', '2']);
		const [ba, bb] = MemoryBackend.pair('A', 'B');
		const sa = new CollabSession(A.handle, ba, { order: A.order() });
		const sb = new CollabSession(B.handle, bb, { order: B.order() });

		// A drags item 0 past item 1's midpoint (75) → lands after '1'
		A.dnd.host.onInteractionStart(input(A.node('0'), 'start', 10, 25));
		A.dnd.host.onInteractionMove(input(A.node('0'), 'move', 10, 80));
		sa.pump({ x: 10, y: 80 });
		A.dnd.host.onInteractionEnd(input(A.node('0'), 'end', 10, 80));

		expect(A.order()).toEqual(['1', '0', '2']);
		expect(B.order()).toEqual(['1', '0', '2']);
		// both reconcile engines agree
		expect([...sa.reconcile.order]).toEqual([...sb.reconcile.order]);

		sa.dispose();
		sb.dispose();
	});

	it('presence round-trips: B sees A\'s in-flight ghost while A drags', () => {
		const A = makePeer(['0', '1', '2']);
		const B = makePeer(['0', '1', '2']);
		const [ba, bb] = MemoryBackend.pair('A', 'B');
		const ghosts: Array<[string, CollabPresence | null]> = [];
		const sa = new CollabSession(A.handle, ba, { order: A.order() });
		const sb = new CollabSession(B.handle, bb, {
			order: B.order(),
			onRemotePresence: (id, p) => ghosts.push([id, p]),
		});

		A.dnd.host.onInteractionStart(input(A.node('0'), 'start', 10, 25));
		A.dnd.host.onInteractionMove(input(A.node('0'), 'move', 10, 80));
		sa.pump({ x: 10, y: 80 });

		// B saw A's in-flight presence with a resolved insert index.
		expect(ghosts.length).toBeGreaterThan(0);
		const live = sb.remotePresences().get('A');
		expect(live).toBeTruthy();
		expect(live!.dragKey).toBe('0');
		expect(live!.insertIndex).toBe(1); // 0 lands after 1 → insert index 1
		expect(live!.pointer).toEqual({ x: 10, y: 80 });

		// On drop, the ghost is cleared.
		A.dnd.host.onInteractionEnd(input(A.node('0'), 'end', 10, 80));
		expect(sb.remotePresences().has('A')).toBe(false);

		sa.dispose();
		sb.dispose();
	});

	it('MID-DRAG REBASE: a remote op arrives while A drags; A rebases & both converge', () => {
		const A = makePeer(['0', '1', '2', '3']);
		const B = makePeer(['0', '1', '2', '3']);
		const [ba, bb] = MemoryBackend.pair('A', 'B');

		const rebases: number[] = [];
		const sa = new CollabSession(A.handle, ba, {
			order: A.order(),
			onRebase: (idx) => rebases.push(idx),
		});
		const sb = new CollabSession(B.handle, bb, { order: B.order() });

		// A starts dragging item '3' upward to land after '0' (index 1).
		// midpoints at 25/75/125/175; moving to y=60 puts it past 0's mid (25), before 1's mid (75)
		A.dnd.host.onInteractionStart(input(A.node('3'), 'start', 10, 175));
		A.dnd.host.onInteractionMove(input(A.node('3'), 'move', 10, 60));
		sa.pump({ x: 10, y: 60 });

		const before = sa.reconcile.inflight;
		expect(before).toEqual({ itemId: '3', afterId: '0' });
		// A's broadcast insert index for '3' after '0'
		expect(sa.reconcile.isDragging).toBe(true);

		// B performs a reorder that A receives MID-DRAG: B moves '1' to the front.
		B.dnd.host.onInteractionStart(input(B.node('1'), 'start', 10, 75));
		B.dnd.host.onInteractionMove(input(B.node('1'), 'move', 10, 10)); // past 0's mid → front
		B.dnd.host.onInteractionEnd(input(B.node('1'), 'end', 10, 10));

		// B committed [1,0,2,3]; A received the op mid-drag and folded it in WITHOUT cancelling.
		expect(sa.reconcile.isDragging).toBe(true);
		// the in-flight anchor is preserved (still landing after '0')
		expect(sa.reconcile.inflight).toEqual({ itemId: '3', afterId: '0' });
		// the absolute insert index rebased because '1' jumped above the ghost
		expect(rebases.length).toBeGreaterThan(0);

		// A now finishes its drag — commits the rebased intent.
		A.dnd.host.onInteractionMove(input(A.node('3'), 'move', 10, 60));
		A.dnd.host.onInteractionEnd(input(A.node('3'), 'end', 10, 60));

		// Both peers converge to the same final order.
		expect(A.order()).toEqual(B.order());
		expect([...sa.reconcile.order]).toEqual([...sb.reconcile.order]);
		// '3' ended up immediately after '0', and B's '1' is at the front.
		const final = A.order();
		expect(final.indexOf('3')).toBe(final.indexOf('0') + 1);
		expect(final[0]).toBe('1');

		sa.dispose();
		sb.dispose();
	});

	it('keeps the legacy bindCollab path working alongside the new session', () => {
		const A = makePeer(['0', '1', '2']);
		const B = makePeer(['0', '1', '2']);
		// MemoryBackend is also a CollabProvider (durable op channel), so legacy bindCollab works.
		const [pa, pb] = MemoryBackend.pair('A', 'B');
		let opB: MoveOp | null = null;
		bindCollab(A.handle, pa);
		const off = pb.onRemoteOp((op) => {
			opB = op;
			B.handle.applyExternal(op);
		});

		A.dnd.host.onInteractionStart(input(A.node('0'), 'start', 10, 25));
		A.dnd.host.onInteractionMove(input(A.node('0'), 'move', 10, 80));
		A.dnd.host.onInteractionEnd(input(A.node('0'), 'end', 10, 80));

		expect(opB).toEqual({ itemId: '0', afterId: '1' });
		expect(B.order()).toEqual(['1', '0', '2']);
		off();
	});
});
