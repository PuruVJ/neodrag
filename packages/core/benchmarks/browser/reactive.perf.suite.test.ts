/**
 * Aggregated Chromium suite for reactive reconcile + two-way binding workloads.
 */
import { describe, expect, it } from 'vitest';
import { Neodrag } from '../../src/index.ts';
import { events, position } from '../../src/plugins.ts';
import {
	createBox,
	pointer,
	printBenchReport,
	ratioLabel,
	resetBody,
	runBench,
	setupManyDraggables,
	setupTwoWayBinding,
	type BenchStats,
} from './helpers.ts';

describe('Reactive Chromium perf suite', () => {
	it('prints comparison table and enforces reactive budgets', () => {
		resetBody();
		const results: BenchStats[] = [];
		const engine = new Neodrag({ dev: false });

		let tick = 0;
		const churnBox = createBox();
		const churnHandle = engine.draggable(churnBox, [
				position({ current: { x: tick, y: tick } }),
		]);
		results.push(
			runBench('reactive suite · plugin ref churn', 100, 10, () => {
				tick += 1;
				churnHandle.update([position({ current: { x: tick, y: tick * 2 } })]);
			}),
		);

		const stablePos = position({ current: { x: 0, y: 0 } });
		const stablePlugins = [stablePos];
		const stableBox = createBox('100px', '220px');
		const stableHandle = engine.draggable(stableBox, stablePlugins);
		results.push(
			runBench('reactive suite · stable refs no-op', 150, 15, () => {
				stableHandle.update(stablePlugins);
			}),
		);

		const reconcileBox = createBox('100px', '340px');
		let reconcileHandle = engine.draggable(reconcileBox, stablePlugins);
		results.push(
			runBench('reactive suite · in-place update', 60, 8, () => {
				tick += 1;
				reconcileHandle.update([position({ current: { x: tick, y: tick } })]);
			}),
		);

		const remountBox = createBox('280px', '100px');
		let remountHandle = engine.draggable(remountBox, stablePlugins);
		let remountTick = 0;
		results.push(
			runBench('reactive suite · remount draggable', 60, 8, () => {
				remountTick += 1;
				remountHandle.destroy();
				remountHandle = engine.draggable(remountBox, [
								position({ current: { x: remountTick, y: remountTick } }),
				]);
			}),
		);

		const twoWay = setupTwoWayBinding(Neodrag, position, events, '280px', '220px');
		results.push(
			runBench('reactive suite · two-way idle reconcile', 60, 8, () => {
				twoWay.pos.x += 1;
				twoWay.pos.y += 1;
				twoWay.handle.update(twoWay.build());
			}),
		);

		const scale = setupManyDraggables(40, engine, []);
		results.push(
			runBench('reactive suite · 40 sources idle move', 800, 80, () => {
				pointer(scale.first, 'pointermove', 50, 50);
			}),
		);

		printBenchReport('Neodrag — reactive reconcile (Chromium)', results, [
			[results[2]!, results[3]!],
			[results[0]!, results[1]!],
		]);
		console.log(' ·', ratioLabel(results[2]!, results[3]!));

		expect(results[0]!.medianMs).toBeLessThan(15);
		expect(results[1]!.medianMs).toBeLessThan(3);
		expect(results[4]!.medianMs).toBeLessThan(12);
		expect(results[2]!.meanMs).toBeLessThan(results[3]!.meanMs);

		churnHandle.destroy();
		stableHandle.destroy();
		reconcileHandle.destroy();
		remountHandle.destroy();
		twoWay.handle.destroy();
		for (const h of scale.handles) h.destroy();
		engine.dispose();

		churnBox.remove();
		stableBox.remove();
		reconcileBox.remove();
		remountBox.remove();
		twoWay.box.remove();
		scale.root.remove();
	});
});
