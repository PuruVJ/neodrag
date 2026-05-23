/**
 * Scale: many draggables on one engine, hit-testing, idle move.
 */
import { describe, expect, it } from 'vitest';
import { Neodrag, transform } from '../../src/index.ts';
import {
	createBox,
	dragSteps,
	pointer,
	resetBody,
	runBench,
	setupManyDraggables,
} from './helpers.ts';

const SCALE_N = 50;

describe('scale benchmarks', () => {
	it('registers many draggables and keeps idle pointermove fast', () => {
		resetBody();
		const engine = new Neodrag({ dev: false });
		const { root, handles, first } = setupManyDraggables(SCALE_N, engine, []);

		const stats = runBench(`scale · ${SCALE_N} draggables · idle pointermove`, 1500, 150, () => {
			pointer(first, 'pointermove', 80, 80);
		});

		expect(stats.medianMs).toBeLessThan(5);

		for (const h of handles) h.destroy();
		engine.dispose();
		root.remove();
	});

	it('12-step drag on one of many draggables', () => {
		resetBody();
		const engine = new Neodrag({ dev: false });
		const { root, handles, first } = setupManyDraggables(SCALE_N, engine, []);

		const stats = runBench(`scale · ${SCALE_N} sources · 12-step drag`, 120, 15, () => {
			dragSteps(first, 60, 60, 160, 160, 12);
		});

		expect(stats.medianMs).toBeLessThan(25);

		for (const h of handles) h.destroy();
		engine.dispose();
		root.remove();
	});

	it('single draggable baseline with default stack', () => {
		resetBody();
		const box = createBox('400px', '100px');
		const engine = new Neodrag({ dev: false });
		const handle = engine.draggable(box, []);

		const stats = runBench('scale · single draggable · 12-step drag', 200, 20, () => {
			dragSteps(box, 420, 120, 520, 220, 12);
		});

		expect(stats.medianMs).toBeLessThan(20);

		handle.destroy();
		engine.dispose();
		box.remove();
	});
});
