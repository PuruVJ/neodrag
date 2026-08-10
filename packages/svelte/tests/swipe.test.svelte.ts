import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { resolveSwipe } from '@neodrag/svelte/swipe';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from '../../core/tests/mouse.ts';
import { sleep, waitForEffects } from '../../core/tests/utils.ts';
import SwipeHarness from './SwipeHarness.svelte';

describe('resolveSwipe', () => {
	test('fraction threshold: dismisses past 40% of the size', () => {
		expect(resolveSwipe(50, 120, 0.4)).toEqual({ dismissed: true, direction: 1 }); // 50 ≥ 48
		expect(resolveSwipe(-50, 120, 0.4)).toEqual({ dismissed: true, direction: -1 });
		expect(resolveSwipe(30, 120, 0.4)).toEqual({ dismissed: false }); // 30 < 48
	});
	test('absolute px threshold (> 1)', () => {
		expect(resolveSwipe(90, 300, 80)).toEqual({ dismissed: true, direction: 1 });
		expect(resolveSwipe(70, 300, 80)).toEqual({ dismissed: false });
	});
});

describe('@neodrag/svelte Swipeable', () => {
	beforeEach(() => startCursorTracking());
	afterEach(() => stopCursorTracking());

	test('a swipe past the threshold dismisses (and reports the direction)', async () => {
		const comp = render(SwipeHarness);
		await waitForEffects();
		// width 120, threshold 0.4 → 48px; drag 80px right.
		await dragAndDrop(comp.getByTestId('card'), { deltaX: 80, deltaY: 0 }, { steps: 6 });
		expect(comp.component.isDismissed()).toBe(true);
		await sleep(80); // let the settle timeout fire onDismiss
		expect(comp.component.dismissedDir()).toBe(1);
	});

	test('a short swipe springs back (not dismissed)', async () => {
		const comp = render(SwipeHarness);
		await waitForEffects();
		await dragAndDrop(comp.getByTestId('card'), { deltaX: 20, deltaY: 0 }, { steps: 4 }); // 20 < 48
		expect(comp.component.isDismissed()).toBe(false);
		await sleep(80); // settle animation completes
		expect(Math.abs(comp.component.offsetX())).toBeLessThan(1); // returned to rest
	});
});
