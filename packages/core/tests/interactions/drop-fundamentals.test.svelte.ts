import type { Locator } from '@vitest/browser/context';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { dragData } from '../../src/plugins.ts';
import { accepts, highlight, onDrop } from '../../src/drop/index.ts';
import InteractionsDrop from '../components/InteractionsDrop.svelte';
import InteractionsDropHighlight from '../components/InteractionsDropHighlight.svelte';
import InteractionsDropHitExpand from '../components/InteractionsDropHitExpand.svelte';
import InteractionsDropTransform from '../components/InteractionsDropTransform.svelte';
import {
	dragAndDrop,
	pointerDrag,
	pointerMoveTo,
	pointerRelease,
	startCursorTracking,
	stopCursorTracking,
} from '../mouse.ts';
import { sleepAndWaitForEffects, waitForEffects } from '../utils.ts';

async function centerDelta(draggable: Locator, dropzone: Locator) {
	const dropEl = await dropzone.element();
	const dragEl = await draggable.element();
	const dropRect = dropEl.getBoundingClientRect();
	const dragRect = dragEl.getBoundingClientRect();
	return {
		deltaX: dropRect.left + dropRect.width / 2 - (dragRect.left + dragRect.width / 2),
		deltaY: dropRect.top + dropRect.height / 2 - (dragRect.top + dragRect.height / 2),
	};
}

describe('drop highlight', () => {
	afterEach(() => {
		stopCursorTracking();
	});

	test('adds overClass while pointer is over the zone during drag', async () => {
		startCursorTracking();
		const comp = render(InteractionsDropHighlight);
		const draggable = comp.getByTestId('draggable-accepted');
		const dropzone = comp.getByTestId('dropzone');
		const dropEl = await dropzone.element();
		const delta = await centerDelta(draggable, dropzone);

		await pointerDrag(draggable, { deltaX: delta.deltaX * 0.85, deltaY: delta.deltaY * 0.85 }, {
			steps: 10,
			release: false,
		});
		await waitForEffects();

		expect(dropEl.classList.contains('drop-over')).toBe(true);

		const awayX = dropEl.getBoundingClientRect().right + 40;
		const awayY = dropEl.getBoundingClientRect().top + 20;
		await pointerMoveTo(awayX, awayY, 6);
		await waitForEffects();
		expect(dropEl.classList.contains('drop-over')).toBe(false);

		await pointerRelease();
	});

	test('supports multiple space-separated overClass tokens during drag', async () => {
		startCursorTracking();
		const comp = render(InteractionsDropHighlight, { overClass: 'drop-over drop-extra' });
		const drag = comp.getByTestId('draggable-accepted');
		const zone = comp.getByTestId('dropzone');
		const dropEl = await zone.element();
		const delta = await centerDelta(drag, zone);

		await pointerDrag(drag, delta, { steps: 10, release: false });
		await waitForEffects();

		expect(dropEl.classList.contains('drop-over')).toBe(true);
		expect(dropEl.classList.contains('drop-extra')).toBe(true);
		await pointerRelease();
	});

	test('rejected payload never adds overClass during drag', async () => {
		startCursorTracking();
		const comp = render(InteractionsDropHighlight);
		const rejected = comp.getByTestId('draggable-rejected');
		const zone = comp.getByTestId('dropzone');
		const dropEl = await zone.element();
		const delta = await centerDelta(rejected, zone);

		await pointerDrag(rejected, delta, { steps: 10, release: false });
		await waitForEffects();

		expect(dropEl.classList.contains('drop-over')).toBe(false);
		await pointerRelease();
	});
});

describe('drop accepts', () => {
	afterEach(() => {
		stopCursorTracking();
	});

	test('onDrop does not fire when accepts rejects', async () => {
		stopCursorTracking();
		startCursorTracking();
		const drops: { kind: string }[] = [];
		const comp = render(InteractionsDrop, {
			dragPlugins: [dragData(() => ({ kind: 'wrong' }))],
			dropPlugins: [
				accepts<{ kind: string }>((d) => d.kind === 'card'),
				onDrop((data) => drops.push(data)),
			],
		});
		const draggable = comp.getByTestId('draggable');
		const dropzone = comp.getByTestId('dropzone');
		await pointerDrag(draggable, await centerDelta(draggable, dropzone), { steps: 10 });
		await sleepAndWaitForEffects();
		expect(drops.length).toBe(0);
	});
});

describe('drop hit expand', () => {
	afterEach(() => {
		stopCursorTracking();
	});

	test('highlights when pointer is in expanded padding outside the visual box', async () => {
		startCursorTracking();
		const comp = render(InteractionsDropHitExpand);
		const draggable = comp.getByTestId('draggable');
		const dropzone = comp.getByTestId('dropzone');
		const dropEl = await dropzone.element();
		const dragEl = await draggable.element();
		const dropRect = dropEl.getBoundingClientRect();
		const dragRect = dragEl.getBoundingClientRect();
		const targetX = dropRect.left - 20;
		const targetY = dropRect.top + dropRect.height / 2;

		await pointerDrag(
			draggable,
			{
				deltaX: targetX - (dragRect.left + dragRect.width / 2),
				deltaY: targetY - (dragRect.top + dragRect.height / 2),
			},
			{ steps: 12, release: false },
		);
		await waitForEffects();

		expect(dropEl.classList.contains('drop-over')).toBe(true);
		await pointerRelease();
	});
});

describe('drop with transformed draggable', () => {
	afterEach(() => {
		stopCursorTracking();
	});

	test('highlights zone while dragging a transformed element over it', async () => {
		startCursorTracking();
		const comp = render(InteractionsDropTransform);
		const draggable = comp.getByTestId('draggable');
		const dropzone = comp.getByTestId('dropzone');
		const dropEl = await dropzone.element();
		const delta = await centerDelta(draggable, dropzone);

		await pointerDrag(draggable, delta, { steps: 16, release: false });
		await waitForEffects();

		expect(dropEl.classList.contains('drop-over')).toBe(true);
		await pointerRelease();
	});
});
