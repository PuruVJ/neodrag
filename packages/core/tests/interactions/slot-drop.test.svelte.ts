import type { Locator } from '@vitest/browser/context';
import { afterEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InteractionsSlotDrop from '../components/InteractionsSlotDrop.svelte';
import {
	dragAndDrop,
	pointerDrag,
	pointerRelease,
	startCursorTracking,
	stopCursorTracking,
} from '../mouse.ts';
import { waitForEffects } from '../utils.ts';

async function centerDelta(draggable: Locator, dropzone: Locator) {
	const dragEl = await draggable.element();
	const zoneEl = await dropzone.element();
	const dragRect = dragEl.getBoundingClientRect();
	const zoneRect = zoneEl.getBoundingClientRect();
	return {
		deltaX: zoneRect.left + zoneRect.width / 2 - (dragRect.left + dragRect.width / 2),
		deltaY: zoneRect.top + zoneRect.height / 2 - (dragRect.top + dragRect.height / 2),
	};
}

describe('slot drop', () => {
	afterEach(() => {
		stopCursorTracking();
	});

	test('tray chip commits to alex slot on first drop', async () => {
		startCursorTracking();
		const comp = render(InteractionsSlotDrop);
		const chip = comp.getByTestId('tray-chip');
		const slot = comp.getByTestId('alex-slot');
		const delta = await centerDelta(chip, slot);

		await dragAndDrop(chip, delta, { steps: 14 });
		await waitForEffects();

		expect(comp.getByTestId('alex-chip')).toBeTruthy();
		const slotEl = await slot.element();
		expect(slotEl.dataset.dropped).toBe('true');
	});

	test('highlights slot while pointer is over during drag', async () => {
		startCursorTracking();
		const comp = render(InteractionsSlotDrop);
		const chip = comp.getByTestId('tray-chip');
		const slot = comp.getByTestId('alex-slot');
		const slotEl = await slot.element();
		const delta = await centerDelta(chip, slot);

		await pointerDrag(chip, { deltaX: delta.deltaX * 0.85, deltaY: delta.deltaY * 0.85 }, {
			steps: 10,
			release: false,
		});
		await waitForEffects();
		expect(slotEl.classList.contains('drop-over')).toBe(true);
		await pointerRelease();
	});
});
