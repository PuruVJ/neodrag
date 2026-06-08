import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import {
	assertDragInvariants,
	buildSegments,
	createDragFuzzGesture,
	fuzz,
	fuzzDrag,
	moveToHuman,
	scribbleInPlace,
	wildDrag,
	wildReorder,
	zigzag,
} from '@neodrag/test';
import { render } from 'vitest-browser-svelte';
import { Neodrag } from '../../src/index.ts';
import InteractionsBox from '../components/InteractionsBox.svelte';
import InteractionsSortable from '../components/InteractionsSortable.svelte';
import { startCursorTracking, stopCursorTracking } from '../mouse.ts';
import { sleepAndWaitForEffects } from '../utils.ts';

beforeEach(() => {
	startCursorTracking();
});

afterEach(() => {
	stopCursorTracking();
});

describe('@neodrag/test realness smoke', () => {
	test('wildDrag keeps transform finite', async () => {
		const comp = render(InteractionsBox, { engine: new Neodrag() });
		const draggable = comp.getByTestId('draggable');
		await wildDrag(draggable, draggable, { seed: 4242, intensity: 'normal', mode: 'fast' });
		await sleepAndWaitForEffects();
		const el = await draggable.element();
		await assertDragInvariants({ element: el });
	});

	test('scribbleInPlace does not produce NaN transform', async () => {
		const comp = render(InteractionsBox, { engine: new Neodrag() });
		const draggable = comp.getByTestId('draggable');
		await scribbleInPlace(draggable, { seed: 99, intensity: 'wild', mode: 'fast', durationMs: 200 });
		await sleepAndWaitForEffects();
		const el = await draggable.element();
		await assertDragInvariants({ element: el });
	});

	test('wildReorder preserves sortable keys', async () => {
		const comp = render(InteractionsSortable);
		const item1 = comp.getByTestId('item-1');
		const list = comp.getByTestId('list');
		await wildReorder(item1, 2, list, { seed: 1337, intensity: 'normal', mode: 'fast' });
		await sleepAndWaitForEffects();
		const listEl = await list.element();
		const keys = [...listEl.querySelectorAll('[data-sortable-key]')].map((n) =>
			n.getAttribute('data-sortable-key'),
		);
		expect(keys.sort()).toEqual(['1', '2', '3']);
	});

	test('seed replay: buildSegments is deterministic', () => {
		const seed = 777;
		const start = { x: 100, y: 100 };
		const to = { x: 140, y: 60 };
		const factories = [moveToHuman(to, { tremor: 0.3 }), zigzag(to, { amplitude: 8 })];
		const a = buildSegments(seed, start, factories);
		const b = buildSegments(seed, start, factories);
		expect(a.samples.length).toBe(b.samples.length);
		for (let i = 0; i < a.samples.length; i++) {
			expect(a.samples[i]!.x).toBeCloseTo(b.samples[i]!.x, 5);
			expect(a.samples[i]!.y).toBeCloseTo(b.samples[i]!.y, 5);
			expect(a.samples[i]!.dt).toBeCloseTo(b.samples[i]!.dt, 5);
		}
	});

	test('fuzz harness reports seed on invariant failure', async () => {
		const comp = render(InteractionsBox, { engine: new Neodrag() });
		const draggable = comp.getByTestId('draggable');
		const result = await fuzz({
			seeds: [1, 2, 3],
			gesture: createDragFuzzGesture(draggable, async (el, ctx) => {
				await fuzzDrag(el, { seed: ctx.seed, intensity: 'tame', mode: 'fast' });
			}),
		});
		expect(result.failures).toHaveLength(0);
	});
});
