import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from '../../core/tests/mouse.ts';
import { translate } from '../../core/tests/utils.ts';
import HandleHarness from './HandleHarness.svelte';

// End-to-end gate through the Svelte wrapper: `{...drag.handle()}` / `{...drag.cancel()}` register
// markers on descendants, and the draggable box only starts a drag from the right places. Exercises
// the wrapper's registration attachment + buffering (the handle child mounts inside the box).
describe('@neodrag/svelte handle/cancel register hooks', () => {
	beforeEach(() => startCursorTracking());
	afterEach(() => stopCursorTracking());

	test('drag starts from a registered handle', async () => {
		const comp = render(HandleHarness);
		const box = comp.getByTestId('box');
		await dragAndDrop(comp.getByTestId('bar'), { deltaX: 40, deltaY: 30 }, { steps: 5 });
		await expect.element(box).toHaveStyle(translate(40, 30));
	});

	test('the body is blocked once a handle exists (allow-list)', async () => {
		const comp = render(HandleHarness);
		const box = comp.getByTestId('box');
		await dragAndDrop(comp.getByTestId('body'), { deltaX: 40, deltaY: 30 }, { steps: 5 });
		// No translate was ever written — the drag never started.
		expect((box.element() as HTMLElement).style.translate).toBe('');
	});

	test('a registered cancel never starts a drag', async () => {
		const comp = render(HandleHarness);
		const box = comp.getByTestId('box');
		await dragAndDrop(comp.getByTestId('btn'), { deltaX: 40, deltaY: 30 }, { steps: 5 });
		expect((box.element() as HTMLElement).style.translate).toBe('');
	});
});
