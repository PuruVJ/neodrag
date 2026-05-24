import type { Locator } from '@vitest/browser/context';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { accepts, dragData, onDrop } from '../../src/interactions/index.ts';
import InteractionsDropMulti from '../components/InteractionsDropMulti.svelte';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from '../mouse.ts';
import { sleepAndWaitForEffects } from '../utils.ts';

describe('interactions drop multi', () => {
	let draggable: Locator;

	afterEach(() => {
		stopCursorTracking();
	});

	test('nested drop targets receive drop on inner zone', async () => {
		startCursorTracking();
		const drops: string[] = [];
		const comp = render(InteractionsDropMulti, {
			dragPlugins: [dragData(() => ({ zone: 'inner' }))],
			outerDropPlugins: [
				accepts<{ zone: string }>((d) => d.zone === 'outer'),
				onDrop((d) => drops.push(`outer:${d.zone}`)),
			],
			innerDropPlugins: [
				accepts<{ zone: string }>((d) => d.zone === 'inner'),
				onDrop((d) => drops.push(`inner:${d.zone}`)),
			],
		});
		draggable = comp.getByTestId('draggable');
		const inner = comp.getByTestId('drop-inner');

		const innerEl = await inner.element();
		const dragEl = await draggable.element();
		const innerRect = innerEl.getBoundingClientRect();
		const dragRect = dragEl.getBoundingClientRect();

		await dragAndDrop(
			draggable,
			{
				deltaX: innerRect.left + innerRect.width / 2 - (dragRect.left + dragRect.width / 2),
				deltaY: innerRect.top + innerRect.height / 2 - (dragRect.top + dragRect.height / 2),
			},
			{ steps: 10 },
		);
		await sleepAndWaitForEffects();

		expect(drops).toEqual(['inner:inner']);
	});

	test('rejects drop when accepts predicate fails', async () => {
		startCursorTracking();
		const drops: { kind: string }[] = [];
		const comp = render(InteractionsDropMulti, {
			dragPlugins: [dragData(() => ({ zone: 'wrong' }))],
			innerDropPlugins: [
				accepts<{ zone: string }>((d) => d.zone === 'inner'),
				onDrop((d) => drops.push(d)),
			],
		});
		draggable = comp.getByTestId('draggable');
		const inner = comp.getByTestId('drop-inner');

		const innerEl = await inner.element();
		const dragEl = await draggable.element();
		const innerRect = innerEl.getBoundingClientRect();
		const dragRect = dragEl.getBoundingClientRect();

		await dragAndDrop(
			draggable,
			{
				deltaX: innerRect.left + innerRect.width / 2 - (dragRect.left + dragRect.width / 2),
				deltaY: innerRect.top + innerRect.height / 2 - (dragRect.top + dragRect.height / 2),
			},
			{ steps: 10 },
		);
		await sleepAndWaitForEffects();

		expect(drops.length).toBe(0);
	});
});
