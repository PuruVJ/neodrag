// @vitest-environment node
import { describe, expect, test } from 'vitest';
import { displacementFromVirtualSlots } from '../../src/sortable/strategy/virtual-shift.ts';
import { placeholderRowShiftPx, siblingShiftPx } from '../../src/sortable/visual.ts';
import {
	THREE_CHIP_POST_LIFT,
	THREE_CHIP_PRE_LIFT,
} from '../fixtures/sortable-three-chip-layout.ts';

const FROM = 0;

describe('virtual-shift parity with siblingShiftPx', () => {
	test('matches siblingShiftPx when pre equals post (transform-only)', () => {
		for (const insertAt of [0, 1, 2]) {
			for (const entry of THREE_CHIP_PRE_LIFT) {
				const legacy =
					entry.index === FROM
						? placeholderRowShiftPx(
								THREE_CHIP_PRE_LIFT,
								THREE_CHIP_PRE_LIFT,
								FROM,
								insertAt,
								'horizontal',
							).x
						: siblingShiftPx(
								THREE_CHIP_PRE_LIFT,
								THREE_CHIP_PRE_LIFT,
								FROM,
								insertAt,
								entry.index,
							);
				const { x } = displacementFromVirtualSlots(
					THREE_CHIP_PRE_LIFT,
					THREE_CHIP_PRE_LIFT,
					FROM,
					insertAt,
					entry.index,
					'horizontal',
				);
				expect(x).toBeCloseTo(legacy, 4);
			}
		}
	});

	test('matches lift-collapse fixture for siblings', () => {
		for (const insertAt of [0, 1, 2]) {
			for (const entry of THREE_CHIP_POST_LIFT) {
				if (entry.index === FROM) continue;
				const legacy = siblingShiftPx(
					THREE_CHIP_PRE_LIFT,
					THREE_CHIP_POST_LIFT,
					FROM,
					insertAt,
					entry.index,
				);
				const { x } = displacementFromVirtualSlots(
					THREE_CHIP_PRE_LIFT,
					THREE_CHIP_POST_LIFT,
					FROM,
					insertAt,
					entry.index,
					'horizontal',
				);
				expect(x).toBeCloseTo(legacy, 4);
			}
		}
	});
});
