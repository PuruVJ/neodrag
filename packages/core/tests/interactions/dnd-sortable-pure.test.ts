/**
 * Pure sortable math — no DOM, no jsdom. These are the deterministic units behind the engine's
 * insert-index / hysteresis / grid logic. The DOM-bound behaviors (FLIP, displacement, transfer,
 * collapse-source, accepts, elevation) are covered by the real-browser suite in
 * `packages/svelte/tests/sortable.test.svelte.ts`.
 */
import { describe, expect, it } from 'vitest';
import {
	buildMids,
	computeGridOverIndex,
	computeTargetFromMids,
	gridDisplacements,
	resolveAnimationDuration,
	stabilizeForeignInsertAt,
	stabilizeInsertAt,
} from '../../src/sortable/sortable.ts';

describe('mids: variable item sizes + hysteresis (pure)', () => {
	it('insert index honours measured (variable) sizes, not a uniform pitch', () => {
		const rects = [
			{ key: '0', left: 0, top: 0, right: 100, bottom: 20 },
			{ key: '1', left: 0, top: 20, right: 100, bottom: 140 },
			{ key: '2', left: 0, top: 140, right: 100, bottom: 160 },
		];
		const mids = buildMids(rects, 'y'); // mids: 10, 80, 150
		expect(computeTargetFromMids(mids, 70, '0', 3)).toBe(0);
		expect(computeTargetFromMids(mids, 90, '0', 3)).toBe(1);
		expect(computeTargetFromMids(mids, 151, '0', 3)).toBe(2);
	});

	it('hysteresis holds the current slot until the pointer crosses the boundary + band', () => {
		const boundaries = [75, 125];
		const band = 10;
		expect(stabilizeInsertAt(0, 1, 78, boundaries, band)).toBe(0);
		expect(stabilizeInsertAt(0, 1, 90, boundaries, band)).toBe(1);
		expect(stabilizeInsertAt(1, 0, 72, boundaries, band)).toBe(1);
		expect(stabilizeInsertAt(1, 0, 60, boundaries, band)).toBe(0);
	});

	it('foreign hysteresis: single-mid column uses a wide hold band', () => {
		const mids = buildMids([{ key: 'x', left: 0, top: 0, right: 100, bottom: 50 }], 'y'); // mid 25
		const band = 8;
		expect(stabilizeForeignInsertAt(0, 1, 30, mids, band)).toBe(0);
		expect(stabilizeForeignInsertAt(0, 1, 200, mids, band)).toBe(1);
	});
});

describe('grid: 2D over-index + displacement (pure)', () => {
	const grid = [
		{ key: '0', left: 0, top: 0, right: 50, bottom: 50 },
		{ key: '1', left: 50, top: 0, right: 100, bottom: 50 },
		{ key: '2', left: 0, top: 50, right: 50, bottom: 100 },
		{ key: '3', left: 50, top: 50, right: 100, bottom: 100 },
	];

	it('closestCenter picks the nearest cell center in 2D', () => {
		expect(computeGridOverIndex(grid, 5, 5)).toBe(0);
		expect(computeGridOverIndex(grid, 95, 5)).toBe(1);
		expect(computeGridOverIndex(grid, 5, 95)).toBe(2);
		expect(computeGridOverIndex(grid, 95, 95)).toBe(3);
	});

	it('pointerWithin returns the cell the pointer is literally inside', () => {
		expect(computeGridOverIndex(grid, 60, 60, 'pointerWithin')).toBe(3);
	});

	it('displacements slide in-between cells one slot toward the drag origin (wrap-aware)', () => {
		const shifts = gridDisplacements(grid, 0, 3);
		expect(shifts.get(1)).toEqual({ x: -50, y: 0 });
		expect(shifts.get(2)).toEqual({ x: 50, y: -50 });
		expect(shifts.get(3)).toEqual({ x: -50, y: 0 });
		expect(shifts.has(0)).toBe(false);
	});
});

describe('resolveAnimationDuration maps the boolean|number option', () => {
	it('true/undefined → 200, false → 0, number → itself', () => {
		expect(resolveAnimationDuration(true)).toBe(200);
		expect(resolveAnimationDuration(undefined)).toBe(200);
		expect(resolveAnimationDuration(false)).toBe(0);
		expect(resolveAnimationDuration(350)).toBe(350);
	});
});
