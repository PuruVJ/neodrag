/**
 * Chromium perf guard for reactive position reconciliation.
 */
import { describe, expect, it } from 'vitest';
import { Neodrag, position, transform } from '../../src/index.ts';
import { createBox, resetBody, runBench } from './helpers.ts';

describe('two-way binding perf', () => {
	it('many idle plugin reconciles stay fast', () => {
		resetBody();
		const box = createBox();
		const engine = new Neodrag({ dev: false });
		let x = 0;
		let y = 0;
		const build = () => [transform, position({ current: { x, y } })];
		const handle = engine.draggable(box, build());

		const stats = runBench('two-way-idle-reconcile', 60, 10, () => {
			x += 1;
			y += 1;
			handle.update(build());
		});

		expect(stats.medianMs).toBeLessThan(8);
		handle.destroy();
		engine.dispose();
	});
});
