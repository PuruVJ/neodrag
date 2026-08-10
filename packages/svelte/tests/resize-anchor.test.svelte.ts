/**
 * A west/north resize must move the *near* edge and pin the far one — not grow symmetrically. The
 * engine compensates `left`/`top` for west/north anchors; this asserts the far (right) edge stays
 * put while the left edge travels.
 */
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	dragAndDrop,
	pointerDrag,
	pointerRelease,
	startCursorTracking,
	stopCursorTracking,
} from '../../core/tests/mouse.ts';
import { waitForEffects } from '../../core/tests/utils.ts';
import ResizeHarness from './ResizeHarness.svelte';

describe('resize anchors the far edge', () => {
	beforeEach(() => startCursorTracking());
	afterEach(() => stopCursorTracking());

	test('west resize moves the left edge and pins the right', async () => {
		const comp = render(ResizeHarness);
		await waitForEffects();
		const box = (await comp.getByTestId('box').element()) as HTMLElement;
		const before = box.getBoundingClientRect();

		await dragAndDrop(comp.getByTestId('w'), { deltaX: -40, deltaY: 0 }, { steps: 6 });
		await waitForEffects();

		const after = box.getBoundingClientRect();
		expect(Math.abs(after.right - before.right)).toBeLessThan(2); // far edge pinned
		expect(after.left).toBeLessThan(before.left - 20); // near edge travelled left
		expect(after.width).toBeGreaterThan(before.width + 20); // grew
	});

	test('resize suppresses body user-select while active, restores it after', async () => {
		const comp = render(ResizeHarness);
		await waitForEffects();
		expect(document.body.style.userSelect).toBe('');

		// Hold the pointer mid-resize, then assert the hack is applied.
		await pointerDrag(comp.getByTestId('e'), { deltaX: 30, deltaY: 0 }, { steps: 4, release: false });
		await waitForEffects();
		expect(document.body.style.userSelect).toBe('none');

		await pointerRelease();
		await waitForEffects();
		expect(document.body.style.userSelect).toBe('');
	});
});
