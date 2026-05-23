import type { Locator } from '@vitest/browser/context';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { accepts, dragData, onDrop, transform } from '../../src/interactions/index.ts';
import InteractionsDrop from '../components/InteractionsDrop.svelte';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from '../mouse.ts';
import { sleepAndWaitForEffects } from '../utils.ts';

describe('interactions drop', () => {
	let draggable: Locator;
	let dropzone: Locator;
	const drops: { kind: string }[] = [];

	beforeEach(() => {
		startCursorTracking();
		drops.length = 0;
		const comp = render(InteractionsDrop, {
			dragPlugins: [transform, dragData(() => ({ kind: 'card' }))],
			dropPlugins: [
				accepts<{ kind: string }>((d) => d.kind === 'card'),
				onDrop((data) => {
					drops.push(data);
				}),
			],
		});
		draggable = comp.getByTestId('draggable');
		dropzone = comp.getByTestId('dropzone');
	});

	afterEach(() => {
		stopCursorTracking();
	});

	test('fires onDrop with typed payload', async () => {
		const dropEl = await dropzone.element();
		const dragEl = await draggable.element();
		const dropRect = dropEl.getBoundingClientRect();
		const dragRect = dragEl.getBoundingClientRect();

		await dragAndDrop(
			draggable,
			{
				deltaX: dropRect.left + dropRect.width / 2 - (dragRect.left + dragRect.width / 2),
				deltaY: dropRect.top + dropRect.height / 2 - (dragRect.top + dragRect.height / 2),
			},
			{ steps: 8 },
		);
		await sleepAndWaitForEffects();

		expect(drops.length).toBeGreaterThanOrEqual(1);
		expect(drops[0]?.kind).toBe('card');
	});
});
