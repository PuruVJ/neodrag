import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Neodrag, position, events } from '../../src/interactions/index.ts';
import TwoWayBindingBox from '../components/TwoWayBindingBox.svelte';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from '../mouse.ts';
import { sleepAndWaitForEffects, translate } from '../utils.ts';

beforeEach(() => {
	startCursorTracking();
});

afterEach(() => {
	stopCursorTracking();
});

describe('interactions two-way binding', () => {
	test('syncs drag offset into reactive position state', async () => {
		const comp = render(TwoWayBindingBox, { initial: { x: 0, y: 0 } });
		const el = comp.getByTestId('draggable');

		await dragAndDrop(el, { deltaX: 60, deltaY: 40 }, { steps: 12 });
		await sleepAndWaitForEffects();

		const node = await el.element();
		const style = getComputedStyle(node as HTMLElement).translate;
		const parts = style.split(/\s+/);
		const x = Number.parseFloat(parts[0]!);
		const y = Number.parseFloat(parts[1]!);
		expect(Math.abs(x - 60)).toBeLessThan(12);
		expect(Math.abs(y - 40)).toBeLessThan(12);
	});

	test('applies external position changes while idle', async () => {
		const comp = render(TwoWayBindingBox, { initial: { x: 0, y: 0 }, external: null });
		const el = comp.getByTestId('draggable');

		await comp.rerender({ external: { x: 80, y: 90 } });
		await sleepAndWaitForEffects();

		await expect.element(el).toHaveStyle(translate(80, 90));
	});
});

describe('interactions two-way binding without feedback', () => {
	test('one-way position binding still drags', async () => {
		const comp = render(TwoWayBindingBox, {
			initial: { x: 10, y: 10 },
			twoWay: false,
		});
		const el = comp.getByTestId('draggable');

		await sleepAndWaitForEffects();
		await dragAndDrop(el, { deltaX: 30, deltaY: 20 }, { steps: 5 });
		await sleepAndWaitForEffects();

		await expect.element(el).toHaveStyle(translate(40, 30));
	});
});
