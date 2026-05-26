import type { Locator } from '@vitest/browser/context';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InteractionsSortable from '../components/InteractionsSortable.svelte';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from '../mouse.ts';
import { sleepAndWaitForEffects } from '../utils.ts';

describe('interactions sortable', () => {
	let item1: Locator;
	let item3: Locator;
	let list: Locator;

	beforeEach(() => {
		startCursorTracking();
		const comp = render(InteractionsSortable);
		item1 = comp.getByTestId('item-1');
		item3 = comp.getByTestId('item-3');
		list = comp.getByTestId('list');
	});

	afterEach(() => {
		stopCursorTracking();
	});

	test('drags first item without error', async () => {
		await dragAndDrop(item1, { deltaX: 0, deltaY: 40 }, { steps: 5 });
		const dragEl = await item1.element();
		const t = getComputedStyle(dragEl).translate;
		expect(t).not.toBe('none');
	});

	test('reorders item when dropped on another slot', async () => {
		const item1El = await item1.element();
		const item3El = await item3.element();
		const item1Rect = item1El.getBoundingClientRect();
		const item3Rect = item3El.getBoundingClientRect();

		await dragAndDrop(
			item1,
			{
				deltaX: 0,
				deltaY: item3Rect.top + item3Rect.height / 2 - (item1Rect.top + item1Rect.height / 2),
			},
			{ steps: 12 },
		);
		await sleepAndWaitForEffects();

		const listEl = await list.element();
		const keys = [...listEl.querySelectorAll('[data-sortable-key]')].map((el) =>
			el.getAttribute('data-sortable-key'),
		);
		expect(keys).toEqual(['2', '3', '1']);
	});
});

describe('interactions sortable live preview', () => {
	let item1: Locator;
	let item3: Locator;
	let list: Locator;

	beforeEach(() => {
		startCursorTracking();
		const comp = render(InteractionsSortable, { preview: true });
		item1 = comp.getByTestId('item-1');
		item3 = comp.getByTestId('item-3');
		list = comp.getByTestId('list');
	});

	afterEach(() => {
		stopCursorTracking();
	});

	test('reorders DOM during drag when onSortPreview is set', async () => {
		const item1El = await item1.element();
		const item3El = await item3.element();
		const item1Rect = item1El.getBoundingClientRect();
		const item3Rect = item3El.getBoundingClientRect();

		await dragAndDrop(
			item1,
			{
				deltaX: 0,
				deltaY: item3Rect.top + item3Rect.height / 2 - (item1Rect.top + item1Rect.height / 2),
			},
			{ steps: 8 },
		);

		const listEl = await list.element();
		const keysMid = [...listEl.querySelectorAll('[data-sortable-key]')].map((el) =>
			el.getAttribute('data-sortable-key'),
		);
		expect(keysMid).toEqual(['2', '3', '1']);
	});
});
