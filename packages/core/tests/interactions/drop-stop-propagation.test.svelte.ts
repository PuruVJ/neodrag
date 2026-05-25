import type { Locator } from '@vitest/browser/context';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { defineDropPlugin } from '../../src/index.ts';
import { dragData } from '../../src/plugins.ts';
import { accepts, onDrop } from '../../src/drop/index.ts';
import InteractionsDropMulti from '../components/InteractionsDropMulti.svelte';
import { dragAndDrop } from '../mouse.ts';
import { sleepAndWaitForEffects } from '../utils.ts';

const stopPropagationOnEnter = defineDropPlugin(() => ({
	key: Symbol('stop-propagation'),
	name: 'stop-propagation',
	enter(ctx) {
		ctx.session.stopPropagation();
	},
}))();

describe('drop stopPropagation', () => {
	test('inner stopPropagation prevents outer enter and drop', async () => {
		const drops: string[] = [];
		const comp = render(InteractionsDropMulti, {
			dragPlugins: [dragData(() => ({ zone: 'inner' }))],
			outerDropPlugins: [
				accepts<{ zone: string }>(() => true),
				onDrop((d) => drops.push(`outer:${d.zone}`)),
			],
			innerDropPlugins: [
				accepts<{ zone: string }>(() => true),
				stopPropagationOnEnter,
				onDrop((d) => drops.push(`inner:${d.zone}`)),
			],
		});
		const draggable: Locator = comp.getByTestId('draggable');
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
});
