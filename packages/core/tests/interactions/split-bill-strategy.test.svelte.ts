import type { Locator } from '@vitest/browser/context';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InteractionsSplitBillStrategy from '../components/InteractionsSplitBillStrategy.svelte';
import {
	dragAndDrop,
	pointerDrag,
	pointerRelease,
	startCursorTracking,
	stopCursorTracking,
} from '../mouse.ts';
import { sleep, waitForEffects } from '../utils.ts';

const RELEASE_MS = 250;

async function transformX(locator: Locator) {
	const el = await locator.element();
	const raw = getComputedStyle(el).transform;
	if (!raw || raw === 'none') return 0;
	return new DOMMatrix(raw).m41;
}

async function isFixed(locator: Locator) {
	return getComputedStyle(await locator.element()).position === 'fixed';
}

async function hasClearedDisplacement(locator: Locator) {
	const el = await locator.element();
	const style = getComputedStyle(el);
	if (style.transform !== 'none' && style.transform !== '') return false;
	return !el.hasAttribute('data-neodrag-sortable-displaced');
}

async function keysFromList(list: Locator) {
	const el = await list.element();
	return [...el.querySelectorAll('[data-sortable-key]')].map((node) =>
		node.getAttribute('data-sortable-key'),
	);
}

async function dragChipTo(chip: Locator, target: Locator) {
	const chipEl = await chip.element();
	const targetEl = await target.element();
	const chipRect = chipEl.getBoundingClientRect();
	const targetRect = targetEl.getBoundingClientRect();
	const targetX = targetRect.left + targetRect.width - 4;
	await dragAndDrop(
		chip,
		{
			deltaX: targetX - (chipRect.left + chipRect.width / 2),
			deltaY: 0,
		},
		{ steps: 16 },
	);
	await sleep(RELEASE_MS);
	await waitForEffects();
}

describe('split bill strategy isolation', () => {
	test('global strategy from narrow friend breaks horizontal tray reorder', async () => {
		startCursorTracking();
		const comp = render(InteractionsSplitBillStrategy, { usePerZone: false });
		const list = comp.getByTestId('tray-list');
		const latte = comp.getByTestId('chip-latte');
		const cake = comp.getByTestId('chip-cake');

		expect(await keysFromList(list)).toEqual(['latte', 'salad', 'cake']);
		await dragChipTo(latte, cake);
		expect(await keysFromList(list)).toEqual(['latte', 'salad', 'cake']);
		stopCursorTracking();
	});

	test('per-zone: last chip first drag has no ~85px horizontal jump', async () => {
		startCursorTracking();
		const comp = render(InteractionsSplitBillStrategy, { usePerZone: true });
		const cake = comp.getByTestId('chip-cake');

		const beforeLeft = (await cake.element()).getBoundingClientRect().left;
		const end = await pointerDrag(cake, { deltaX: 4, deltaY: 0 }, { steps: 2, release: false });
		await waitForEffects();

		const afterLeft = (await cake.element()).getBoundingClientRect().left;
		expect(Math.abs(afterLeft - beforeLeft)).toBeLessThan(8);
		expect(Math.abs(await transformX(cake))).toBeLessThan(4);

		await pointerRelease(end.x, end.y);
		await sleep(RELEASE_MS);
		await waitForEffects();
		stopCursorTracking();
	});

	test('per-zone: last chip drag start has no ~100px horizontal offset after reorder', async () => {
		startCursorTracking();
		const comp = render(InteractionsSplitBillStrategy, { usePerZone: true });
		const list = comp.getByTestId('tray-list');
		const latte = comp.getByTestId('chip-latte');
		const cake = comp.getByTestId('chip-cake');

		await dragChipTo(latte, cake);
		await sleep(RELEASE_MS);
		await waitForEffects();
		expect(await keysFromList(list)).toEqual(['salad', 'cake', 'latte']);
		expect(await hasClearedDisplacement(cake)).toBe(true);

		const cakeEl = await cake.element();
		const beforeLeft = cakeEl.getBoundingClientRect().left;
		const end = await pointerDrag(cake, { deltaX: 4, deltaY: 0 }, { steps: 2, release: false });
		await waitForEffects();

		const afterLeft = (await cake.element()).getBoundingClientRect().left;
		const centerX = afterLeft + (await cake.element()).getBoundingClientRect().width / 2;
		expect(Math.abs(afterLeft - beforeLeft)).toBeLessThan(8);
		expect(Math.abs(centerX - end.x)).toBeLessThan(24);
		expect(Math.abs(await transformX(cake))).toBeLessThan(4);

		await pointerRelease(end.x, end.y);
		await sleep(RELEASE_MS);
		await waitForEffects();
		stopCursorTracking();
	});

	test('per-zone: lifted chip stays at pointer when row has will-change transform', async () => {
		startCursorTracking();
		const comp = render(InteractionsSplitBillStrategy, { usePerZone: true });
		const latte = comp.getByTestId('chip-latte');

		const end = await pointerDrag(latte, { deltaX: 4, deltaY: 0 }, { steps: 2, release: false });
		await waitForEffects();

		const el = await latte.element();
		const rect = el.getBoundingClientRect();
		const centerY = rect.top + rect.height / 2;
		expect(Math.abs(centerY - end.y)).toBeLessThan(12);

		await pointerRelease(end.x, end.y);
		await sleep(RELEASE_MS);
		await waitForEffects();
		stopCursorTracking();
	});

	test('per-zone: first chip has no vertical jump on drag start', async () => {
		startCursorTracking();
		const comp = render(InteractionsSplitBillStrategy, { usePerZone: true });
		const latte = comp.getByTestId('chip-latte');

		const beforeTop = (await latte.element()).getBoundingClientRect().top;
		const end = await pointerDrag(latte, { deltaX: 4, deltaY: 0 }, { steps: 2, release: false });
		await waitForEffects();
		const afterTop = (await latte.element()).getBoundingClientRect().top;
		expect(Math.abs(afterTop - beforeTop)).toBeLessThan(3);

		await pointerRelease(end.x, end.y);
		await sleep(RELEASE_MS);
		await waitForEffects();
		stopCursorTracking();
	});

	test('per-zone: drag does not use fixed lift', async () => {
		startCursorTracking();
		const comp = render(InteractionsSplitBillStrategy, { usePerZone: true });
		const latte = comp.getByTestId('chip-latte');

		await pointerDrag(latte, { deltaX: 4, deltaY: 0 }, { steps: 2, release: false });
		await waitForEffects();

		expect(await isFixed(latte)).toBe(false);

		await pointerRelease((await latte.element()).getBoundingClientRect().left + 4, 41);
		await sleep(RELEASE_MS);
		await waitForEffects();
		stopCursorTracking();
	});

	test('per-zone: dragging first chip does not reflow sibling flex positions', async () => {
		startCursorTracking();
		const comp = render(InteractionsSplitBillStrategy, { usePerZone: true });
		const latte = comp.getByTestId('chip-latte');
		const salad = comp.getByTestId('chip-salad');
		const cake = comp.getByTestId('chip-cake');

		const saladBefore = (await salad.element()).offsetLeft;
		const cakeBefore = (await cake.element()).offsetLeft;

		const end = await pointerDrag(latte, { deltaX: 6, deltaY: 0 }, { steps: 4, release: false });
		await waitForEffects();

		const saladDuring = (await salad.element()).offsetLeft;
		const cakeDuring = (await cake.element()).offsetLeft;
		expect(Math.abs(saladDuring - saladBefore)).toBeLessThan(2);
		expect(Math.abs(cakeDuring - cakeBefore)).toBeLessThan(2);

		await pointerRelease(end.x, end.y);
		await sleep(RELEASE_MS);
		await waitForEffects();
		stopCursorTracking();
	});

	test('per-zone: siblings have no displacement transform after drop commit', async () => {
		startCursorTracking();
		const comp = render(InteractionsSplitBillStrategy, { usePerZone: true });
		const latte = comp.getByTestId('chip-latte');
		const salad = comp.getByTestId('chip-salad');
		const cake = comp.getByTestId('chip-cake');

		await dragChipTo(latte, cake);
		await sleep(RELEASE_MS);
		await waitForEffects();

		for (const chip of [salad, cake, latte]) {
			expect(await hasClearedDisplacement(chip)).toBe(true);
		}
		stopCursorTracking();
	});

	test('per-zone: latte drop after salad does not restore first slot', async () => {
		startCursorTracking();
		const comp = render(InteractionsSplitBillStrategy, { usePerZone: true });
		const list = comp.getByTestId('tray-list');
		const latte = comp.getByTestId('chip-latte');
		const salad = comp.getByTestId('chip-salad');

		expect(await keysFromList(list)).toEqual(['latte', 'salad', 'cake']);
		await dragChipTo(latte, salad);
		await sleep(RELEASE_MS);
		await waitForEffects();

		expect(await keysFromList(list)).not.toEqual(['latte', 'salad', 'cake']);
		expect(await keysFromList(list)).toEqual(['salad', 'latte', 'cake']);
		stopCursorTracking();
	});

	test('per-zone: first chip release lands on second slot not third', async () => {
		startCursorTracking();
		const comp = render(InteractionsSplitBillStrategy, { usePerZone: true });
		const list = comp.getByTestId('tray-list');
		const latte = comp.getByTestId('chip-latte');
		const salad = comp.getByTestId('chip-salad');

		expect(await keysFromList(list)).toEqual(['latte', 'salad', 'cake']);
		await dragChipTo(latte, salad);
		await sleep(RELEASE_MS);
		await waitForEffects();

		expect(await keysFromList(list)).toEqual(['salad', 'latte', 'cake']);

		stopCursorTracking();
	});

	test('per-zone: cake stays third after latte moves from third to second', async () => {
		startCursorTracking();
		const comp = render(InteractionsSplitBillStrategy, { usePerZone: true });
		const list = comp.getByTestId('tray-list');
		const latte = comp.getByTestId('chip-latte');
		const salad = comp.getByTestId('chip-salad');

		expect(await keysFromList(list)).toEqual(['latte', 'salad', 'cake']);
		await dragChipTo(latte, salad);
		await sleep(RELEASE_MS);
		await waitForEffects();
		expect(await keysFromList(list)).toEqual(['salad', 'latte', 'cake']);

		stopCursorTracking();
	});

	test('per-zone: latte stays aligned after latte/cake reorder cycle', async () => {
		startCursorTracking();
		const comp = render(InteractionsSplitBillStrategy, { usePerZone: true });
		const latte = comp.getByTestId('chip-latte');
		const salad = comp.getByTestId('chip-salad');
		const cake = comp.getByTestId('chip-cake');

		await dragChipTo(latte, cake);
		await dragChipTo(latte, salad);
		await dragChipTo(cake, salad);
		await sleep(RELEASE_MS);
		await waitForEffects();

		const latteEl = await latte.element();
		expect(latteEl.style.left).toBe('');
		expect(Math.abs(await transformX(latte))).toBeLessThan(4);

		const beforeLeft = latteEl.getBoundingClientRect().left;
		const end = await pointerDrag(latte, { deltaX: 3, deltaY: 0 }, { steps: 2, release: false });
		await waitForEffects();
		const afterLeft = (await latte.element()).getBoundingClientRect().left;
		expect(Math.abs(afterLeft - beforeLeft)).toBeLessThan(8);
		expect(
			Math.abs(afterLeft + (await latte.element()).getBoundingClientRect().width / 2 - end.x),
		).toBeLessThan(12);

		await pointerRelease(end.x, end.y);
		await sleep(RELEASE_MS);
		await waitForEffects();
		stopCursorTracking();
	});

	test('per-zone: cake stays aligned after several tray drags', async () => {
		startCursorTracking();
		const comp = render(InteractionsSplitBillStrategy, { usePerZone: true });
		const list = comp.getByTestId('tray-list');
		const latte = comp.getByTestId('chip-latte');
		const salad = comp.getByTestId('chip-salad');
		const cake = comp.getByTestId('chip-cake');

		await dragChipTo(latte, salad);
		await dragChipTo(cake, latte);
		await dragChipTo(salad, cake);
		await sleep(RELEASE_MS);
		await waitForEffects();

		const cakeEl = await cake.element();
		expect(cakeEl.style.left).toBe('');
		expect(cakeEl.style.position).not.toBe('fixed');
		expect(Math.abs(await transformX(cake))).toBeLessThan(4);

		const beforeLeft = cakeEl.getBoundingClientRect().left;
		const end = await pointerDrag(cake, { deltaX: 3, deltaY: 0 }, { steps: 2, release: false });
		await waitForEffects();
		const afterLeft = (await cake.element()).getBoundingClientRect().left;
		expect(Math.abs(afterLeft - beforeLeft)).toBeLessThan(8);
		expect(Math.abs(afterLeft + (await cake.element()).getBoundingClientRect().width / 2 - end.x)).toBeLessThan(
			12,
		);

		await pointerRelease(end.x, end.y);
		await sleep(RELEASE_MS);
		await waitForEffects();
		stopCursorTracking();
	});

	test('per-zone strategy keeps horizontal tray reorder correct when friend is narrow', async () => {
		startCursorTracking();
		const comp = render(InteractionsSplitBillStrategy, { usePerZone: true });
		const list = comp.getByTestId('tray-list');
		const latte = comp.getByTestId('chip-latte');
		const cake = comp.getByTestId('chip-cake');

		expect(await keysFromList(list)).toEqual(['latte', 'salad', 'cake']);
		await dragChipTo(latte, cake);
		expect(await keysFromList(list)).toEqual(['salad', 'cake', 'latte']);
		stopCursorTracking();
	});
});
