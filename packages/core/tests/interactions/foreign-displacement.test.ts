import { describe, expect, it } from 'vitest';
import { computeForeignVirtualDisplacements } from '../../src/sortable/displacement/refresh.ts';
import {
	stabilizeForeignInsertAt,
	type SortableLayoutEntry,
} from '../../src/sortable/visual/layout.ts';

function entry(
	key: string,
	index: number,
	start: number,
	size: number,
): SortableLayoutEntry {
	return { key, index, start, end: start + size, size };
}

describe('foreign virtual displacement', () => {
	it('shifts existing items right when inserting at start', () => {
		const entries = [entry('cake', 0, 100, 80)];
		const byKey = computeForeignVirtualDisplacements(entries, 0, 72, 'horizontal');
		const cake = byKey.get('cake');
		expect(cake?.x).toBeGreaterThan(70);
		expect(cake?.y).toBe(0);
	});

	it('keeps existing items in place when inserting at end', () => {
		const entries = [entry('cake', 0, 100, 80)];
		const byKey = computeForeignVirtualDisplacements(entries, 1, 72, 'horizontal');
		const cake = byKey.get('cake');
		expect(cake?.x ?? 0).toBe(0);
		expect(cake?.y ?? 0).toBe(0);
	});

	it('stabilizes insert index across a single mid boundary', () => {
		const mids = [{ mid: 140, key: 'cake', index: 0 }];
		const band = 14;
		expect(stabilizeForeignInsertAt(0, 1, 130, mids, band)).toBe(0);
		expect(stabilizeForeignInsertAt(0, 1, 175, mids, band)).toBe(1);
		expect(stabilizeForeignInsertAt(1, 0, 150, mids, band)).toBe(1);
		expect(stabilizeForeignInsertAt(1, 0, 100, mids, band)).toBe(0);
	});

	it('uses a wider dead zone for a single foreign mid', () => {
		const mids = [{ mid: 140, key: 'cake', index: 0 }];
		const band = 14;
		expect(stabilizeForeignInsertAt(0, 1, 160, mids, band)).toBe(0);
		expect(stabilizeForeignInsertAt(0, 1, 175, mids, band)).toBe(1);
	});
});
