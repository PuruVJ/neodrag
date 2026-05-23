import type { Locator } from '@vitest/browser/context';
import { beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { position, transform } from '../../src/interactions/index.ts';
import InteractionsBox from '../components/InteractionsBox.svelte';
import { sleepAndWaitForEffects, translate } from '../utils.ts';

describe('interactions position', () => {
	test('applies initial current position', async () => {
		const comp = render(InteractionsBox, {
			plugins: [transform, position({ current: { x: 40, y: 60 } })],
		});
		const el = comp.getByTestId('draggable');
		await sleepAndWaitForEffects();
		await expect.element(el).toHaveStyle(translate(40, 60));
	});
});
