import { describe, expect, it } from 'vitest';
import {
	applyMove,
	moveOpFromIndices,
	reorderKeys,
	type MoveOp,
} from '../../src/sortable/sortable.ts';


describe('sortable anchor-based move ops (CRDT-ready)', () => {
	it('applyMove inserts after the anchor id', () => {
		expect(applyMove(['a', 'b', 'c', 'd'], { itemId: 'a', afterId: 'c' })).toEqual([
			'b',
			'c',
			'a',
			'd',
		]);
	});

	it('afterId null moves to the front', () => {
		expect(applyMove(['a', 'b', 'c'], { itemId: 'c', afterId: null })).toEqual(['c', 'a', 'b']);
	});

	it('a vanished anchor appends deterministically (concurrency-safe fallback)', () => {
		expect(applyMove(['a', 'b'], { itemId: 'a', afterId: 'zzz' })).toEqual(['b', 'a']);
	});

	it('moveOpFromIndices derives the correct anchor', () => {
		expect(moveOpFromIndices(['a', 'b', 'c', 'd'], 0, 2)).toEqual<MoveOp>({
			itemId: 'a',
			afterId: 'c',
		});
		expect(moveOpFromIndices(['a', 'b', 'c', 'd'], 3, 0)).toEqual<MoveOp>({
			itemId: 'd',
			afterId: null,
		});
	});

	it('reorderKeys matches index-move semantics across positions', () => {
		expect(reorderKeys(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
		expect(reorderKeys(['a', 'b', 'c', 'd'], 3, 0)).toEqual(['d', 'a', 'b', 'c']);
		expect(reorderKeys(['a', 'b', 'c', 'd'], 1, 2)).toEqual(['a', 'c', 'b', 'd']);
	});
});
