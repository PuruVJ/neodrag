// @vitest-environment node
//
// Unit coverage for visual sortable regressions:
// - virtual insertAt splice vs committed order
// - pre-lift slot targets vs post-lift DOM (no double compensate / +165px cake)
// - hold translate when insertAt === from after flex collapse
// - intent hysteresis on slot boundaries
// - pre-lift mids for collision, not collapsed post-lift positions
//
import { describe, expect, test } from 'vitest';
import { applySortableReorder } from '../../src/drop/index.ts';
import { IntentSession, SortableContext } from '../../src/sortable/context.ts';
import { commitFromIntent } from '../../src/sortable/intent.ts';
import {
	midsFromLayoutEntries,
	placeholderRowShiftPx,
	siblingShiftPx,
	slotBoundariesFromMids,
	stabilizeVisualInsertAt,
	virtualOrderKeys,
	virtualSlotStarts,
} from '../../src/sortable/visual.ts';
import {
	THREE_CHIP_MIDS,
	THREE_CHIP_POST_LIFT,
	THREE_CHIP_PRE_LIFT,
} from '../fixtures/sortable-three-chip-layout.ts';

const FROM = 0;

function shift(key: string, insertAt: number) {
	const entry = THREE_CHIP_POST_LIFT.find((row) => row.key === key);
	if (!entry) throw new Error(`missing ${key}`);
	return siblingShiftPx(THREE_CHIP_PRE_LIFT, THREE_CHIP_POST_LIFT, FROM, insertAt, entry.index);
}

describe('sortable visual virtual order', () => {
	test('insertAt 1 places dragged item between first two siblings', () => {
		expect(virtualOrderKeys(THREE_CHIP_PRE_LIFT, FROM, 1)).toEqual([
			'salad',
			'latte',
			'cake',
		]);
	});

	test('insertAt 2 places dragged item after both siblings', () => {
		expect(virtualOrderKeys(THREE_CHIP_PRE_LIFT, FROM, 2)).toEqual([
			'salad',
			'cake',
			'latte',
		]);
	});

	test('insertAt 1 and 2 are not the same virtual order', () => {
		const overSalad = virtualOrderKeys(THREE_CHIP_PRE_LIFT, FROM, 1);
		const overCake = virtualOrderKeys(THREE_CHIP_PRE_LIFT, FROM, 2);
		expect(overSalad).not.toEqual(overCake);
	});

	test('virtual order matches buildCommittedOrder splice semantics', () => {
		const snapshot = ['latte', 'salad', 'cake'];
		for (const insertAt of [0, 1, 2]) {
			const copy = [...snapshot];
			const [item] = copy.splice(FROM, 1);
			copy.splice(insertAt, 0, item!);
			expect(virtualOrderKeys(THREE_CHIP_PRE_LIFT, FROM, insertAt)).toEqual(copy);
		}
	});

	test('applySortableReorder insertAt matches visual slots when dragging first item', () => {
		const cases: Array<{ to: number; insertAt: number }> = [
			{ to: 0, insertAt: 0 },
			{ to: 2, insertAt: 1 },
			{ to: 3, insertAt: 2 },
		];
		for (const { to, insertAt } of cases) {
			const { next, insertAt: resolved } = applySortableReorder(
				['latte', 'salad', 'cake'],
				FROM,
				to,
				'insert',
			);
			expect(resolved).toBe(insertAt);
			expect(next).toEqual(virtualOrderKeys(THREE_CHIP_PRE_LIFT, FROM, insertAt));
		}
	});
});

describe('sortable visual placeholder row shift', () => {
	test('insertAt equals from still applies hold shift on placeholder row after lift collapse', () => {
		const hold = placeholderRowShiftPx(THREE_CHIP_PRE_LIFT, THREE_CHIP_POST_LIFT, FROM, 0, 'horizontal');
		expect(hold.x).toBeCloseTo(79.359375, 2);
		expect(hold.y).toBe(0);
	});

	test('insertAt past from uses virtual slot for dragged index', () => {
		const post = THREE_CHIP_POST_LIFT.find((entry) => entry.index === FROM)!;
		for (const insertAt of [1, 2]) {
			const targetStart = virtualSlotStarts(THREE_CHIP_PRE_LIFT, FROM, insertAt).get(FROM)!;
			const { x } = placeholderRowShiftPx(
				THREE_CHIP_PRE_LIFT,
				THREE_CHIP_POST_LIFT,
				FROM,
				insertAt,
				'horizontal',
			);
			expect(x).toBeCloseTo(targetStart - post.start, 2);
		}
	});
});

describe('sortable visual wrapped-row guard', () => {
	const WRAPPED_PRE_LIFT: typeof THREE_CHIP_PRE_LIFT = [
		{ key: 'latte', index: 0, start: 10, end: 90, size: 80 },
		{ key: 'salad', index: 1, start: 98, end: 188, size: 90 },
		{ key: 'cake', index: 2, start: 10, end: 100, size: 90 },
	];

	test('1D virtual slots assume a single row (wrapped flex needs nowrap)', () => {
		const starts = virtualSlotStarts(WRAPPED_PRE_LIFT, 0, 1);
		expect(starts.get(0)).toBeLessThan(WRAPPED_PRE_LIFT[1]!.end);
	});
});

describe('sortable visual sibling shifts (pre-lift targets, post-lift DOM)', () => {
	test('insertAt equals from still applies hold translate after lift collapse', () => {
		expect(shift('salad', 0)).toBeCloseTo(79.359375, 2);
		expect(shift('cake', 0)).toBeCloseTo(79.359375, 2);
	});

	test('over salad slot holds cake with collapse compensate only (not +165px)', () => {
		const cakeOverSalad = shift('cake', 1);
		expect(cakeOverSalad).toBeCloseTo(79.359375, 2);
		expect(cakeOverSalad).toBeLessThan(100);
	});

	test('over cake slot shifts cake less than over salad slot', () => {
		const cakeOverSalad = shift('cake', 1);
		const cakeOverCake = shift('cake', 2);
		expect(cakeOverCake).toBeLessThan(cakeOverSalad);
		expect(cakeOverCake).toBeCloseTo(-7.1875, 2);
	});

	test('virtual slot for dragged item uses second slot when insertAt is 1', () => {
		const starts = virtualSlotStarts(THREE_CHIP_PRE_LIFT, FROM, 1);
		expect(starts.get(1)).toBe(THREE_CHIP_PRE_LIFT[0]!.start);
		expect(starts.get(0)).toBeCloseTo(
			THREE_CHIP_PRE_LIFT[0]!.start + THREE_CHIP_PRE_LIFT[1]!.size,
			0,
		);
	});
});

describe('sortable visual intent hysteresis', () => {
	const boundaries = slotBoundariesFromMids(THREE_CHIP_MIDS);
	const band = 22;

	test('requires crossing midpoint+band before moving from slot 0 to 1', () => {
		const boundary = boundaries[0]!;
		expect(stabilizeVisualInsertAt(0, 1, boundary + band - 1, boundaries, band)).toBe(0);
		expect(stabilizeVisualInsertAt(0, 1, boundary + band + 1, boundaries, band)).toBe(1);
	});

	test('requires crossing midpoint-band before moving from slot 1 to 0', () => {
		const boundary = boundaries[0]!;
		expect(stabilizeVisualInsertAt(1, 0, boundary - band + 1, boundaries, band)).toBe(1);
		expect(stabilizeVisualInsertAt(1, 0, boundary - band - 1, boundaries, band)).toBe(0);
	});

	test('allows multi-slot jumps without hysteresis', () => {
		expect(stabilizeVisualInsertAt(0, 2, boundaries[0]! + 1, boundaries, band)).toBe(2);
	});
});

describe('sortable visual mids from pre-lift layout', () => {
	test('mids use pre-lift centers not post-lift collapsed positions', () => {
		const pre = midsFromLayoutEntries(THREE_CHIP_PRE_LIFT);
		const post = midsFromLayoutEntries(THREE_CHIP_POST_LIFT);
		expect(pre.find((row) => row.key === 'salad')!.mid).toBeGreaterThan(
			post.find((row) => row.key === 'salad')!.mid,
		);
	});
});

describe('sortable visual drop commit', () => {
	test('commit uses previewTo when release pointer is still in drag dead zone', () => {
		const snapshot = ['latte', 'salad', 'cake'];
		const opts = {
			items: () => snapshot,
			keyBy: (item: string) => item,
			preview: 'visual' as const,
			strategy: 'horizontal' as const,
			onReorder: () => {},
		};
		const ctx = new SortableContext(opts);
		const dragAxis = {
			start: THREE_CHIP_PRE_LIFT[0]!.start,
			end: THREE_CHIP_PRE_LIFT[0]!.end,
		};
		ctx.intent = new IntentSession({
			snapshot: [...snapshot],
			dragFrom: 0,
			previewTo: 1,
			mids: THREE_CHIP_MIDS,
			dragAxis,
			dragBand: 22,
			targetIndex: 1,
			edgeThresholdPx: 0,
			slotBoundaries: slotBoundariesFromMids(THREE_CHIP_MIDS),
			sessionStrategy: 'horizontal',
			layoutStrategy: 'horizontal',
			containerRect: null,
		});
		const pointerX = (dragAxis.start + dragAxis.end) / 2;
		const commit = commitFromIntent(ctx, 'latte', pointerX, 0);
		expect(commit).not.toBeNull();
		expect(commit!.next).toEqual(['salad', 'latte', 'cake']);
		expect(commit!.insertAt).toBe(1);
	});
});
