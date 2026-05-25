import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Neodrag } from '../../src/index.ts';
import TwoWayBindingBox from '../components/TwoWayBindingBox.svelte';
import { dragAndDrop, startCursorTracking, stopCursorTracking } from '../mouse.ts';
import { sleepAndWaitForEffects } from '../utils.ts';

const MAX_RECONCILES_AFTER_IDLE = 8;
const MAX_RECONCILES_AFTER_DRAG = 120;

beforeEach(() => {
	startCursorTracking();
});

afterEach(() => {
	stopCursorTracking();
});

describe('interactions two-way binding re-entry guard', () => {
	test('idle external nudge does not runaway reconcile', async () => {
		let reconciles = 0;
		const comp = render(TwoWayBindingBox, {
			onReconcile: () => {
				reconciles++;
			},
		});

		await sleepAndWaitForEffects(50);
		const baseline = reconciles;

		await comp.rerender({ external: { x: 80, y: 90 } });
		await sleepAndWaitForEffects(50);

		expect(reconciles - baseline).toBeLessThan(MAX_RECONCILES_AFTER_IDLE);
	});

	test('drag with two-way sync stays bounded', async () => {
		let reconciles = 0;
		const comp = render(TwoWayBindingBox, {
			onReconcile: () => {
				reconciles++;
			},
		});
		const el = comp.getByTestId('draggable');

		await sleepAndWaitForEffects();
		const baseline = reconciles;

		await dragAndDrop(el, { deltaX: 100, deltaY: 50 }, { steps: 12 });
		await sleepAndWaitForEffects(50);

		expect(reconciles - baseline).toBeLessThan(MAX_RECONCILES_AFTER_DRAG);
	});

	test('rapid external updates do not overflow stack', async () => {
		const engine = new Neodrag();
		let reconciles = 0;
		const comp = render(TwoWayBindingBox, {
			engine,
			onReconcile: () => {
				reconciles++;
			},
		});

		for (let i = 0; i < 40; i++) {
			await comp.rerender({ external: { x: 80 + i, y: 90 + i } });
		}
		await sleepAndWaitForEffects(50);

		expect(reconciles).toBeLessThan(200);
	});
});
