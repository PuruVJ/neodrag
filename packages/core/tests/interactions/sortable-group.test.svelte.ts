import type { Locator } from '@vitest/browser/context';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InteractionsSortableKanban from '../components/InteractionsSortableKanban.svelte';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from '../mouse.ts';
import { sleepAndWaitForEffects } from '../utils.ts';

async function dragCardOnto(card: Locator, targetList: Locator) {
	const cardEl = await card.element();
	const listEl = await targetList.element();
	const cardRect = cardEl.getBoundingClientRect();
	const listRect = listEl.getBoundingClientRect();
	await dragAndDrop(
		card,
		{
			deltaX: listRect.left + listRect.width / 2 - (cardRect.left + cardRect.width / 2),
			deltaY: listRect.top + listRect.height / 2 - (cardRect.top + cardRect.height / 2),
		},
		{ steps: 16 },
	);
	await sleepAndWaitForEffects();
}

async function keysInList(list: Locator) {
	const el = await list.element();
	return [...el.querySelectorAll('[data-sortable-key]')].map((node) =>
		node.getAttribute('data-sortable-key'),
	);
}

describe('interactions sortable group', () => {
	let card1: Locator;
	let card2: Locator;
	let card3: Locator;
	let listA: Locator;
	let listB: Locator;
	let columnA: Locator;
	let columnB: Locator;

	beforeEach(() => {
		startCursorTracking();
		const comp = render(InteractionsSortableKanban);
		card1 = comp.getByTestId('card-1');
		card2 = comp.getByTestId('card-2');
		card3 = comp.getByTestId('card-3');
		listA = comp.getByTestId('list-a');
		listB = comp.getByTestId('list-b');
		columnA = comp.getByTestId('column-a');
		columnB = comp.getByTestId('column-b');
	});

	afterEach(() => {
		stopCursorTracking();
	});

	test('moves a card into another column on drop', async () => {
		expect(await keysInList(listA)).toEqual(['1', '2']);
		expect(await keysInList(listB)).toEqual(['3']);

		await dragCardOnto(card1, columnB);

		expect(await keysInList(listA)).toEqual(['2']);
		expect(await keysInList(listB)).toEqual(['3', '1']);
	});

	test('moves a card back to its original column', async () => {
		await dragCardOnto(card3, columnA);
		expect(await keysInList(listB)).toEqual([]);
		expect(await keysInList(listA)).toEqual(['1', '2', '3']);

		await dragCardOnto(card3, columnB);
		expect(await keysInList(listA)).toEqual(['1', '2']);
		expect(await keysInList(listB)).toEqual(['3']);
	});

	test('reorders within the same column', async () => {
		const item1El = await card1.element();
		const item2El = await card2.element();
		const r1 = item1El.getBoundingClientRect();
		const r2 = item2El.getBoundingClientRect();

		await dragAndDrop(
			card1,
			{ deltaX: 0, deltaY: r2.top + r2.height / 2 - (r1.top + r1.height / 2) },
			{ steps: 14 },
		);
		await sleepAndWaitForEffects();

		expect(await keysInList(listA)).toEqual(['2', '1']);
	});
});
