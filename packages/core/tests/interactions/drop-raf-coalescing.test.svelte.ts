import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InteractionsDropRafSpy from '../components/InteractionsDropRafSpy.svelte';
import { sleepAndWaitForEffects } from '../utils.ts';

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

function pointer(
	target: EventTarget,
	type: string,
	x: number,
	y: number,
	extra: PointerEventInit = {},
) {
	target.dispatchEvent(
		new PointerEvent(type, {
			bubbles: true,
			cancelable: true,
			pointerId: 1,
			pointerType: 'mouse',
			isPrimary: true,
			clientX: x,
			clientY: y,
			buttons: type === 'pointerup' ? 0 : 1,
			...extra,
		}),
	);
}

describe('drop rAF coalescing (browser)', () => {
	let restoreCapture: (() => void) | undefined;

	beforeEach(() => {
		restoreCapture = patchPointerCapture();
	});

	afterEach(() => {
		restoreCapture?.();
	});

	test('batches drop over hooks until animation frame', async () => {
		const comp = render(InteractionsDropRafSpy);
		const box = await comp.getByTestId('draggable').element();
		const count = comp.getByTestId('over-count');

		const rect = box.getBoundingClientRect();
		const startX = rect.left + rect.width / 2;
		const startY = rect.top + rect.height / 2;

		pointer(box, 'pointerdown', startX, startY);
		for (let y = startY + 10; y <= startY + 80; y += 10) {
			pointer(document.documentElement, 'pointermove', startX + 40, y);
		}

		await expect.element(count).toHaveTextContent('0');

		await sleepAndWaitForEffects();

		const after = Number((await count.element()).textContent);
		expect(after).toBeGreaterThanOrEqual(1);

		pointer(document.documentElement, 'pointerup', startX + 40, startY + 80);
	});
});
