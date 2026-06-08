import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { keysFromList, sortableReorder } from '@neodrag/test';
import { render } from 'vitest-browser-svelte';
import InteractionsSplitBillGrouped from '../components/InteractionsSplitBillGrouped.svelte';
import { startCursorTracking, stopCursorTracking } from '../mouse.ts';
import { sleepAndWaitForEffects } from '../utils.ts';

const RELEASE_MS = 280;

async function afterGesture() {
	await sleepAndWaitForEffects(RELEASE_MS);
}

describe('split bill grouped (tray + friends)', () => {
	beforeEach(() => {
		startCursorTracking();
	});

	afterEach(() => {
		stopCursorTracking();
	});

	test('latte drop on last tray slot commits order (does not snap back to first)', async () => {
		const comp = render(InteractionsSplitBillGrouped, { fastTransition: true });
		const tray = comp.getByTestId('tray-list');
		const alex = comp.getByTestId('alex-list');
		const sam = comp.getByTestId('sam-list');
		const latte = comp.getByTestId('tray-chip-latte');

		expect(await keysFromList(tray)).toEqual(['latte', 'salad', 'cake']);
		expect(await keysFromList(alex)).toEqual([]);
		expect(await keysFromList(sam)).toEqual([]);

		await sortableReorder(latte, 2, tray, { mode: 'fast' });
		await afterGesture();

		expect(await keysFromList(tray)).toEqual(['salad', 'cake', 'latte']);
		expect(await keysFromList(alex)).toEqual([]);
		expect(await keysFromList(sam)).toEqual([]);
		expect(comp.getByTestId('tray-chip-latte')).toBeTruthy();
	});

	test('tray reorder still works when friend columns are present', async () => {
		const comp = render(InteractionsSplitBillGrouped, { fastTransition: true });
		const tray = comp.getByTestId('tray-list');
		const latte = comp.getByTestId('tray-chip-latte');
		const salad = comp.getByTestId('tray-chip-salad');

		await sortableReorder(latte, 1, tray, { mode: 'fast' });
		await afterGesture();

		expect(await keysFromList(tray)).toEqual(['salad', 'latte', 'cake']);
	});
});
