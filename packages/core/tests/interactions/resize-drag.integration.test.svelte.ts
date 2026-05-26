import type { Locator } from '@vitest/browser/context';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ResizeDragTest from '../components/ResizeDragTest.svelte';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from '../mouse.ts';
import { sleepAndWaitForEffects, translate } from '../utils.ts';

function patchPointerCapture() {
	const proto = HTMLElement.prototype;
	const prev = {
		set: proto.setPointerCapture,
		release: proto.releasePointerCapture,
		has: proto.hasPointerCapture,
	};
	proto.setPointerCapture = function () {};
	proto.releasePointerCapture = function () {};
	proto.hasPointerCapture = () => false;
	return () => {
		proto.setPointerCapture = prev.set;
		proto.releasePointerCapture = prev.release;
		proto.hasPointerCapture = prev.has;
	};
}

describe('resize + drag integration', () => {
	let restoreCapture: (() => void) | undefined;

	beforeEach(() => {
		restoreCapture = patchPointerCapture();
		startCursorTracking();
	});

	afterEach(() => {
		restoreCapture?.();
		stopCursorTracking();
	});

	test('resizes from east handle then drags from drag handle', async () => {
		const comp = render(ResizeDragTest);
		const card = comp.getByTestId('card');
		const dragHandle = comp.getByText('drag');

		const cardEl = await card.element();
		const startWidth = cardEl.getBoundingClientRect().width;
		const resizeEl = cardEl.querySelector('[data-neodrag-resize-handle="e"]') as HTMLElement;
		expect(resizeEl).toBeTruthy();

		const handleRect = resizeEl.getBoundingClientRect();
		const fromX = handleRect.left + handleRect.width / 2;
		const fromY = handleRect.top + handleRect.height / 2;

		resizeEl.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				clientX: fromX,
				clientY: fromY,
				pointerId: 1,
				button: 0,
			}),
		);
		document.documentElement.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: fromX + 50,
				clientY: fromY,
				pointerId: 1,
			}),
		);
		document.documentElement.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: fromX + 50,
				clientY: fromY,
				pointerId: 1,
			}),
		);
		await sleepAndWaitForEffects();

		expect(cardEl.getBoundingClientRect().width).toBeGreaterThan(startWidth + 20);

		await dragAndDrop(dragHandle, { deltaX: 30, deltaY: 0 }, { steps: 8 });
		await sleepAndWaitForEffects();

		await expect.element(card).toHaveStyle(translate(30, 0));
	});
});
