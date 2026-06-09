/**
 * Real-browser proof of the engine settle loop: a magnetic spring keeps animating onto the magnet
 * after the pointer stops moving. The pointer only travels +40px, but the element ends near the
 * magnet at +120 — the extra travel comes from the rAF settle frames the drag capability pumps.
 */
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { pointerDrag, pointerRelease, startCursorTracking, stopCursorTracking } from '../../core/tests/mouse.ts';
import { waitForEffects } from '../../core/tests/utils.ts';
import MagnetHarness from './MagnetHarness.svelte';

const tx = (el: HTMLElement) => parseFloat(el.style.translate) || 0;
const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

describe('magnetic spring — engine settle loop', () => {
	beforeEach(() => startCursorTracking());
	afterEach(() => stopCursorTracking());

	test('keeps travelling to the magnet after the pointer stops', async () => {
		const comp = render(MagnetHarness);
		await waitForEffects();
		const box = (await comp.getByTestId('box').element()) as HTMLElement;

		// grab + jump +40px in one step, then HOLD — so the spring has barely integrated and there's
		// clear travel left for the settle loop to cover.
		await pointerDrag(box, { deltaX: 40, deltaY: 0 }, { steps: 1, release: false });
		const xStopped = tx(box);

		// let the settle loop pump frames with the pointer held still
		for (let i = 0; i < 40; i++) await frame();
		const xSettled = tx(box);

		expect(xSettled).toBeGreaterThan(xStopped); // moved further on its own
		expect(xSettled).toBeGreaterThan(105); // arrived near the magnet (120), past where the finger stopped (40)

		await pointerRelease();
	});
});
