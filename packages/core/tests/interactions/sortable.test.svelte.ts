import type { Locator } from '@vitest/browser/context';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InteractionsSortable from '../components/InteractionsSortable.svelte';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from '../mouse.ts';

describe('interactions sortable', () => {
	let item1: Locator;
	let item3: Locator;

	beforeEach(() => {
		startCursorTracking();
		const comp = render(InteractionsSortable);
		item1 = comp.getByTestId('item-1');
		item3 = comp.getByTestId('item-3');
	});

	afterEach(() => {
		stopCursorTracking();
	});

	test('drags first item without error', async () => {
		await dragAndDrop(item1, { deltaX: 0, deltaY: 40 }, { steps: 5 });
		const dragEl = await item1.element();
		const t = getComputedStyle(dragEl).translate;
		expect(t).not.toBe('none');
	});
});
