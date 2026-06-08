import type { Locator } from '@vitest/browser/context';
import { afterEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InteractionsCollisionPriority from '../components/InteractionsCollisionPriority.svelte';
import {
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

describe('collision priority', () => {
	afterEach(() => {
		stopCursorTracking();
	});

	test('high-priority inner droppable wins highlight over outer shell', async () => {
		startCursorTracking();
		const comp = render(InteractionsCollisionPriority);
		const drag = comp.getByTestId('draggable');
		const outer = comp.getByTestId('outer-zone');
		const inner = comp.getByTestId('inner-zone');
		const outerEl = await outer.element();
		const innerEl = await inner.element();
		const delta = await centerDelta(drag, inner);

		await pointerDrag(drag, { deltaX: delta.deltaX * 0.9, deltaY: delta.deltaY * 0.9 }, {
			steps: 12,
			release: false,
		});
		await waitForEffects();

		expect(innerEl.classList.contains('drop-over-inner')).toBe(true);
		expect(outerEl.classList.contains('drop-over-outer')).toBe(false);

		await pointerRelease();
	});
});
