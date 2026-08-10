import { afterEach, describe, expect, it, vi } from 'vitest';
import { Interactions } from '../../src/engine.ts';
import { Sortable } from '../../src/sortable/sortable.ts';
import { input, mockRect } from './_browser.ts';

/** Two grouped lists on ONE Sortable + Interactions (a kanban board), laid out side by side so a
 *  drag from A can hover B's column. Rows are 50px tall; A spans x∈[0,100], B spans x∈[200,300]. */
function board(aIds: string[], bIds: string[]) {
	const dnd = new Interactions({ defaultSensors: false });
	const sortable = new Sortable();
	dnd.use(sortable);
	const nodes = new Map<string, HTMLElement>();

	const makeList = (ids: string[], id: string, left: number) => {
		const container = document.createElement('ul');
		const items = ids.map((k) => ({ id: k }));
		items.forEach((it, i) => {
			const li = document.createElement('li');
			li.setAttribute('data-neodrag-sortable-key', it.id);
			container.appendChild(li);
			mockRect(li, { left, top: i * 50, right: left + 100, bottom: i * 50 + 50 });
			nodes.set(it.id, li);
		});
		document.body.appendChild(container);
		mockRect(container, { left, top: 0, right: left + 100, bottom: items.length * 50 });
		sortable.bind(container, {
			items,
			id,
			group: 'kanban',
			onReorder: (next) => {
				items.length = 0;
				items.push(...(next as { id: string }[]));
			},
			onTransfer: (op) => {
				items.splice(op.to, 0, op.item as { id: string });
			},
		});
		return container;
	};

	const a = makeList(aIds, 'todo', 0);
	const b = makeList(bIds, 'done', 200);
	return {
		a,
		b,
		start: (k: string, x: number, y: number) => dnd.host.onInteractionStart(input(nodes.get(k)!, 'start', x, y)),
		move: (k: string, x: number, y: number) => dnd.host.onInteractionMove(input(nodes.get(k)!, 'move', x, y)),
		end: (k: string, x: number, y: number) => dnd.host.onInteractionEnd(input(nodes.get(k)!, 'end', x, y)),
	};
}

afterEach(() => {
	vi.restoreAllMocks();
	document.body.innerHTML = '';
});

describe('cross-list foreign hover — query caching', () => {
	it('re-queries the foreign list at most a handful of times across many hovering moves', () => {
		// B has 5 rows (mids at 25/75/125/175/225); the sweep stays below the last mid so it only
		// exercises slot *changes*, not the insert-past-end edge of stabilizeForeignInsertAt.
		const board2 = board(['a0', 'a1', 'a2'], ['b0', 'b1', 'b2', 'b3', 'b4']);
		// Pick up a0 and lift it toward B's column before spying, so setup queries aren't counted.
		board2.start('a0', 10, 25);
		board2.move('a0', 250, 30); // first foreign hover — gap opens, nodes measured once

		const spy = vi.spyOn(Element.prototype, 'querySelectorAll');
		// Sweep through B's column at varying Y so the gap slot changes repeatedly.
		for (let i = 0; i < 20; i++) {
			const y = 10 + ((i * 19) % 190); // 10..200, several slot crossings, below the last mid (225)
			board2.move('a0', 250, y);
		}
		const calls = spy.mock.calls.length;

		board2.end('a0', 250, 80);
		// Without caching this would scale with slot changes (≥ several); cached, it's ~0 during the sweep.
		expect(calls).toBeLessThanOrEqual(4);
	});

	it('the foreign gap still tracks the pointer (caching is a behavioral no-op)', () => {
		const board2 = board(['a0', 'a1', 'a2'], ['b0', 'b1', 'b2']);
		board2.start('a0', 10, 25);
		board2.move('a0', 250, 30);
		// A gap must be open in B (some row pushed down by the incoming chip's extent).
		const shifted = [...board2.b.children].some((n) => (n as HTMLElement).style.translate);
		expect(shifted).toBe(true);
		board2.end('a0', 250, 80);
		// After end, B's rows are clean (no lingering transforms).
		for (const n of board2.b.children) expect((n as HTMLElement).style.translate || '').toBe('');
	});
});
