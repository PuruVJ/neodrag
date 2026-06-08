/**
 * Automated engine cost breakdown per human-behavior scenario.
 * Run: pnpm bench:cost
 * Output: benchmarks/reports/human-cost.json
 */
import { describe, expect, it } from 'vitest';
import { commands } from '@vitest/browser/context';
import { MINIMAL_DRAG_PLUGINS, Neodrag } from '../../src/index.ts';
import {
	buildHumanCostReport,
	formatCostTable,
	formatSpanBreakdown,
	measureScenarioCost,
	type HumanCostReport,
} from './cost-report.ts';
import { humanScenarios } from './human-scenarios.ts';
import { createBox, dragSteps, resetBody, resetElementPosition } from './helpers.ts';
import { DRAG } from './human-scenarios.ts';

const REPORT_REL = 'benchmarks/reports/human-cost.json';
const BASELINE_REL = 'benchmarks/reports/human-cost-baseline.json';

describe('Human behavior engine cost (instrumented)', () => {
	it('measures wall time and engine span breakdown per scenario', async () => {
		const scenarios: Awaited<ReturnType<typeof measureScenarioCost>>[] = [];

		for (const scenario of humanScenarios()) {
			scenarios.push(
				await measureScenarioCost(scenario.id, scenario.group, scenario.run, {
					iterations: 40,
					warmup: 8,
				}),
			);
		}

		scenarios.push(
			await measureScenarioCost(
				'steady-drag-loop',
				'hot',
				async (options) => {
					const measure = !!options?.measure;
					resetBody();
					const box = createBox();
					const engine = new Neodrag({
						plugins: MINIMAL_DRAG_PLUGINS,
						dev: false,
						profile: measure,
					});
					if (measure) engine.resetCostProfile();
					const t0 = performance.now();
					engine.draggable(box, [], { threshold: null });
					for (let i = 0; i < 120; i++) {
						resetElementPosition(box);
						dragSteps(box, DRAG.fromX, DRAG.fromY, DRAG.toX, DRAG.toY, DRAG.steps);
					}
					const wallMs = performance.now() - t0;
					const { flushEffects } = await import('./helpers.ts');
					await flushEffects();
					if (measure) {
						const snapshot = engine.takeCostProfile(wallMs);
						engine.dispose();
						return snapshot ?? undefined;
					}
					engine.dispose();
				},
				{ iterations: 15, warmup: 3 },
			),
		);

		const report = buildHumanCostReport(scenarios);

		console.log('\n=== Neodrag — human behavior engine cost ===\n');
		console.table(formatCostTable(scenarios));
		for (const row of scenarios) {
			console.log(
				`\n--- ${row.group}/${row.id} (median wall ${row.wall.medianMs.toFixed(3)} ms) ---`,
			);
			console.table(formatSpanBreakdown(row));
		}

		await commands.writeFile(REPORT_REL, `${JSON.stringify(report, null, 2)}\n`);

		let baseline: HumanCostReport | null = null;
		try {
			const raw = await commands.readFile(BASELINE_REL);
			baseline = JSON.parse(raw) as HumanCostReport;
		} catch {
			baseline = null;
		}

		if (baseline) {
			const regressions: string[] = [];
			const baselineByKey = new Map(
				baseline.scenarios.map((s) => [`${s.group}/${s.id}`, s.wall.medianMs]),
			);
			for (const row of scenarios) {
				const key = `${row.group}/${row.id}`;
				const baseMedian = baselineByKey.get(key);
				if (baseMedian === undefined) continue;
				const ratio = row.wall.medianMs / Math.max(baseMedian, 0.05);
				if (ratio > 1.4) {
					regressions.push(`${key}: ${ratio.toFixed(2)}× median wall vs baseline`);
				}
			}
			expect(regressions, regressions.join('\n')).toEqual([]);
		} else {
			console.warn(`\nNo baseline at ${BASELINE_REL}. Copy human-cost.json after review.`);
		}

		const dragMove = scenarios.find((s) => s.id === 'drag-move-by-delta')!;
		expect(dragMove.snapshot.spans['runDrag']?.count).toBeGreaterThan(0);
		expect(dragMove.enginePctOfWall).toBeGreaterThan(0);
		expect(dragMove.wall.medianMs).toBeLessThan(50);
	});
});
