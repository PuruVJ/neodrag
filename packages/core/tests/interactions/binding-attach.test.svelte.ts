import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Draggable } from '../../src/index.ts';
import ReactivePluginsBox from '../components/ReactivePluginsBox.svelte';
import StaticDraggableHarness from '../components/StaticDraggableHarness.svelte';
import { sleepAndWaitForEffects, translate } from '../utils.ts';

describe('Draggable binding attach identity', () => {
	test('static plugins survive parent rerender without remounting translate', async () => {
		const comp = render(StaticDraggableHarness, { external: 0 });
		const el = comp.getByTestId('draggable');

		await sleepAndWaitForEffects();
		await expect.element(el).toHaveStyle(translate(0, 0));

		await comp.rerender({ external: 1 });
		await sleepAndWaitForEffects();
		await expect.element(el).toHaveStyle(translate(0, 0));
	});

	test('reactive slot updates position on external change', async () => {
		const comp = render(ReactivePluginsBox, { external: { x: 10, y: 20 } });
		const el = comp.getByTestId('draggable');
		await sleepAndWaitForEffects();
		await expect.element(el).toHaveStyle(translate(10, 20));

		await comp.rerender({ external: { x: 40, y: 50 } });
		await sleepAndWaitForEffects();
		await expect.element(el).toHaveStyle(translate(40, 50));
	});

	test('Draggable.attachment is stable reference', () => {
		const drag = new Draggable({ plugins: [] });
		const a = drag.attachment;
		const b = drag.attachment;
		expect(a).toBe(b);
	});
});
