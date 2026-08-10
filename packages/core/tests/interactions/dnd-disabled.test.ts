import { afterEach, describe, expect, it, vi } from 'vitest';
import { Drag } from '../../src/drag/drag.ts';
import { Drop } from '../../src/drop/drop.ts';
import { Interactions } from '../../src/engine.ts';
import { Sortable } from '../../src/sortable/sortable.ts';
import { input, mockRect } from './_browser.ts';

afterEach(() => {
	vi.restoreAllMocks();
	document.body.innerHTML = '';
});

/** A single sortable list of 50px rows at x∈[0,100]; `onReorder` is spied so we can assert a
 *  reorder did (or didn't) commit. */
function list(ids: string[], options: { disabled?: boolean } = {}) {
	const dnd = new Interactions({ defaultSensors: false });
	const sortable = new Sortable();
	dnd.use(sortable);
	const items = ids.map((k) => ({ id: k }));
	const nodes = new Map<string, HTMLElement>();
	const container = document.createElement('ul');
	items.forEach((it, i) => {
		const li = document.createElement('li');
		li.setAttribute('data-neodrag-sortable-key', it.id);
		container.appendChild(li);
		mockRect(li, { left: 0, top: i * 50, right: 100, bottom: i * 50 + 50 });
		nodes.set(it.id, li);
	});
	document.body.appendChild(container);
	mockRect(container, { left: 0, top: 0, right: 100, bottom: items.length * 50 });
	const onReorder = vi.fn((next: { id: string }[]) => {
		items.length = 0;
		items.push(...next);
	});
	sortable.bind(container, { items, id: 'l', onReorder, ...options });
	return {
		container,
		onReorder,
		start: (k: string, x: number, y: number) => dnd.host.onInteractionStart(input(nodes.get(k)!, 'start', x, y)),
		move: (k: string, x: number, y: number) => dnd.host.onInteractionMove(input(nodes.get(k)!, 'move', x, y)),
		end: (k: string, x: number, y: number) => dnd.host.onInteractionEnd(input(nodes.get(k)!, 'end', x, y)),
	};
}

describe('Sortable — disabled freezes the list', () => {
	it('a disabled list never starts a reorder (no gap, no commit)', () => {
		const l = list(['a', 'b', 'c'], { disabled: true });
		l.start('a', 10, 25);
		l.move('a', 10, 130); // drag a0 well past c0 — would reorder if live
		// No row was lifted or shifted.
		for (const n of l.container.children) expect((n as HTMLElement).style.translate || '').toBe('');
		l.end('a', 10, 130);
		expect(l.onReorder).not.toHaveBeenCalled();
	});

	it('the same gesture reorders once disabled is off (control)', () => {
		const l = list(['a', 'b', 'c']);
		l.start('a', 10, 25);
		l.move('a', 10, 130);
		l.end('a', 10, 130);
		expect(l.onReorder).toHaveBeenCalled();
	});
});

describe('Drop — disabled zone is never a hit-test candidate', () => {
	function scene(disabled: boolean) {
		const dragNode = document.createElement('div');
		document.body.appendChild(dragNode);
		const zone = document.createElement('div');
		document.body.appendChild(zone);
		mockRect(zone, { left: 100, top: 100, right: 200, bottom: 200 });
		const log: string[] = [];
		const dnd = new Interactions({ defaultSensors: false });
		const drag = new Drag();
		const drop = new Drop();
		dnd.use(drag, drop);
		drag.bind(dragNode, {});
		drop.bind(zone, {
			disabled,
			onEnter: () => log.push('enter'),
			onDrop: () => log.push('drop'),
		});
		return { dragNode, zone, log, dnd };
	}

	it('a disabled zone fires no enter/drop and stays unmarked', () => {
		const { dragNode, zone, log, dnd } = scene(true);
		dnd.host.onInteractionStart(input(dragNode, 'start', 0, 0));
		dnd.host.onInteractionMove(input(dragNode, 'move', 150, 150)); // over the zone
		dnd.host.onInteractionEnd(input(dragNode, 'end', 150, 150));
		expect(log).toEqual([]);
		expect(zone.hasAttribute('data-neodrag-over')).toBe(false);
	});

	it('the same crossing lands once disabled is off (control)', () => {
		const { dragNode, log, dnd } = scene(false);
		dnd.host.onInteractionStart(input(dragNode, 'start', 0, 0));
		dnd.host.onInteractionMove(input(dragNode, 'move', 150, 150));
		dnd.host.onInteractionEnd(input(dragNode, 'end', 150, 150));
		expect(log).toEqual(['enter', 'drop']);
	});
});
