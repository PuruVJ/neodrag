import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Draggable, Droppable, Resizable } from '@neodrag/svelte';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from '../../core/tests/mouse.ts';
import { sleepAndWaitForEffects, translate } from '../../core/tests/utils.ts';
import DraggableHarness from './DraggableHarness.svelte';

describe('@neodrag/svelte v3 public surface', () => {
	test('exports the class-based v3 API', () => {
		expect(Draggable).toBeTypeOf('function');
		expect(Droppable).toBeTypeOf('function');
		expect(Resizable).toBeTypeOf('function');
	});
});

describe('@neodrag/svelte v3 draggable wrapper', () => {
	beforeEach(() => {
		startCursorTracking();
	});

	afterEach(() => {
		stopCursorTracking();
	});

	test('drag moves the node and toggles isDragging', async () => {
		const comp = render(DraggableHarness);
		const el = comp.getByTestId('draggable');
		await sleepAndWaitForEffects();

		await expect.element(el).toHaveAttribute('data-dragging', 'false');

		await dragAndDrop(el, { deltaX: 40, deltaY: 25 }, { steps: 4 });
		await sleepAndWaitForEffects();

		await expect.element(el).toHaveStyle(translate(40, 25));
		await expect.element(el).toHaveAttribute('data-dragging', 'false');
	});
});
