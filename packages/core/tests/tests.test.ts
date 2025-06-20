import { type Locator } from '@vitest/browser/context';
import { afterEach, beforeEach, describe, expect, it, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { axis, Compartment, position } from '../../svelte/src/index.svelte';
import Box from './components/Box.svelte';
import CompartmentComp from './components/Compartment.svelte';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from './mouse';
import { sleepAndWaitForEffects, translate } from './utils';

beforeEach(() => {
	startCursorTracking();
});

afterEach(() => {
	stopCursorTracking();
});

describe('defaults', () => {
	let draggable: Locator;

	beforeEach(() => {
		const comp = render(Box);
		draggable = comp.getByTestId('draggable');
	});

	test('renders a basic div with default class', async () => {
		await expect.element(draggable).toHaveStyle(translate(0, 0));
	});

	test('should be dragged by mouse', async () => {
		await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

		await expect.element(draggable).toHaveStyle(translate(100, 100));
	});
});

describe('compartment', () => {
	let draggable: Locator;
	let switcheroo_button: Locator;

	describe('undefined-to-plugin', async () => {
		beforeEach(async () => {
			const compartment = new Compartment();

			const comp = render(CompartmentComp, {
				onclick: () => {
					compartment.current = position({ current: { x: 450, y: 300 } });
				},
				plugins: () => [compartment],
			});
			draggable = comp.getByTestId('draggable');
			switcheroo_button = comp.getByTestId('switcheroo');

			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });
		});

		it('should have moved', async () => {
			await expect.element(draggable).toHaveStyle(translate(100, 100));
		});

		it('should switcheroo', async () => {
			await switcheroo_button.click();

			await sleepAndWaitForEffects(100);

			await expect.element(draggable).toHaveStyle(translate(450, 300));
		});
	});

	describe('plugin-func-to-undefined', async () => {
		beforeEach(async () => {
			const compartment = new Compartment(() => axis('x'));

			const comp = render(CompartmentComp, {
				onclick: () => {
					compartment.current = undefined;
				},
				plugins: () => [compartment],
			});
			draggable = comp.getByTestId('draggable');
			switcheroo_button = comp.getByTestId('switcheroo');

			await dragAndDrop(draggable, { deltaX: 100, deltaY: 0 });
		});

		it('should have moved', async () => {
			await expect.element(draggable).toHaveStyle(translate(100, 0));
		});

		it('should switcheroo', async () => {
			await switcheroo_button.click();

			await sleepAndWaitForEffects(100);

			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });

			await expect.element(draggable).toHaveStyle(translate(200, 100));
		});
	});

	describe('plugin-func-to-plugin', async () => {
		beforeEach(async () => {
			const compartment = new Compartment(() => axis('x'));

			const comp = render(CompartmentComp, {
				onclick: () => {
					compartment.current = position({ current: { x: 450, y: 300 } });
				},
				plugins: () => [compartment],
			});
			draggable = comp.getByTestId('draggable');
			switcheroo_button = comp.getByTestId('switcheroo');

			await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 });
		});

		it('should have moved', async () => {
			await expect.element(draggable).toHaveStyle(translate(100, 0));
		});

		it('should switcheroo', async () => {
			await switcheroo_button.click();
			await sleepAndWaitForEffects(100);
			await expect.element(draggable).toHaveStyle(translate(450, 300));
		});
	});
});
