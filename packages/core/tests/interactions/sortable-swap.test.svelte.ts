import type { Locator } from '@vitest/browser/context';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { applySortableReorder } from '../../src/drop/index.ts';
import InteractionsSortableSwap from '../components/InteractionsSortableSwap.svelte';
import {
	dragAndDrop,
	pointerDrag,
	pointerRelease,
	startCursorTracking,
	stopCursorTracking,
} from '../mouse.ts';
import { sleepAndWaitForEffects, waitForEffects } from '../utils.ts';

async function keysFromList(list: Locator) {
	const el = await list.element();
	return [...el.querySelectorAll('[data-sortable-key]')].map((node) =>
		node.getAttribute('data-sortable-key'),
	);
}

async function dragItemOnto(item: Locator, target: Locator, steps = 12) {
	const itemEl = await item.element();
	const targetEl = await target.element();
	const itemRect = itemEl.getBoundingClientRect();
	const targetRect = targetEl.getBoundingClientRect();
	await dragAndDrop(
		item,
		{
			deltaX: 0,
			deltaY: targetRect.top + targetRect.height / 2 - (itemRect.top + itemRect.height / 2),
		},
		{ steps },
	);
}

describe('applySortableReorder swap', () => {
	test('swaps two items in place', () => {
		const { next } = applySortableReorder(['a', 'b', 'c'], 0, 2, 'swap');
		expect(next).toEqual(['c', 'b', 'a']);
	});
});

describe('interactions sortable swap', () => {
	let item1: Locator;
	let item3: Locator;
	let list: Locator;

	beforeEach(() => {
		startCursorTracking();
		const comp = render(InteractionsSortableSwap);
		item1 = comp.getByTestId('item-1');
		item3 = comp.getByTestId('item-3');
		list = comp.getByTestId('list');
	});

	afterEach(() => {
		stopCursorTracking();
	});

	test('live preview shows swapped order before release', async () => {
		const item1El = await item1.element();
		const item3El = await item3.element();
		const item1Rect = item1El.getBoundingClientRect();
		const item3Rect = item3El.getBoundingClientRect();

		await pointerDrag(
			item1,
			{
				deltaX: 0,
				deltaY: item3Rect.top + item3Rect.height / 2 - (item1Rect.top + item1Rect.height / 2),
			},
			{ steps: 10, release: false },
		);
		await waitForEffects();

		expect(await keysFromList(list)).toEqual(['3', '2', '1']);
		await pointerRelease();
	});

	test('commits swapped order on drop', async () => {
		await dragItemOnto(item1, item3, 14);
		await sleepAndWaitForEffects();
		expect(await keysFromList(list)).toEqual(['3', '2', '1']);
	});
});
