/**
 * Init vs update lifecycle matrix — baseline-gated in CI via bench:lifecycle.
 */
import { describe, expect, it } from 'vitest';
import { commands } from '@vitest/browser/context';
import { Draggable } from '../../src/draggable-binding.ts';
import { DragNeodrag } from '../../src/internal.ts';
import { MINIMAL_DRAG_PLUGINS, Neodrag } from '../../src/index.ts';
import { position } from '../../src/plugins.ts';
import { accepts } from '../../src/drop/index.ts';
import {
	compareToBaseline,
	formatRegressionReport,
	LIFECYCLE_BASELINE_REL,
	LIFECYCLE_LATEST_REL,
	toReport,
	type BenchReport,
} from '../report-storage.ts';
import {
	createBox,
	disposableEngine,
	pointer,
	printBenchReport,
	ratioLabel,
	resetBody,
	runBench,
	runBenchBatch,
	setupManyDraggables,
	type BenchStats,
} from './helpers.ts';

const DRAG = { fromX: 120, fromY: 120, toX: 200, toY: 200, steps: 8 };

describe('lifecycle · init vs update', () => {
	it('measures install, reconcile, binding, and hot-path update', async () => {
		resetBody();
		const results: BenchStats[] = [];

		results.push(
			...runBenchBatch([
				{
					name: 'lifecycle · Neodrag construct',
					iterations: 200,
					warmup: 30,
					fn: () => {
						const e = new Neodrag({ dev: false, plugins: [] });
						e.dispose();
					},
				},
				{
					name: 'lifecycle · DragNeodrag construct',
					iterations: 200,
					warmup: 30,
					fn: () => {
						const e = new DragNeodrag({ plugins: [], defaultSensors: false });
						e.dispose();
					},
				},
			]),
		);

		{
			const { engine, dispose } = disposableEngine(Neodrag, { dev: false, plugins: [] });
			const box = createBox('40px', '40px');
			results.push(
				runBench('lifecycle · engine.draggable · minimal plugins', 120, 20, () => {
					const h = engine.draggable(box, MINIMAL_DRAG_PLUGINS);
					h.destroy();
				}),
			);
			dispose();
			box.remove();
		}

		{
			const { engine, dispose } = disposableEngine(Neodrag);
			const box = createBox('40px', '120px');
			results.push(
				runBench('lifecycle · engine.draggable · default stack', 100, 15, () => {
					const h = engine.draggable(box, []);
					h.destroy();
				}),
			);
			dispose();
			box.remove();
		}

		{
			const { engine, dispose } = disposableEngine(Neodrag, { dev: false, plugins: [] });
			results.push(
				runBench('lifecycle · register 32 draggables (install)', 40, 5, () => {
					const { handles, root } = setupManyDraggables(32, engine, MINIMAL_DRAG_PLUGINS);
					for (const h of handles) h.destroy();
					root.remove();
				}),
			);
			dispose();
		}

		{
			const box = createBox('200px', '40px');
			results.push(
				runBench('lifecycle · Draggable.attach · minimal', 100, 15, () => {
					const binding = new Draggable({ plugins: MINIMAL_DRAG_PLUGINS });
					binding.attach(box);
					binding.detach();
				}),
			);
			box.remove();
		}

		{
			const box = createBox('200px', '120px');
			let tick = 0;
			const binding = new Draggable({ plugins: [position({ current: { x: 0, y: 0 } })] });
			binding.attach(box);
			results.push(
				runBench('lifecycle · Draggable.update · position ref churn', 120, 15, () => {
					tick += 1;
					binding.update([position({ current: { x: tick, y: tick * 2 } })]);
				}),
			);
			binding.destroy();
			box.remove();
		}

		{
			const { engine, dispose } = disposableEngine(Neodrag, { dev: false, plugins: [] });
			const box = createBox('200px', '220px');
			const pos = position({ current: { x: 0, y: 0 } });
			const plugins = [pos];
			const handle = engine.draggable(box, plugins);
			results.push(
				runBench('lifecycle · handle.update · stable refs (no-op)', 250, 30, () => {
					handle.update(plugins);
				}),
			);
			handle.destroy();
			dispose();
			box.remove();
		}

		{
			const { engine, dispose } = disposableEngine(Neodrag, { dev: false, plugins: [] });
			const box = createBox('360px', '40px');
			let tick = 0;
			let handle = engine.draggable(box, [position({ current: { x: tick, y: tick } })]);
			results.push(
				runBench('lifecycle · handle.update · position ref churn', 120, 15, () => {
					tick += 1;
					handle.update([position({ current: { x: tick, y: tick * 2 } })]);
				}),
			);
			handle.destroy();
			dispose();
			box.remove();
		}

		{
			const { engine, dispose } = disposableEngine(Neodrag, { dev: false, plugins: [] });
			const reconcileBox = createBox('360px', '120px');
			let tick = 0;
			let reconcileHandle = engine.draggable(reconcileBox, [position({ current: { x: 0, y: 0 } })]);
			const remountBox = createBox('360px', '220px');
			let remountHandle = engine.draggable(remountBox, [position({ current: { x: 0, y: 0 } })]);
			let remountTick = 0;

			const reconcile = runBench('lifecycle · reconcile in-place', 80, 10, () => {
				tick += 1;
				reconcileHandle.update([position({ current: { x: tick, y: tick } })]);
			});
			const remount = runBench('lifecycle · remount destroy+draggable', 80, 10, () => {
				remountTick += 1;
				remountHandle.destroy();
				remountHandle = engine.draggable(remountBox, [
					position({ current: { x: remountTick, y: remountTick } }),
				]);
			});
			results.push(reconcile, remount);
			reconcileHandle.destroy();
			remountHandle.destroy();
			dispose();
			reconcileBox.remove();
			remountBox.remove();
		}

		{
			const { engine, dispose } = disposableEngine(Neodrag, { dev: false, plugins: [] });
			const box = createBox('520px', '40px');
			let tick = 0;
			const build = () => [position({ current: { x: tick * 4, y: tick * 4 } })];
			const handle = engine.draggable(box, build());
			results.push(
				runBench('lifecycle · update during active drag', 60, 8, () => {
					pointer(box, 'pointermove', DRAG.fromX, DRAG.fromY);
					pointer(box, 'pointerdown', DRAG.fromX, DRAG.fromY);
					pointer(box, 'pointermove', DRAG.fromX + 24, DRAG.fromY + 24);
					tick += 1;
					handle.update(build());
					pointer(box, 'pointerup', DRAG.toX, DRAG.toY);
				}),
			);
			handle.destroy();
			dispose();
			box.remove();
		}

		{
			const { engine, dispose } = disposableEngine(Neodrag, { dev: false, plugins: [] });
			const zone = createBox('520px', '120px');
			results.push(
				runBench('lifecycle · engine.droppable · accepts only', 100, 15, () => {
					const h = engine.droppable(zone, [accepts(() => true)]);
					h.destroy();
				}),
			);
			dispose();
			zone.remove();
		}

		printBenchReport('Lifecycle init vs update', results, [
			[results.find((r) => r.name.includes('reconcile in-place'))!, results.find((r) => r.name.includes('remount'))!],
			[results.find((r) => r.name.includes('stable refs'))!, results.find((r) => r.name.includes('position ref churn') && r.name.includes('handle.update'))!],
		]);

		const report = toReport(results);
		await commands.writeFile(LIFECYCLE_LATEST_REL, `${JSON.stringify(report, null, 2)}\n`);

		let baseline: BenchReport | null = null;
		try {
			baseline = JSON.parse(await commands.readFile(LIFECYCLE_BASELINE_REL)) as BenchReport;
		} catch {
			baseline = null;
		}

		if (baseline) {
			const comparison = compareToBaseline(results, baseline, 1.15);
			console.log('\n=== Lifecycle baseline ===\n');
			console.log(formatRegressionReport(comparison, baseline));
			expect(comparison.regressions).toEqual([]);
			expect(comparison.missing).toEqual([]);
		} else {
			console.warn(`No lifecycle baseline at ${LIFECYCLE_BASELINE_REL}. Run pnpm bench:lifecycle:baseline`);
		}

		const noop = results.find((r) => r.name.includes('stable refs'))!;
		const churn = results.find((r) => r.name.includes('handle.update · position ref churn'))!;
		const reconcile = results.find((r) => r.name.includes('reconcile in-place'))!;
		const remount = results.find((r) => r.name.includes('remount'))!;

		expect(noop.meanMs).toBeLessThan(0.05);
		expect(churn.meanMs).toBeLessThan(2);
		expect(reconcile.meanMs).toBeLessThan(remount.meanMs * 1.2);
		expect(remount.meanMs).toBeGreaterThan(reconcile.meanMs);
		console.log(' ·', ratioLabel(reconcile, remount));

		const attach = results.find((r) => r.name.includes('Draggable.attach'))!;
		const install = results.find((r) => r.name.includes('engine.draggable · minimal'))!;
		expect(attach.meanMs).toBeLessThan(install.meanMs * 3);
	});
});
