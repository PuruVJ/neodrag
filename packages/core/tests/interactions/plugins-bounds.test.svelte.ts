import type { Locator } from '@vitest/browser/context';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InteractionsBoundsParent from '../components/InteractionsBoundsParent.svelte';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from '../mouse.ts';

describe('interactions bounds', () => {
	let el: Locator;

	beforeEach(() => {
		startCursorTracking();
		const comp = render(InteractionsBoundsParent);
		el = comp.getByTestId('draggable');
	});

	afterEach(() => {
		stopCursorTracking();
	});

	test('does not escape 200x200 parent', async () => {
		await dragAndDrop(el, { deltaX: 400, deltaY: 400 }, { steps: 5 });
		const node = await el.element();
		const style = getComputedStyle(node);
		const match = style.translate.match(/([\d.-]+)px.*([\d.-]+)px/);
		expect(match).toBeTruthy();
		const x = Number(match![1]);
		const y = Number(match![2]);
		expect(x).toBeLessThanOrEqual(100);
		expect(y).toBeLessThanOrEqual(100);
	});
});
