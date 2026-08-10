import { afterEach, describe, expect, it } from 'vitest';
import { Drag } from '../../src/drag/drag.ts';
import { Drop, REMOTE_HOVER_ATTR, REMOTE_HOVER_MARKER_ATTR } from '../../src/drop/drop.ts';
import { Interactions } from '../../src/engine.ts';
import { MemoryBackend, Room } from '../../src/collab/index.ts';
import type { LocalPresence } from '../../src/collab-types.ts';
import { input, mockRect } from './_browser.ts';

function node(rect?: { left: number; top: number; right: number; bottom: number }): HTMLElement {
	const el = document.createElement('div');
	document.body.appendChild(el);
	if (rect) mockRect(el, rect);
	return el;
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('Drop remote-hover presence', () => {
	it('emits a drop-hover frame while a local drag is over the zone, null on leave + end', () => {
		const dragNode = node();
		dragNode.setAttribute('data-neodrag-sortable-key', 'card1');
		const zone = node({ left: 100, top: 100, right: 200, bottom: 200 });
		const dnd = new Interactions({ defaultSensors: false });
		const drag = new Drag();
		const drop = new Drop();
		dnd.use(drag, drop);
		drag.bind(dragNode, {});
		const handle = drop.bind(zone, { id: 'inbox' });
		const frames: (LocalPresence | null)[] = [];
		handle.onPresence((p) => frames.push(p));

		dnd.host.onInteractionStart(input(dragNode, 'start', 0, 0));
		dnd.host.onInteractionMove(input(dragNode, 'move', 150, 150)); // enter → frame
		expect(frames.at(-1)).toEqual({ type: 'drop-hover', target: 'inbox', x: 150, y: 150, itemId: 'card1' });

		dnd.host.onInteractionMove(input(dragNode, 'move', 10, 10)); // leave → null
		expect(frames.at(-1)).toBeNull();

		dnd.host.onInteractionMove(input(dragNode, 'move', 160, 160)); // re-enter → frame
		expect(frames.at(-1)).toMatchObject({ type: 'drop-hover', target: 'inbox' });
		dnd.host.onInteractionEnd(input(dragNode, 'end', 160, 160)); // drag ends → null
		expect(frames.at(-1)).toBeNull();
	});

	it('showRemotePresence highlights the zone + floats a marker; clear removes both', () => {
		const zone = node({ left: 0, top: 0, right: 100, bottom: 100 });
		const dnd = new Interactions({ defaultSensors: false });
		const drop = new Drop();
		dnd.use(drop);
		const handle = drop.bind(zone, { id: 'inbox' });

		handle.showRemotePresence({ type: 'drop-hover', target: 'inbox', peerId: 'A', x: 50, y: 60, itemId: 'card1' });
		expect(zone.getAttribute(REMOTE_HOVER_ATTR)).toBe('A');
		const marker = document.querySelector(`[${REMOTE_HOVER_MARKER_ATTR}="A"]`) as HTMLElement;
		expect(marker).not.toBeNull();
		expect(marker.style.left).toBe('50px');
		expect(marker.style.top).toBe('60px');
		expect(marker.getAttribute('data-neodrag-remote-hover-item')).toBe('card1');

		// A later frame just moves the same marker.
		handle.showRemotePresence({ type: 'drop-hover', target: 'inbox', peerId: 'A', x: 70, y: 80 });
		expect(document.querySelectorAll(`[${REMOTE_HOVER_MARKER_ATTR}="A"]`)).toHaveLength(1);
		expect(marker.style.left).toBe('70px');

		handle.clearRemotePresence('A');
		expect(zone.hasAttribute(REMOTE_HOVER_ATTR)).toBe(false);
		expect(document.querySelector(`[${REMOTE_HOVER_MARKER_ATTR}="A"]`)).toBeNull();
	});

	it('renders one marker per peer; clearing one leaves the other', () => {
		const zone = node({ left: 0, top: 0, right: 100, bottom: 100 });
		const dnd = new Interactions({ defaultSensors: false });
		const drop = new Drop();
		dnd.use(drop);
		const handle = drop.bind(zone, { id: 'inbox' });

		handle.showRemotePresence({ type: 'drop-hover', target: 'inbox', peerId: 'A', x: 10, y: 10 });
		handle.showRemotePresence({ type: 'drop-hover', target: 'inbox', peerId: 'B', x: 20, y: 20 });
		expect(document.querySelectorAll(`[${REMOTE_HOVER_MARKER_ATTR}]`)).toHaveLength(2);

		handle.clearRemotePresence('A');
		expect(document.querySelector(`[${REMOTE_HOVER_MARKER_ATTR}="A"]`)).toBeNull();
		expect(document.querySelector(`[${REMOTE_HOVER_MARKER_ATTR}="B"]`)).not.toBeNull();
		expect(zone.hasAttribute(REMOTE_HOVER_ATTR)).toBe(true); // B still hovering

		handle.clearRemotePresence(); // clear all
		expect(document.querySelectorAll(`[${REMOTE_HOVER_MARKER_ATTR}]`)).toHaveLength(0);
		expect(zone.hasAttribute(REMOTE_HOVER_ATTR)).toBe(false);
	});

	it('destroy() tears down any remote markers', () => {
		const zone = node({ left: 0, top: 0, right: 100, bottom: 100 });
		const dnd = new Interactions({ defaultSensors: false });
		const drop = new Drop();
		dnd.use(drop);
		const handle = drop.bind(zone, { id: 'inbox' });
		handle.showRemotePresence({ type: 'drop-hover', target: 'inbox', peerId: 'A', x: 10, y: 10 });
		handle.destroy();
		expect(document.querySelectorAll(`[${REMOTE_HOVER_MARKER_ATTR}]`)).toHaveLength(0);
	});

	it('routes a hover through a Room: peer A dragging over a zone shows on peer B', () => {
		const [ba, bb] = MemoryBackend.pair('A', 'B');

		// Peer A: a drag + a drop zone, joined to a room.
		const dragNode = node();
		const zoneA = node({ left: 100, top: 100, right: 200, bottom: 200 });
		const dndA = new Interactions({ defaultSensors: false });
		const dragA = new Drag();
		const dropA = new Drop();
		dndA.use(dragA, dropA);
		dragA.bind(dragNode, {});
		const roomA = new Room(ba, { presenceThrottleMs: 0 });
		roomA.add(dropA.bind(zoneA, { id: 'inbox' }), 'inbox');

		// Peer B: the same zone id, joined to the paired room.
		const zoneB = node({ left: 100, top: 100, right: 200, bottom: 200 });
		const dndB = new Interactions({ defaultSensors: false });
		const dropB = new Drop();
		dndB.use(dropB);
		const roomB = new Room(bb, { presenceThrottleMs: 0 });
		roomB.add(dropB.bind(zoneB, { id: 'inbox' }), 'inbox');

		// A drags over its zone → B sees the remote hover.
		dndA.host.onInteractionStart(input(dragNode, 'start', 0, 0));
		dndA.host.onInteractionMove(input(dragNode, 'move', 150, 150));
		expect(zoneB.getAttribute(REMOTE_HOVER_ATTR)).toBe('A');
		expect(document.querySelector(`[${REMOTE_HOVER_MARKER_ATTR}="A"]`)).not.toBeNull();

		// A drops → the hover clears on B.
		dndA.host.onInteractionEnd(input(dragNode, 'end', 150, 150));
		expect(zoneB.hasAttribute(REMOTE_HOVER_ATTR)).toBe(false);

		roomA.destroy();
		roomB.destroy();
	});
});
