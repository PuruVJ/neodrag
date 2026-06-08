import { afterEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InteractionsSortableGrid from '../components/InteractionsSortableGrid.svelte';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from '../mouse.ts';
import { sleep, waitForEffects } from '../utils.ts';

const RELEASE_MS = 250;

async function keysFromGrid(list: { element: () => Promise<Element> }) {
	const el = await list.element();
	return [...el.querySelectorAll('[data-sortable-key]')].map((node) =>
		node.getAttribute('data-sortable-key'),
	);
}

describe('sortable grid', () => {
	afterEach(() => {
		stopCursorTracking();
	});

	test('moves corner cell to opposite corner', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableGrid);
		const grid = comp.getByTestId('grid');
		const a = comp.getByTestId('chip-a');
		const f = comp.getByTestId('chip-f');

		expect(await keysFromGrid(grid)).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);

		const aEl = await a.element();
		const fEl = await f.element();
		const aRect = aEl.getBoundingClientRect();
		const fRect = fEl.getBoundingClientRect();

		await dragAndDrop(
			a,
			{
				deltaX: fRect.left + fRect.width / 2 - (aRect.left + aRect.width / 2),
				deltaY: fRect.top + fRect.height / 2 - (aRect.top + aRect.height / 2),
			},
			{ steps: 16 },
		);
		await sleep(RELEASE_MS);
		await waitForEffects();

		const keys = await keysFromGrid(grid);
		expect(keys[0]).not.toBe('a');
		expect(keys).toContain('a');
		stopCursorTracking();
	});
});
