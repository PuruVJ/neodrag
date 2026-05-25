import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Neodrag } from '../../src/index.ts';
import InteractionsBox from '../components/InteractionsBox.svelte';
import { dragAndDrop } from '../mouse.ts';
import { sleepAndWaitForEffects } from '../utils.ts';

describe('large coordinate precision', () => {
	test('small drag delta is preserved at large translate offsets', async () => {
		const engine = new Neodrag({ plugins: [] });
		const comp = render(InteractionsBox, {
			plugins: [],
			engine,
		});
		const box = comp.getByTestId('draggable');
		const el = await box.element();
		el.style.position = 'absolute';
		el.style.left = '1000000px';
		el.style.top = '500000px';

		await dragAndDrop(box, { deltaX: 8, deltaY: -6 }, { steps: 5 });
		await sleepAndWaitForEffects();

		const style = getComputedStyle(el).translate;
		const match = /([\d.+-]+)px\s+([\d.+-]+)px/.exec(style);
		expect(match).not.toBeNull();
		const x = Number.parseFloat(match![1]!);
		const y = Number.parseFloat(match![2]!);
		expect(x).toBeGreaterThan(6);
		expect(x).toBeLessThan(12);
		expect(y).toBeLessThan(-4);
		expect(y).toBeGreaterThan(-8);
	});
});
