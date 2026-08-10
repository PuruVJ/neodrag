import { afterEach, describe, expect, it } from 'vitest';
import { Interactions } from '../../src/engine.ts';
import { Sortable } from '../../src/sortable/sortable.ts';
import { MemoryBackend, Room, type Mirror } from '../../src/collab/index.ts';
import { input, mockRect, translate } from './_browser.ts';

const GHOST = 'data-neodrag-sortable-remote-ghost';
const MIRROR = 'data-neodrag-sortable-remote-mirror';

/**
 * Regression for the dogfooded two-peer demo: two lists that share a wire id (`'tasks'`) on ONE
 * shared engine (as the ergonomic `SortableList` wrappers do via the singleton). Remote presence
 * must render on the list whose Room received it — routed by the bound context, NOT by the
 * ambiguous list-id string (which would always resolve to whichever list bound first).
 */
function twoListsOneEngine(ids: string[], opts: { mirror?: Mirror } = {}) {
	const dnd = new Interactions({ defaultSensors: false });
	const sortable = new Sortable();
	dnd.use(sortable);
	const [backA, backB] = MemoryBackend.pair('A', 'B');

	const makeList = (backend: MemoryBackend, top: number, mirror?: Mirror) => {
		const container = document.createElement('ul');
		const nodes = new Map<string, HTMLElement>();
		const items = ids.map((k) => ({ id: k }));
		items.forEach((it, i) => {
			const li = document.createElement('li');
			li.setAttribute('data-neodrag-sortable-key', it.id);
			container.appendChild(li);
			mockRect(li, { left: 0, top: top + i * 50, right: 100, bottom: top + i * 50 + 50 });
			nodes.set(it.id, li);
		});
		document.body.appendChild(container);
		const handle = sortable.bind(container, {
			items,
			id: 'tasks',
			onReorder: (next) => {
				items.length = 0;
				items.push(...(next as { id: string }[]));
			},
		});
		const room = new Room(backend, { presenceThrottleMs: 0, mirror });
		room.add(handle, 'tasks');
		return { container, nodes, room, order: () => items.map((it) => it.id) };
	};

	const a = makeList(backA, 0);
	const b = makeList(backB, 500, opts.mirror); // peer B renders A's drag (with mirror if given)
	const startY = (k: string) => ids.indexOf(k) * 50 + 25;
	return {
		a,
		b,
		dragHalf: (k: string, toY: number) => {
			const from = a.nodes.get(k)!;
			dnd.host.onInteractionStart(input(from, 'start', 10, startY(k)));
			dnd.host.onInteractionMove(input(from, 'move', 10, toY));
		},
		dragFull: (k: string, toY: number) => {
			const from = a.nodes.get(k)!;
			dnd.host.onInteractionStart(input(from, 'start', 10, startY(k)));
			dnd.host.onInteractionMove(input(from, 'move', 10, toY));
			dnd.host.onInteractionEnd(input(from, 'end', 10, toY));
		},
		destroy: () => {
			a.room.destroy();
			b.room.destroy();
		},
	};
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('shared-engine two-peer presence routing', () => {
	it('renders peer A\'s in-flight drag on peer B\'s list — not back on A', () => {
		const t = twoListsOneEngine(['design', 'build', 'review', 'ship']);
		// Peer A picks up 'design' and drags it down past 'build'.
		t.dragHalf('design', 130);

		// B mirrors A live: B's own 'design' row is ghosted as the remote home row.
		expect(t.b.nodes.get('design')!.hasAttribute(GHOST)).toBe(true);
		// A's own row is the LOCAL lift, never a remote ghost — the presence didn't collide back onto A.
		expect(t.a.nodes.get('design')!.hasAttribute(GHOST)).toBe(false);
		t.destroy();
	});

	it('translates the remote home ghost to its destination slot (no sibling overlap)', () => {
		const t = twoListsOneEngine(['design', 'build', 'review', 'ship']);
		// A drags 'design' (slot 0) down toward slot 2.
		t.dragHalf('design', 130);
		// B's ghosted home row is moved DOWN (not left in place for a sibling to slide onto).
		const ghost = t.b.nodes.get('design')!;
		expect(ghost.hasAttribute(GHOST)).toBe(true);
		expect(translate(ghost).y).toBeGreaterThan(0);
		t.destroy();
	});

	it('mounts the mirror clone inside a given container (absolute), not on <body>', () => {
		const mount = document.createElement('div');
		mount.style.position = 'relative';
		document.body.appendChild(mount);
		const t = twoListsOneEngine(['design', 'build', 'review', 'ship'], { mirror: mount });
		t.dragHalf('design', 130);
		const clone = mount.querySelector<HTMLElement>(`[${MIRROR}]`);
		expect(clone).not.toBeNull(); // lives inside the mount, inheriting its scoped styles
		expect(document.body.querySelector(`:scope > [${MIRROR}]`)).toBeNull(); // NOT a body child
		expect(clone!.style.position).toBe('absolute');
		t.destroy();
	});

	it('with a mirror, the home row is hidden (no second lagging ghost) and not translated', () => {
		const mount = document.createElement('div');
		mount.style.position = 'relative';
		document.body.appendChild(mount);
		const t = twoListsOneEngine(['design', 'build', 'review', 'ship'], { mirror: mount });
		t.dragHalf('design', 130);
		const home = t.b.nodes.get('design')!;
		expect(home.style.opacity).toBe('0'); // hidden — the floating clone is the item, not a dim ghost
		expect(translate(home).y).toBe(0); // not slid to the destination (the clone shows the motion)
		t.destroy();
	});

	it('a full drag with a mirror still commits the reorder on the remote (handoff path)', () => {
		const mount = document.createElement('div');
		mount.style.position = 'relative';
		document.body.appendChild(mount);
		const t = twoListsOneEngine(['design', 'build', 'review', 'ship'], { mirror: mount });
		t.dragFull('design', 130); // pick up slot 0, release near slot 2
		expect(t.a.order()).not.toEqual(['design', 'build', 'review', 'ship']); // it actually moved
		expect(t.b.order()).toEqual(t.a.order()); // B committed the same order through the mirror handoff
		t.destroy();
	});

	it('mirror: true keeps the clone on <body> with fixed positioning', () => {
		const t = twoListsOneEngine(['design', 'build', 'review', 'ship'], { mirror: true });
		t.dragHalf('design', 130);
		const clone = document.body.querySelector<HTMLElement>(`:scope > [${MIRROR}]`);
		expect(clone).not.toBeNull();
		expect(clone!.style.position).toBe('fixed');
		t.destroy();
	});
});
