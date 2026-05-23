import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Neodrag } from '../../src/interactions/index.ts';
import ReactivePluginsBox from '../components/ReactivePluginsBox.svelte';
import { sleepAndWaitForEffects, translate } from '../utils.ts';

describe('interactions reactive update cycle', () => {
	test('reactive position prop reapplies without remounting node', async () => {
		const comp = render(ReactivePluginsBox, { engine: new Neodrag() });
		const el = comp.getByTestId('draggable');

		await sleepAndWaitForEffects();
		await expect.element(el).toHaveStyle(translate(0, 0));

		await comp.rerender({ external: { x: 25, y: 35 } });
		await sleepAndWaitForEffects();

		await expect.element(el).toHaveStyle(translate(25, 35));
	});
});
