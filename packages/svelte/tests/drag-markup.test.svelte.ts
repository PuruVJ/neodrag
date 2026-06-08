import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Draggable } from '@neodrag/svelte';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from '../../core/tests/mouse.ts';
import { sleepAndWaitForEffects } from '../../core/tests/utils.ts';
import DragMarkupHarness from './DragMarkupHarness.svelte';

beforeEach(() => {
	startCursorTracking();
});

afterEach(() => {
	stopCursorTracking();
});

describe('@neodrag/svelte drag markup', () => {
	test('target seeds built-in drag state attrs', () => {
		const drag = new Draggable({ plugins: [] });
		expect(drag.target['data-neodrag']).toBe('');
		expect(drag.target['data-neodrag-state']).toBe('idle');
	});

	test('data-neodrag-state updates through drag lifecycle', async () => {
		const comp = render(DragMarkupHarness);
		const el = comp.getByTestId('draggable');
		await sleepAndWaitForEffects();
		await expect.element(el).toHaveAttribute('data-neodrag-state', 'idle');

		await dragAndDrop(el, { deltaX: 40, deltaY: 40 }, { steps: 4 });
		await sleepAndWaitForEffects();
		await expect.element(el).toHaveAttribute('data-neodrag-state', 'idle');
		await expect.element(el).toHaveAttribute('data-neodrag-count', '1');
	});

	test('isDragging reads markup during drag', async () => {
		const comp = render(DragMarkupHarness);
		const el = comp.getByTestId('draggable');
		await sleepAndWaitForEffects();

		const dragPromise = dragAndDrop(el, { deltaX: 30, deltaY: 30 }, { steps: 4 });
		await sleepAndWaitForEffects();
		await dragPromise;
		await sleepAndWaitForEffects();
		await expect.element(el).toHaveAttribute('data-neodrag-count', '1');
	});
});
