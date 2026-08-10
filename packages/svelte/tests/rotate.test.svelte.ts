/**
 * The Svelte `Rotatable` wrapper drives the core rotate capability through a real attachment +
 * handle. Dragging the grip in an arc around the panel's center rotates it (CSS `rotate` property)
 * and toggles `isRotating`.
 */
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Rotatable } from '@neodrag/svelte/rotate';
import { pointerDrag, startCursorTracking, stopCursorTracking } from '../../core/tests/mouse.ts';
import { sleepAndWaitForEffects } from '../../core/tests/utils.ts';
import RotatableHarness from './RotatableHarness.svelte';

describe('@neodrag/svelte Rotatable', () => {
	test('is exported from the public surface', () => {
		expect(Rotatable).toBeTypeOf('function');
	});
});

describe('@neodrag/svelte rotatable wrapper', () => {
	beforeEach(() => startCursorTracking());
	afterEach(() => stopCursorTracking());

	test('dragging the grip rotates the node through the wrapper attach + handle', async () => {
		const comp = render(RotatableHarness);
		const boxLoc = comp.getByTestId('box');
		await sleepAndWaitForEffects();
		const box = (await boxLoc.element()) as HTMLElement;

		expect(box.style.rotate || '').toBe('');

		// Swing the grip down-and-right through a wide arc — a clear, non-zero rotation. The node's
		// CSS `rotate` channel is the capability's direct output, proving the Svelte wrapper wired
		// `{...rotate.attach}` (the bound node) and `{...rotate.handle('top')}` (the grip) end to end.
		await pointerDrag(comp.getByTestId('grip'), { deltaX: 90, deltaY: 90 }, { steps: 8 });
		await sleepAndWaitForEffects();

		const deg = parseFloat(box.style.rotate);
		expect(Number.isFinite(deg)).toBe(true);
		expect(Math.abs(deg)).toBeGreaterThan(10);
		// The wrapper's reactive `isRotating` settles back to rest after release.
		await expect.element(boxLoc).toHaveAttribute('data-rotating', 'false');
	});
});
