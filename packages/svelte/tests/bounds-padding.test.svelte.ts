/**
 * Real-browser test for `bounds: { target, padding }`: dragging far past the parent stops the box
 * one padding inside the parent's edges.
 */
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from '../../core/tests/mouse.ts';
import { waitForEffects } from '../../core/tests/utils.ts';
import BoundsHarness from './BoundsHarness.svelte';

describe('bounds { target, padding }', () => {
	beforeEach(() => startCursorTracking());
	afterEach(() => stopCursorTracking());

	test('clamps the box one padding inside the parent', async () => {
		const comp = render(BoundsHarness);
		await waitForEffects();
		const box = (await comp.getByTestId('box').element()) as HTMLElement;
		const parent = (await comp.getByTestId('parent').element()) as HTMLElement;

		await dragAndDrop(box, { deltaX: 400, deltaY: 400 }, { steps: 8 });
		await waitForEffects();

		const b = box.getBoundingClientRect();
		const p = parent.getBoundingClientRect();
		expect(b.right).toBeLessThanOrEqual(p.right - 16 + 1);
		expect(b.bottom).toBeLessThanOrEqual(p.bottom - 16 + 1);
	});
});
