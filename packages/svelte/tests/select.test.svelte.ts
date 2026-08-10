import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { dispatchPointer, startCursorTracking, stopCursorTracking } from '../../core/tests/mouse.ts';
import { waitForEffects } from '../../core/tests/utils.ts';
import SelectHarness from './SelectHarness.svelte';

const el = async (l: { element(): Element | Promise<Element> }) => (await l.element()) as HTMLElement;

// End-to-end through the engine: the region is a Draggable running the marqueeSelect plugin. Driving
// it with real pointer events that the engine's installed sensors pick up (not the engine directly).
describe('@neodrag/svelte Selectable (marquee, engine-driven)', () => {
	beforeEach(() => startCursorTracking());
	afterEach(() => stopCursorTracking());

	test('a marquee selects every item it touches, growing and shrinking live', async () => {
		const comp = render(SelectHarness);
		await waitForEffects();
		const grid = await el(comp.getByTestId('grid'));
		const b = grid.getBoundingClientRect();
		const at = (x: number, y: number) => [b.left + x, b.top + y] as const;

		// pointerdown on empty space (items start at 10px), then drag the marquee.
		dispatchPointer(grid, 'pointerdown', ...at(5, 5), 1);
		dispatchPointer(grid, 'pointermove', ...at(60, 60), 1); // box (5,5)-(60,60) → only `a`
		await waitForEffects();
		expect(comp.component.selected()).toEqual(['a']);

		dispatchPointer(grid, 'pointermove', ...at(130, 130), 1); // grow → all three
		await waitForEffects();
		expect(comp.component.selected()).toEqual(['a', 'b', 'c']);

		dispatchPointer(grid, 'pointermove', ...at(55, 55), 1); // shrink → just `a`
		await waitForEffects();
		expect(comp.component.selected()).toEqual(['a']);

		dispatchPointer(grid, 'pointerup', ...at(55, 55), 0);
		expect((await el(comp.getByTestId('item-a'))).hasAttribute('data-neodrag-selected')).toBe(true);
	});
});
