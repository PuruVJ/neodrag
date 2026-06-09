import { describe, expect, it } from 'vitest';
import type { RectLike } from '../../src/drag/drag.ts';
import { LinearCollisionIndex, VirtualCollisionIndex } from '../../src/drop/drop.ts';

/** A 10x10 cell laid out on a non-overlapping grid so each id owns a unique point. */
const cell = (i: number): RectLike => {
	const left = i * 10;
	const top = 0;
	return { left, top, right: left + 10, bottom: 10 };
};
/** The center point of cell `i` — guaranteed inside cell `i` and no other. */
const center = (i: number): [number, number] => [i * 10 + 5, 5];

describe('VirtualCollisionIndex', () => {
	it('with visible() only tests the on-screen set — O(visible), never an off-screen hit', () => {
		const visibleIds = new Set([100, 250, 999]);
		const index = new VirtualCollisionIndex<number>({ visible: () => visibleIds });

		for (let i = 0; i < 1000; i++) index.insert(i, cell(i));

		// A point inside a visible cell hits exactly that cell.
		expect(index.query(...center(250))).toEqual([250]);
		expect(index.query(...center(100))).toEqual([100]);
		expect(index.query(...center(999))).toEqual([999]);

		// A point inside an OFF-SCREEN cell (id 5) returns nothing, even though its rect is stored
		// and the point is geometrically inside it. This is the whole point of virtualization.
		expect(index.query(...center(5))).toEqual([]);
		expect(index.query(...center(500))).toEqual([]);
	});

	it('only ever iterates visible ids (proves O(visible), not O(total))', () => {
		const visited: number[] = [];
		// visible() yields a tiny set while 1000 rects are stored.
		const index = new VirtualCollisionIndex<number>({
			visible: () =>
				(function* () {
					for (const id of [3, 7, 42]) {
						visited.push(id);
						yield id;
					}
				})(),
		});
		for (let i = 0; i < 1000; i++) index.insert(i, cell(i));

		index.query(...center(7));
		expect(visited).toEqual([3, 7, 42]);
	});

	it('tolerates a visible id that was never inserted / already removed', () => {
		const index = new VirtualCollisionIndex<number>({ visible: () => [1, 2, 3] });
		index.insert(2, cell(2));
		// ids 1 and 3 have no rect — they are skipped, only the hit at 2 is returned.
		expect(index.query(...center(2))).toEqual([2]);
	});

	it('without visible() matches LinearCollisionIndex behavior', () => {
		const virtual = new VirtualCollisionIndex<number>();
		const linear = new LinearCollisionIndex<number>();

		for (let i = 0; i < 50; i++) {
			virtual.insert(i, cell(i));
			linear.insert(i, cell(i));
		}

		for (let i = 0; i < 50; i++) {
			const [x, y] = center(i);
			expect(virtual.query(x, y)).toEqual(linear.query(x, y));
		}
		// A point outside every cell.
		expect(virtual.query(10000, 10000)).toEqual(linear.query(10000, 10000));
		expect(virtual.query(10000, 10000)).toEqual([]);
	});

	it('insert/update/remove/clear keep the stored geometry in sync', () => {
		const index = new VirtualCollisionIndex<string>();
		index.insert('a', { left: 0, top: 0, right: 10, bottom: 10 });
		expect(index.query(5, 5)).toEqual(['a']);

		index.update('a', { left: 100, top: 100, right: 110, bottom: 110 });
		expect(index.query(5, 5)).toEqual([]);
		expect(index.query(105, 105)).toEqual(['a']);

		index.remove('a');
		expect(index.query(105, 105)).toEqual([]);

		index.insert('b', { left: 0, top: 0, right: 10, bottom: 10 });
		index.clear();
		expect(index.query(5, 5)).toEqual([]);
	});
});
