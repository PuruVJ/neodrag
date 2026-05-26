/**
 * Two-way position binding: idle reconcile, drag+sync churn, long drag.
 */
import { describe, expect, it } from 'vitest';
import { Neodrag } from '../../src/index.ts';
import { events, position } from '../../src/plugins.ts';
import {
	createBox,
	dragSteps,
	printBenchReport,
	resetBody,
	runBench,
	setupTwoWayBinding,
	type BenchStats,
} from './helpers.ts';

describe('two-way binding perf', () => {
	it('many idle plugin reconciles stay fast', () => {
		resetBody();
		const { engine, box, handle, pos, build } = setupTwoWayBinding(
			Neodrag,
			position,
				events,
		);

		const stats = runBench('two-way · idle reconcile ×60', 60, 10, () => {
			pos.x += 1;
			pos.y += 1;
			handle.update(build());
		});

		expect(stats.medianMs).toBeLessThan(10);
		handle.destroy();
		engine.dispose();
		box.remove();
	});

	it('drag with two-way sync stays bounded', () => {
		resetBody();
		const { engine, box, handle, pos, build } = setupTwoWayBinding(
			Neodrag,
			position,
				events,
			'100px',
			'220px',
		);

		const stats = runBench('two-way · 16-step drag + reconcile', 40, 5, () => {
			dragSteps(box, 120, 120, 220, 220, 16);
			handle.update(build());
		});

		expect(stats.medianMs).toBeLessThan(40);
		expect(pos.x).toBeGreaterThan(40);

		handle.destroy();
		engine.dispose();
		box.remove();
	});

	it('long drag (32 steps) with two-way binding', () => {
		resetBody();
		const { engine, box, handle, build } = setupTwoWayBinding(
			Neodrag,
			position,
				events,
			'280px',
			'100px',
		);

		const stats = runBench('two-way · 32-step drag', 25, 3, () => {
			dragSteps(box, 300, 120, 500, 320, 32);
			handle.update(build());
		});

		expect(stats.medianMs).toBeLessThan(60);

		handle.destroy();
		engine.dispose();
		box.remove();
	});

	it('prints idle position-only vs full two-way churn', () => {
		resetBody();
		const results: BenchStats[] = [];

		{
			const engine = new Neodrag({ dev: false });
			const box = createBox('100px', '340px');
			let x = 0;
			let y = 0;
			const build = () => [position({ current: { x, y } })];
			const handle = engine.draggable(box, build());
			results.push(
				runBench('two-way · position only · idle update', 80, 10, () => {
					x += 1;
					y += 1;
					handle.update(build());
				}),
			);
			handle.destroy();
			engine.dispose();
			box.remove();
		}

		{
			const { engine, box, handle, pos, build } = setupTwoWayBinding(
				Neodrag,
				position,
						events,
				'280px',
				'340px',
			);
			results.push(
				runBench('two-way · position + events · idle update', 80, 10, () => {
					pos.x += 1;
					pos.y += 1;
					handle.update(build());
				}),
			);
			handle.destroy();
			engine.dispose();
			box.remove();
		}

		printBenchReport('Two-way binding comparison', results);
		expect(results[1]!.medianMs).toBeLessThan(20);
	});
});
