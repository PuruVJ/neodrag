/**
 * Simulates framework reconcile: new plugin object refs on every tick.
 */
import { describe, expect, it } from 'vitest';
import { Neodrag, position, transform } from '../../src/index.ts';
import { createBox, resetBody, runBench } from './helpers.ts';

describe('reactive update churn', () => {
	it('symbol-keyed reconcile stays fast under rapid option changes', () => {
		resetBody();
		const box = createBox();
		const engine = new Neodrag({ dev: false });
		let x = 0;
		let y = 0;
		const handle = engine.draggable(box, [transform, position({ current: { x, y } })]);

		const stats = runBench('reactive · new position() ref each update', 120, 15, () => {
			x += 1;
			y += 2;
			handle.update([transform, position({ current: { x, y } })]);
		});

		expect(stats.medianMs).toBeLessThan(12);
		expect(stats.p99Ms).toBeLessThan(40);

		handle.destroy();
		engine.dispose();
		box.remove();
	});

	it('no-op reconcile when plugin instances are stable', () => {
		resetBody();
		const box = createBox('100px', '220px');
		const engine = new Neodrag({ dev: false });
		const pos = position({ current: { x: 0, y: 0 } });
		const plugins = [transform, pos];
		const handle = engine.draggable(box, plugins);

		const stats = runBench('reactive · stable plugin refs (no-op)', 200, 20, () => {
			handle.update(plugins);
		});

		expect(stats.medianMs).toBeLessThan(2);

		handle.destroy();
		engine.dispose();
		box.remove();
	});
});
