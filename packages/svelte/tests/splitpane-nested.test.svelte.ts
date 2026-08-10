import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from '../../core/tests/mouse.ts';
import { waitForEffects } from '../../core/tests/utils.ts';
import NestedSplitPaneHarness from './NestedSplitPaneHarness.svelte';

// Nesting: an inner SplitPane inside an outer pane. The two are independent — dragging one's gutter
// resizes only that split, never the other (separate controllers, and the engine routes a gutter
// pointerdown to the innermost draggable on the composedPath).
describe('@neodrag/svelte SplitPane — nested', () => {
	beforeEach(() => startCursorTracking());
	afterEach(() => stopCursorTracking());

	test('dragging the inner gutter resizes only the inner split', async () => {
		const comp = render(NestedSplitPaneHarness);
		await waitForEffects();
		expect(comp.component.outerSizes()).toEqual([1, 1]);
		expect(comp.component.innerSizes()).toEqual([1, 1]);

		await dragAndDrop(comp.getByTestId('i-gutter'), { deltaX: 0, deltaY: 30 }, { steps: 6 });
		await waitForEffects();

		const [it, ib] = comp.component.innerSizes();
		expect(it).toBeGreaterThan(ib); // inner top grew
		expect(comp.component.outerSizes()).toEqual([1, 1]); // outer untouched
	});

	test('dragging the outer gutter resizes only the outer split', async () => {
		const comp = render(NestedSplitPaneHarness);
		await waitForEffects();

		await dragAndDrop(comp.getByTestId('o-gutter'), { deltaX: 30, deltaY: 0 }, { steps: 6 });
		await waitForEffects();

		const [ol, or] = comp.component.outerSizes();
		expect(ol).toBeGreaterThan(or); // outer left grew
		expect(comp.component.innerSizes()).toEqual([1, 1]); // inner untouched
	});
});
