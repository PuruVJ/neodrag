import type { Locator } from '@vitest/browser/context';
import { beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { axis, transform } from '../../src/interactions/index.ts';
import InteractionsBox from '../components/InteractionsBox.svelte';
import { dragAndDrop } from '../mouse.ts';
import { sleepAndWaitForEffects, translate } from '../utils.ts';

describe('interactions axis', () => {
	let el: Locator;

	beforeEach(() => {
		const comp = render(InteractionsBox, { plugins: [transform, axis('x')] });
		el = comp.getByTestId('draggable');
	});

	test('locks to x axis', async () => {
		await dragAndDrop(el, { deltaX: 80, deltaY: 80 }, { steps: 5 });
		await sleepAndWaitForEffects();
		await expect.element(el).toHaveStyle(translate(80, 0));
	});
});
