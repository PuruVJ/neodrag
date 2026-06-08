import { describe, expect, it } from 'vitest';
import {
	distancePointToRect,
	foreignColumnShouldAppendAtEnd,
	pointerBeyondForeignContent,
	scoreForeignTargetProximity,
} from '../../src/sortable/intent/foreign-proximity.ts';
import type { SortableContext } from '../../src/sortable/context.ts';

function rect(
	left: number,
	top: number,
	width: number,
	height: number,
): DOMRect {
	return {
		left,
		top,
		right: left + width,
		bottom: top + height,
		width,
		height,
		x: left,
		y: top,
		toJSON: () => ({}),
	} as DOMRect;
}

function targetCtx(
	container: HTMLElement,
	items: { key: string; node: HTMLElement }[],
	strategy: 'horizontal' | 'vertical' = 'vertical',
): SortableContext<{ key: string }> {
	const nodesByKey = new Map(items.map((row) => [row.key, row.node]));
	return {
		id: Symbol('target'),
		opts: {
			items: () => items.map((row) => ({ key: row.key })),
			keyBy: (item) => item.key,
			strategy,
		},
		containerNode: container,
		nodesByKey,
	} as SortableContext<{ key: string }>;
}

describe('foreign proximity', () => {
	it('distancePointToRect is zero inside and grows outside', () => {
		const box = rect(100, 0, 80, 200);
		expect(distancePointToRect(140, 50, box)).toBe(0);
		expect(distancePointToRect(140, 250, box)).toBe(50);
		expect(distancePointToRect(300, 50, box)).toBe(120);
	});

	it('rejects when Y aligns with a placed chip but pointer is still over the tray', () => {
		const column = document.createElement('div');
		column.getBoundingClientRect = () => rect(400, 0, 120, 300);

		const cake = document.createElement('div');
		cake.getBoundingClientRect = () => rect(410, 24, 88, 40);

		const dragNode = document.createElement('div');
		dragNode.getBoundingClientRect = () => rect(120, 30, 72, 40);

		const alex = targetCtx(column, [{ key: 'cake', node: cake }], 'vertical');
		const sourceCtx = {
			opts: {},
			nodesByKey: new Map([['latte', dragNode]]),
		} as SortableContext<unknown>;

		const score = scoreForeignTargetProximity(alex, sourceCtx, 'latte', 130, 44);
		expect(score).toBeNull();
	});

	it('scores when pointer is in column padding below existing chips', () => {
		const samColumn = document.createElement('div');
		samColumn.getBoundingClientRect = () => rect(520, 0, 120, 80);

		const samChip = document.createElement('div');
		samChip.getBoundingClientRect = () => rect(532, 20, 72, 28);

		const dragNode = document.createElement('div');
		dragNode.getBoundingClientRect = () => rect(560, 70, 72, 28);

		const sourceCtx = {
			opts: {},
			nodesByKey: new Map([['latte', dragNode]]),
		} as SortableContext<unknown>;

		const sam = targetCtx(samColumn, [{ key: 'cake', node: samChip }], 'horizontal');

		const score = scoreForeignTargetProximity(sam, sourceCtx, 'latte', 560, 70);
		expect(score).not.toBeNull();
	});

	it('does not append for Y in column padding when X is still over horizontal chips', () => {
		const samColumn = document.createElement('div');
		samColumn.getBoundingClientRect = () => rect(520, 0, 120, 80);

		const samChip = document.createElement('div');
		samChip.getBoundingClientRect = () => rect(532, 20, 72, 28);

		const sam = targetCtx(samColumn, [{ key: 'cake', node: samChip }], 'horizontal');
		const content = { left: 532, top: 20, right: 604, bottom: 48 };

		expect(pointerBeyondForeignContent(568, 490, content, 'x')).toBe(false);
		expect(
			foreignColumnShouldAppendAtEnd(sam, 568, 490, content, 'x'),
		).toBe(false);
	});

	it('appends when pointer passes content on the approach axis', () => {
		const samColumn = document.createElement('div');
		samColumn.getBoundingClientRect = () => rect(520, 0, 120, 80);

		const samChip = document.createElement('div');
		samChip.getBoundingClientRect = () => rect(532, 20, 72, 28);

		const sam = targetCtx(samColumn, [{ key: 'cake', node: samChip }], 'horizontal');
		const content = { left: 532, top: 20, right: 604, bottom: 48 };

		expect(
			foreignColumnShouldAppendAtEnd(sam, 620, 44, content, 'x'),
		).toBe(true);
	});

	it('only scores a column whose chip band overlaps on the cross axis', () => {
		const alexColumn = document.createElement('div');
		alexColumn.getBoundingClientRect = () => rect(400, 0, 120, 300);
		const alexChip = document.createElement('div');
		alexChip.getBoundingClientRect = () => rect(410, 24, 88, 40);

		const samColumn = document.createElement('div');
		samColumn.getBoundingClientRect = () => rect(400, 0, 120, 300);
		const samChip = document.createElement('div');
		samChip.getBoundingClientRect = () => rect(410, 24, 88, 40);

		const dragNode = document.createElement('div');
		dragNode.getBoundingClientRect = () => rect(120, 30, 72, 40);

		const sourceCtx = {
			opts: {},
			nodesByKey: new Map([['latte', dragNode]]),
		} as SortableContext<unknown>;

		const alex = targetCtx(alexColumn, [{ key: 'cake', node: alexChip }], 'vertical');
		const sam = targetCtx(samColumn, [{ key: 'salad', node: samChip }], 'vertical');

		const alexScore = scoreForeignTargetProximity(alex, sourceCtx, 'latte', 130, 44);
		const samScore = scoreForeignTargetProximity(sam, sourceCtx, 'latte', 130, 44);

		expect(alexScore).toBeNull();
		expect(samScore).toBeNull();
	});
});
