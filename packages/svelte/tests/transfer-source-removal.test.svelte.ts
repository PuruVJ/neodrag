/**
 * Cross-container transfer must REMOVE the item from the source even when the target defines
 * `onTransfer` that only adds. The engine fires the source list's `onReorder` on transfer; before
 * that fix the item duplicated into both lists. Drives two grouped lists whose onTransfer only adds.
 */
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { pointerDrag, pointerRelease, startCursorTracking, stopCursorTracking } from '../../core/tests/mouse.ts';
import { waitForEffects } from '../../core/tests/utils.ts';
import TransferAddOnlyHarness from './TransferAddOnlyHarness.svelte';

describe('cross-container transfer removes from the source', () => {
	beforeEach(() => startCursorTracking());
	afterEach(() => stopCursorTracking());

	test('add-only onTransfer: item moves to the target, leaves the source (no duplicate)', async () => {
		const comp = render(TransferAddOnlyHarness);
		await waitForEffects();
		expect(comp.component.orderA()).toEqual(['a0', 'a1']);
		expect(comp.component.orderB()).toEqual(['b0', 'b1']);

		// Drag a0 from listA (left) into listB (right ~200px over).
		await pointerDrag(comp.getByTestId('row-a0'), { deltaX: 200, deltaY: 0 }, { steps: 10, release: false });
		await pointerRelease();
		await waitForEffects();

		const a = comp.component.orderA();
		const b = comp.component.orderB();
		expect(a).not.toContain('a0'); // left the source
		expect(b).toContain('a0'); // arrived in the target
		expect(b.filter((id) => id === 'a0')).toHaveLength(1); // exactly once — no duplicate
	});
});
