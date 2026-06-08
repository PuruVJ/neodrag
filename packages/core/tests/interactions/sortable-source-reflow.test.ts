import { describe, expect, it } from 'vitest';
import { computeSourceRemovedDisplacements } from '../../src/sortable/displacement/refresh.ts';

describe('sortable source reflow displacement', () => {
	it('shifts siblings left when the dragged chip is removed from layout', () => {
		const entries = [
			{ key: 'latte', index: 0, start: 12, end: 84, size: 72 },
			{ key: 'salad', index: 1, start: 96, end: 176, size: 80 },
			{ key: 'cake', index: 2, start: 188, end: 260, size: 72 },
		];
		const byKey = computeSourceRemovedDisplacements(entries, 'latte', 'horizontal');
		expect(byKey.get('salad')?.x).toBeLessThan(0);
		expect(byKey.get('cake')?.x).toBeLessThan(0);
	});
});
