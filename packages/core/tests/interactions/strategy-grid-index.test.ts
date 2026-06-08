// @vitest-environment node
import { describe, expect, test } from 'vitest';
import { computeGridOverIndex } from '../../src/sortable/intent/grid-index.ts';
import type { MeasuredRect } from '../../src/sortable/strategy/types.ts';

const GRID: MeasuredRect[] = [
	{ left: 0, top: 0, width: 50, height: 50, right: 50, bottom: 50 },
	{ left: 60, top: 0, width: 50, height: 50, right: 110, bottom: 50 },
	{ left: 0, top: 60, width: 50, height: 50, right: 50, bottom: 110 },
	{ left: 60, top: 60, width: 50, height: 50, right: 110, bottom: 110 },
];

describe('computeGridOverIndex', () => {
	test('closestCenter picks nearest cell center', () => {
		expect(computeGridOverIndex(GRID, 25, 25, 'closestCenter')).toBe(0);
		expect(computeGridOverIndex(GRID, 85, 85, 'closestCenter')).toBe(3);
	});

	test('pointerWithin prefers cell under pointer', () => {
		expect(computeGridOverIndex(GRID, 70, 10, 'pointerWithin')).toBe(1);
	});
});
