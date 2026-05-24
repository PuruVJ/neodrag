import type { BenchStats } from './browser/helpers.ts';

export const BASELINE_REL = 'benchmarks/reports/baseline.json';
export const LATEST_REL = 'benchmarks/reports/latest.json';

export type BenchReportEntry = {
	name: string;
	meanMs: number;
	medianMs: number;
	p99Ms: number;
	hz: number;
};

export type BenchReport = {
	recordedAt: string;
	gitRef?: string;
	results: BenchReportEntry[];
};

export type Regression = {
	name: string;
	baselineMedianMs: number;
	currentMedianMs: number;
	ratio: number;
};

export function toReport(results: BenchStats[]): BenchReport {
	return {
		recordedAt: new Date().toISOString(),
		results: results.map((r) => ({
			name: r.name,
			meanMs: r.meanMs,
			medianMs: r.medianMs,
			p99Ms: r.p99Ms,
			hz: r.hz,
		})),
	};
}

export function compareToBaseline(
	current: BenchStats[],
	baseline: BenchReport,
	maxRegressionRatio = 1.15,
): { regressions: Regression[]; missing: string[]; newBenchmarks: string[] } {
	const regressions: Regression[] = [];
	const missing: string[] = [];
	const baselineByName = new Map(baseline.results.map((r) => [r.name, r]));
	const currentNames = new Set(current.map((r) => r.name));

	for (const row of baseline.results) {
		if (!currentNames.has(row.name)) missing.push(row.name);
	}

	const newBenchmarks: string[] = [];
	for (const row of current) {
		const base = baselineByName.get(row.name);
		if (!base) {
			newBenchmarks.push(row.name);
			continue;
		}
		if (row.medianMs > base.medianMs * maxRegressionRatio) {
			regressions.push({
				name: row.name,
				baselineMedianMs: base.medianMs,
				currentMedianMs: row.medianMs,
				ratio: row.medianMs / base.medianMs,
			});
		}
	}

	return { regressions, missing, newBenchmarks };
}

export function formatRegressionReport(
	compare: ReturnType<typeof compareToBaseline>,
	baseline: BenchReport,
) {
	const lines: string[] = [
		`Baseline recorded: ${baseline.recordedAt}`,
		`Regression threshold: median > baseline × ratio`,
	];
	if (compare.regressions.length) {
		lines.push('\nRegressions:');
		for (const r of compare.regressions) {
			lines.push(
				`  · ${r.name}: ${r.baselineMedianMs.toFixed(3)}ms → ${r.currentMedianMs.toFixed(3)}ms (${r.ratio.toFixed(2)}×)`,
			);
		}
	}
	if (compare.newBenchmarks.length) {
		lines.push('\nNew benchmarks (not in baseline):');
		for (const n of compare.newBenchmarks) lines.push(`  · ${n}`);
	}
	if (compare.missing.length) {
		lines.push('\nMissing from current run:');
		for (const n of compare.missing) lines.push(`  · ${n}`);
	}
	return lines.join('\n');
}
