import { describe, expect, it } from 'vitest';
import { lineIndicatorRects, reorderKeys } from '../../src/sortable/sortable.ts';

const keys = ['a', 'b', 'c', 'd'];

describe("sortable indicator: 'line' — drop-line index space", () => {
	it('the line sits on the item that follows the dragged one after commit, for every move', () => {
		for (let from = 0; from < keys.length; from++) {
			// `to` is in insert-after-removal space, like `IntentSnapshot.to_index`.
			for (let to = 0; to < keys.length; to++) {
				const rects = lineIndicatorRects(keys, from);
				const committed = reorderKeys(keys, from, to);
				const next = committed[committed.indexOf(keys[from]!) + 1];
				// `at === len` parks the line after the last item, so `next` must be undefined there.
				expect(rects[to], `from=${from} to=${to}`).toBe(next);
			}
		}
	});

	it('a downward move lands one slot later than the full (ghost-inclusive) list suggests', () => {
		// Regression: measuring against every item put the line on `b`'s leading edge while the
		// item committed after `b`. Skipping the dragged item puts it on `c`, where it lands.
		expect(keys[1]).toBe('b');
		expect(lineIndicatorRects(keys, 0)[1]).toBe('c');
		expect(reorderKeys(keys, 0, 1)).toEqual(['b', 'a', 'c', 'd']);
	});
});
