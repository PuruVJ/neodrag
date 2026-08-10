/**
 * The adapters expose a reactive `offset` getter (alongside `isDragging`) and a typed `handle(edge)`
 * helper. This locks the `offset` API surface + initial value; the live wiring is identical to
 * `isDragging` (production-verified) — `onDrag` writes `e.offset` into the reactive field each move.
 * (Mid-drag reactive *values* aren't asserted here for the same reason the `isDragging` suite only
 * checks the at-rest state: class-`$state`-via-getter updates from out-of-band pointer events don't
 * reflect in this render harness. `handle()` is exercised live by the resize-anchor suite.)
 */
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { waitForEffects } from '../../core/tests/utils.ts';
import DragOffsetHarness from './DragOffsetHarness.svelte';

describe('adapter reactive offset', () => {
	test('exposes an offset getter starting at the origin', async () => {
		const comp = render(DragOffsetHarness);
		await waitForEffects();
		await expect.element(comp.getByTestId('offset')).toHaveTextContent('0,0');
	});
});
