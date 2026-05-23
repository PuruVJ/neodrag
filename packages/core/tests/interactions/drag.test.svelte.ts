import type { Locator } from '@vitest/browser/context';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createEngine } from '../../src/interactions/index.ts';
import InteractionsBox from '../components/InteractionsBox.svelte';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from '../mouse.ts';
import { sleepAndWaitForEffects, translate } from '../utils.ts';

beforeEach(() => {
	startCursorTracking();
});

afterEach(() => {
	stopCursorTracking();
});

describe('interactions v4 drag', () => {
	let draggable: Locator;

	beforeEach(() => {
		const comp = render(InteractionsBox, { engine: createEngine() });
		draggable = comp.getByTestId('draggable');
	});

	test('renders at origin', async () => {
		await expect.element(draggable).toHaveStyle(translate(0, 0));
	});

	test('drags with pointer', async () => {
		await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 }, { steps: 5 });
		await sleepAndWaitForEffects();
		await expect.element(draggable).toHaveStyle(translate(100, 100));
	});

	test('sets neodrag data attributes after drag', async () => {
		await dragAndDrop(draggable, { deltaX: 50, deltaY: 50 }, { steps: 5 });
		await sleepAndWaitForEffects();
		await expect.element(draggable).toHaveAttribute('data-neodrag-state', 'idle');
		await expect.element(draggable).toHaveAttribute('data-neodrag-count', '1');
	});
});
