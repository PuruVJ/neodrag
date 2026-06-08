// @vitest-environment node
import { describe, expect, test } from 'vitest';
import { applySortableReorder } from '../../src/drop/index.ts';

describe('sortable insert slot semantics (regression)', () => {
	test('pointer over center of slot 3 inserts before index 3, not after the list', () => {
		const { next, insertAt } = applySortableReorder(['1', '2', '3'], 0, 2, 'insert');
		expect(insertAt).toBe(1);
		expect(next).toEqual(['2', '1', '3']);
	});

	test('pointer past end of last slot inserts at end', () => {
		const { next, insertAt } = applySortableReorder(['latte', 'salad', 'cake'], 0, 3, 'insert');
		expect(insertAt).toBe(2);
		expect(next).toEqual(['salad', 'cake', 'latte']);
	});

	test('chained state previews match applySortableReorder each step', () => {
		const first = applySortableReorder(['alpha', 'bravo', 'charlie'], 0, 3, 'insert');
		expect(first.next).toEqual(['bravo', 'charlie', 'alpha']);

		const second = applySortableReorder(first.next, 2, 1, 'insert');
		expect(second.next).toEqual(['bravo', 'alpha', 'charlie']);
	});
});
