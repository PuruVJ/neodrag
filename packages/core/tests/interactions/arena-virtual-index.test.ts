import { describe, expect, it } from 'vitest';
import type { RectLike } from '../../src/drag/drag.ts';
import { VirtualCollisionIndex, type CollisionIndex } from '../../src/drop/drop.ts';

const cell = (col: number, row: number, size = 10): RectLike => ({
	left: col * size,
	top: row * size,
	right: col * size + size,
	bottom: row * size + size,
});

describe('VirtualCollisionIndex — CollisionIndex seam', () => {
	it('structurally satisfies the CollisionIndex<T> interface', () => {
		const idx: CollisionIndex<string> = new VirtualCollisionIndex<string>();
		expect(typeof idx.insert).toBe('function');
		expect(typeof idx.update).toBe('function');
		expect(typeof idx.remove).toBe('function');
		expect(typeof idx.clear).toBe('function');
		expect(typeof idx.query).toBe('function');
	});

	it('degrades to a linear scan over all rects when no visible() is supplied', () => {
		const idx = new VirtualCollisionIndex<string>();
		idx.insert('a', cell(0, 0));
		idx.insert('b', cell(1, 0));
		idx.insert('c', cell(2, 0));
		// Point inside cell b only.
		expect(idx.query(15, 5)).toEqual(['b']);
		// Point inside no cell.
		expect(idx.query(999, 999)).toEqual([]);
		// Boundary inclusivity (matches LinearCollisionIndex semantics).
		expect(idx.query(10, 0)).toContain('a');
		expect(idx.query(10, 0)).toContain('b');
	});

	it('update() moves a rect; remove()/clear() drop entries', () => {
		const idx = new VirtualCollisionIndex<string>();
		idx.insert('a', cell(0, 0));
		expect(idx.query(5, 5)).toEqual(['a']);
		idx.update('a', cell(5, 5));
		expect(idx.query(5, 5)).toEqual([]);
		expect(idx.query(55, 55)).toEqual(['a']);
		idx.remove('a');
		expect(idx.query(55, 55)).toEqual([]);
		idx.insert('b', cell(0, 0));
		idx.clear();
		expect(idx.query(5, 5)).toEqual([]);
	});
});

describe('VirtualCollisionIndex — visible() windowing', () => {
	it('only hit-tests ids in the visible set; off-screen hits are excluded', () => {
		let visible: string[] = [];
		const idx = new VirtualCollisionIndex<string>({ visible: () => visible });
		// Two rects stacked at the SAME spot — geometry alone would match both.
		idx.insert('onscreen', cell(0, 0));
		idx.insert('offscreen', cell(0, 0));

		visible = ['onscreen'];
		expect(idx.query(5, 5)).toEqual(['onscreen']);

		// Scroll: now the other one is the visible one.
		visible = ['offscreen'];
		expect(idx.query(5, 5)).toEqual(['offscreen']);

		// Nothing visible → no hits even though rects overlap the point.
		visible = [];
		expect(idx.query(5, 5)).toEqual([]);
	});

	it('off-screen rects are still stored (cheap insert/update) but never matched', () => {
		let visible: string[] = ['v'];
		const idx = new VirtualCollisionIndex<string>({ visible: () => visible });
		idx.insert('v', cell(0, 0));
		idx.insert('h', cell(0, 0)); // hidden, overlapping

		// While hidden, h never matches.
		expect(idx.query(5, 5)).toEqual(['v']);
		// We can update its stored rect while it is off-screen with no error...
		idx.update('h', cell(3, 3));
		// ...and once it scrolls into view it matches at its NEW (updated) location.
		visible = ['h'];
		expect(idx.query(5, 5)).toEqual([]);
		expect(idx.query(35, 35)).toEqual(['h']);
	});

	it('tolerates visible() naming ids that are not (yet) inserted or were removed', () => {
		const visible = ['ghost', 'real', 'removed'];
		const idx = new VirtualCollisionIndex<string>({ visible: () => visible });
		idx.insert('real', cell(0, 0));
		idx.insert('removed', cell(0, 0));
		idx.remove('removed');
		// 'ghost' was never inserted, 'removed' is gone — both skipped, no throw.
		expect(idx.query(5, 5)).toEqual(['real']);
	});

	it('accepts any iterable (Set) as the visible provider', () => {
		const set = new Set<number>();
		const idx = new VirtualCollisionIndex<number>({ visible: () => set });
		idx.insert(1, cell(0, 0));
		idx.insert(2, cell(0, 0));
		set.add(2);
		expect(idx.query(5, 5)).toEqual([2]);
	});

	it('returns all overlapping visible ids when several stack on the point', () => {
		const visible = ['a', 'b', 'c'];
		const idx = new VirtualCollisionIndex<string>({ visible: () => visible });
		idx.insert('a', cell(0, 0));
		idx.insert('b', cell(0, 0));
		idx.insert('c', { left: 0, top: 0, right: 8, bottom: 8 }); // also contains (5,5)
		const hits = idx.query(5, 5);
		expect(hits.sort()).toEqual(['a', 'b', 'c']);
	});
});

describe('VirtualCollisionIndex — 100k scaling', () => {
	it('queries in O(visible), not O(stored): a tiny window over 100k items', () => {
		const N = 100_000;
		// A long vertical strip of 10px cells, ids 0..N-1.
		const visibleWindow: number[] = [];
		const idx = new VirtualCollisionIndex<number>({ visible: () => visibleWindow });
		for (let i = 0; i < N; i++) idx.insert(i, cell(0, i));

		// Simulate a virtualizer exposing only ~30 on-screen rows around row 50000.
		const focus = 50_000;
		for (let i = focus - 15; i < focus + 15; i++) visibleWindow.push(i);

		// Pointer inside row `focus`.
		const y = focus * 10 + 5;
		const hits = idx.query(5, y);
		expect(hits).toEqual([focus]);

		// A pointer over a stored-but-not-visible row yields nothing (it's culled).
		const hidden = idx.query(5, 100 * 10 + 5);
		expect(hidden).toEqual([]);
	});

	it('with no visible() over 100k items it still returns the single geometric hit', () => {
		const N = 100_000;
		const idx = new VirtualCollisionIndex<number>();
		for (let i = 0; i < N; i++) idx.insert(i, cell(0, i));
		const target = 77_777;
		expect(idx.query(5, target * 10 + 5)).toEqual([target]);
	});
});
