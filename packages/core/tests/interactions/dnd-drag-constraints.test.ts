import { describe, expect, it } from 'vitest';
import {
	constrain,
	constrainAxis,
	constrainBounds,
	constrainGrid,
	dragAnchor,
	proposedOffset,
	type RectLike,
} from '../../src/drag/drag.ts';

const rect = (left: number, top: number, w: number, h: number): RectLike => ({
	left,
	top,
	right: left + w,
	bottom: top + h,
});

describe('drag constraints — pure option transforms', () => {
	it('axis locks the orthogonal component', () => {
		expect(constrainAxis({ x: 7, y: 3 }, 'x')).toEqual({ x: 7, y: 0 });
		expect(constrainAxis({ x: 7, y: 3 }, 'y')).toEqual({ x: 0, y: 3 });
		expect(constrainAxis({ x: 7, y: 3 }, 'both')).toEqual({ x: 7, y: 3 });
	});

	it('grid snaps to the nearest step; 0 leaves an axis free', () => {
		expect(constrainGrid({ x: 13, y: 27 }, [10, 10])).toEqual({ x: 10, y: 30 });
		expect(constrainGrid({ x: 13, y: 27 }, [0, 25])).toEqual({ x: 13, y: 25 });
	});

	it('bounds clamps the element inside the bound rect', () => {
		const start = rect(100, 100, 50, 50); // element 50×50 at (100,100)
		const bounds = rect(0, 0, 300, 300);
		// free move within range
		expect(constrainBounds({ x: 20, y: 20 }, start, bounds)).toEqual({ x: 20, y: 20 });
		// pushed past the right/bottom edge → clamped so element-right/bottom == bound edge
		expect(constrainBounds({ x: 999, y: 999 }, start, bounds)).toEqual({ x: 150, y: 150 });
		// pushed past the left/top edge → clamped to bound origin
		expect(constrainBounds({ x: -999, y: -999 }, start, bounds)).toEqual({ x: -100, y: -100 });
	});

	it('bounds pins to the start edge when the element is larger than the bounds', () => {
		const start = rect(0, 0, 400, 50); // element wider than bounds on x
		const bounds = rect(10, 0, 100, 300);
		const r = constrainBounds({ x: 50, y: 5 }, start, bounds);
		expect(r.x).toBe(10); // minX = bounds.left - start.left
		expect(r.y).toBe(5); // y unconstrained-ish, within range
	});

	it('pipeline applies axis → grid → bounds in order', () => {
		const start = rect(0, 0, 20, 20);
		const bounds = rect(0, 0, 100, 100);
		// axis:x zeroes y; grid snaps x to 10; bounds keeps it in range
		expect(constrain({ x: 13, y: 99 }, { axis: 'x', grid: [10, 10], bounds }, start)).toEqual({
			x: 10,
			y: 0,
		});
	});
});

describe('drag delta — inverse-scale (#232) math', () => {
	it('at the start position the proposed offset equals the original offset (no jump)', () => {
		const offset0 = { x: 40, y: 25 };
		for (const s of [1, 2, 0.5]) {
			const anchor = dragAnchor(200, 150, offset0, s);
			expect(proposedOffset(200, 150, anchor, s)).toEqual(offset0);
		}
	});

	it('moving the pointer by d moves the offset by d*inverseScale', () => {
		const offset0 = { x: 0, y: 0 };
		const anchor1 = dragAnchor(100, 100, offset0, 1);
		expect(proposedOffset(130, 90, anchor1, 1)).toEqual({ x: 30, y: -10 });

		const anchor2 = dragAnchor(100, 100, offset0, 2);
		expect(proposedOffset(130, 90, anchor2, 2)).toEqual({ x: 60, y: -20 });
	});
});
