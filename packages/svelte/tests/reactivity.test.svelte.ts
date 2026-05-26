import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Draggable } from '@neodrag/svelte';
import { position } from '@neodrag/core/plugins';
import SvelteReactiveHarness from './SvelteReactiveHarness.svelte';
import SvelteStaticHarness from './SvelteStaticHarness.svelte';
import { sleepAndWaitForEffects, translate } from '../../core/tests/utils.ts';

describe('@neodrag/svelte reactivity', () => {
	test('static Draggable attachment survives rerender', async () => {
		const comp = render(SvelteStaticHarness, { tick: 0 });
		const el = comp.getByTestId('draggable');
		await sleepAndWaitForEffects();
		await expect.element(el).toHaveStyle(translate(0, 0));
		await comp.rerender({ tick: 1 });
		await sleepAndWaitForEffects();
		await expect.element(el).toHaveStyle(translate(0, 0));
	});

	test('reactive () => position slot updates', async () => {
		const comp = render(SvelteReactiveHarness, { external: { x: 5, y: 10 } });
		const el = comp.getByTestId('draggable');
		await sleepAndWaitForEffects();
		await expect.element(el).toHaveStyle(translate(5, 10));
		await comp.rerender({ external: { x: 30, y: 40 } });
		await sleepAndWaitForEffects();
		await expect.element(el).toHaveStyle(translate(30, 40));
	});

	test('Draggable.attachment is stable', () => {
		const drag = new Draggable({ plugins: [] });
		expect(drag.attachment).toBe(drag.attachment);
	});
});
