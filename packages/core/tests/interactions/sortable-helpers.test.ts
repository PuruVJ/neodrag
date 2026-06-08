// @vitest-environment node
import { describe, expect, test } from 'vitest';
import { applyGroupedSortableTransfer, applySortableReorder } from '../../src/drop/index.ts';

describe('applySortableReorder', () => {
	test('insert moves item down', () => {
		const { next, insertAt } = applySortableReorder(['a', 'b', 'c'], 0, 2, 'insert');
		expect(next).toEqual(['b', 'a', 'c']);
		expect(insertAt).toBe(1);
	});

	test('swap exchanges items', () => {
		const { next } = applySortableReorder(['a', 'b', 'c'], 0, 2, 'swap');
		expect(next).toEqual(['c', 'b', 'a']);
	});
});

describe('applyGroupedSortableTransfer', () => {
	type Card = { id: string; column: 'a' | 'b' };

	test('moves card into target column at index', () => {
		const all: Card[] = [
			{ id: '1', column: 'a' },
			{ id: '2', column: 'a' },
			{ id: '3', column: 'b' },
		];
		const next = applyGroupedSortableTransfer(all, { id: '1', column: 'a' }, {
			toIndex: 1,
			column: 'b',
			columnOf: (row) => row.column,
			withColumn: (row, column) => ({ ...row, column }),
		});
		expect(next.filter((c) => c.column === 'a').map((c) => c.id)).toEqual(['2']);
		expect(next.filter((c) => c.column === 'b').map((c) => c.id)).toEqual(['3', '1']);
	});
});
