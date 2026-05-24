/**
 * Human-expectation tests via Playwright pointer simulation + Svelte DOM updates.
 */
import type { Locator } from '@vitest/browser/context';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { accepts, axis, disabled, dragData, onDrop } from '../../src/interactions/index.ts';
import InteractionsBox from '../components/InteractionsBox.svelte';
import InteractionsBoundsParent from '../components/InteractionsBoundsParent.svelte';
import InteractionsDrop from '../components/InteractionsDrop.svelte';
import InteractionsSortable from '../components/InteractionsSortable.svelte';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from '../mouse.ts';
import { sleepAndWaitForEffects, translate } from '../utils.ts';

describe('human expectations (Playwright + Svelte)', () => {
	beforeEach(() => {
		startCursorTracking();
	});

	afterEach(() => {
		stopCursorTracking();
	});

	test('element moves where you drag it', async () => {
		const comp = render(InteractionsBox, { plugins: [] });
		const draggable = comp.getByTestId('draggable');
		await dragAndDrop(draggable, { deltaX: 100, deltaY: 100 }, { steps: 8 });
		await sleepAndWaitForEffects();
		await expect.element(draggable).toHaveStyle(translate(100, 100));
	});

	test('disabled element stays put', async () => {
		const comp = render(InteractionsBox, { plugins: [disabled()] });
		const el = comp.getByTestId('draggable');
		await dragAndDrop(el, { deltaX: 60, deltaY: 60 }, { steps: 6 });
		const node = await el.element();
		const t = getComputedStyle(node).translate;
		expect(t === 'none' || t.startsWith('0px')).toBe(true);
	});

	test('axis lock keeps perpendicular offset near zero', async () => {
		const comp = render(InteractionsBox, { plugins: [axis('x')] });
		const el = comp.getByTestId('draggable');
		await dragAndDrop(el, { deltaX: 80, deltaY: 80 }, { steps: 8 });
		await sleepAndWaitForEffects();
		await expect.element(el).toHaveStyle(translate(80, 0));
	});

	test('bounds keep the box inside the parent', async () => {
		const comp = render(InteractionsBoundsParent);
		const el = comp.getByTestId('draggable');
		await dragAndDrop(el, { deltaX: 500, deltaY: 500 }, { steps: 8 });
		const node = await el.element();
		const match = getComputedStyle(node).translate.match(/([\d.-]+)px.*([\d.-]+)px/);
		expect(match).toBeTruthy();
		expect(Number(match![1])).toBeLessThanOrEqual(110);
		expect(Number(match![2])).toBeLessThanOrEqual(110);
	});

	test('drop succeeds once over the zone with valid data', async () => {
		const drops: { kind: string }[] = [];
		const comp = render(InteractionsDrop, {
			dragPlugins: [dragData(() => ({ kind: 'card' }))],
			dropPlugins: [
				accepts<{ kind: string }>((d) => d.kind === 'card'),
				onDrop((data) => drops.push(data)),
			],
		});
		const draggable = comp.getByTestId('draggable');
		const dropzone = comp.getByTestId('dropzone');

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
			{ steps: 10 },
		);
		await sleepAndWaitForEffects();

		expect(drops.length).toBe(1);
		expect(drops[0]?.kind).toBe('card');
	});

	test('visible sortable list order changes after dragging an item down', async () => {
		const comp = render(InteractionsSortable);
		const item1 = comp.getByTestId('item-1');
		const item3 = comp.getByTestId('item-3');
		const list = comp.getByTestId('list');

		const readLabels = async () => {
			const ul = await list.element();
			return [...ul.querySelectorAll('li')].map((li) => li.textContent?.trim() ?? '');
		};

		const before = await readLabels();
		expect(before).toEqual(['One', 'Two', 'Three']);

		const item1El = await item1.element();
		const item3El = await item3.element();
		const r1 = item1El.getBoundingClientRect();
		const r3 = item3El.getBoundingClientRect();

		await dragAndDrop(
			item1,
			{
				deltaX: 0,
				deltaY: r3.top + r3.height - r1.top + 8,
			},
			{ steps: 14 },
		);
		await sleepAndWaitForEffects();

		const after = await readLabels();
		expect(after).not.toEqual(before);
		expect(after.sort().join()).toBe(before.sort().join());
	});

	test('small sortable drag does not reshuffle the list', async () => {
		const comp = render(InteractionsSortable);
		const item1 = comp.getByTestId('item-1');
		const list = comp.getByTestId('list');

		const readLabels = async () => {
			const ul = await list.element();
			return [...ul.querySelectorAll('li')].map((li) => li.textContent?.trim() ?? '');
		};

		const before = await readLabels();
		await dragAndDrop(item1, { deltaX: 0, deltaY: 4 }, { steps: 3 });
		await sleepAndWaitForEffects();
		expect(await readLabels()).toEqual(before);
	});
});
