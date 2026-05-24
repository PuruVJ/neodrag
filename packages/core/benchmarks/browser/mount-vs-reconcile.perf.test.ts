/**
 * Compare destroy+remount vs in-place engine.update (wrapper reconcile path).
 */
import { describe, expect, it } from 'vitest';
import { Neodrag } from '../../src/index.ts';
import { position } from '../../src/plugins.ts';
import {
	createBox,
	printBenchReport,
	ratioLabel,
	resetBody,
	runBench,
	type BenchStats,
} from './helpers.ts';

describe('mount vs reconcile', () => {
	it('reconcile is faster than destroy+remount', () => {
		resetBody();
		const results: BenchStats[] = [];
		const engine = new Neodrag({ dev: false });

		let tick = 0;
		const build = () => [position({ current: { x: tick, y: tick * 2 } })];

		const reconcileBox = createBox('100px', '100px');
		let reconcileHandle = engine.draggable(reconcileBox, build());

		results.push(
			runBench('mount-vs-reconcile · in-place update', 80, 10, () => {
				tick += 1;
				reconcileHandle.update(build());
			}),
		);

		const remountBox = createBox('100px', '240px');
		let remountHandle = engine.draggable(remountBox, build());
		let remountTick = 0;

		results.push(
			runBench('mount-vs-reconcile · destroy + draggable', 80, 10, () => {
				remountTick += 1;
				remountHandle.destroy();
				remountHandle = engine.draggable(remountBox, [
								position({ current: { x: remountTick, y: remountTick * 2 } }),
				]);
			}),
		);

		printBenchReport('Mount vs reconcile', results, [[results[0]!, results[1]!]]);

		expect(results[0]!.meanMs).toBeLessThan(results[1]!.meanMs);
		console.log(' ·', ratioLabel(results[0]!, results[1]!));

		reconcileHandle.destroy();
		remountHandle.destroy();
		engine.dispose();
		reconcileBox.remove();
		remountBox.remove();
	});
});
