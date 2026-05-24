import type { Locator } from '@vitest/browser/context';
import { beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { grid } from '../../src/interactions/index.ts';
import InteractionsBox from '../components/InteractionsBox.svelte';
import { dragAndDrop } from '../mouse.ts';
import { sleepAndWaitForEffects, translate } from '../utils.ts';

describe('interactions grid', () => {
	let el: Locator;

	beforeEach(() => {
		const comp = render(InteractionsBox, { plugins: [grid([10, 10])] });
		el = comp.getByTestId('draggable');
	});

	test('snaps to 10px grid', async () => {
		await dragAndDrop(el, { deltaX: 23, deltaY: 27 }, { steps: 5 });
		await sleepAndWaitForEffects();
		await expect.element(el).toHaveStyle(translate(20, 30));
	});
});
