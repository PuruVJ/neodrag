import { describe, expect, it } from 'vitest';
import {
	compareToBaseline,
	MIN_COMPARE_MEDIAN_MS,
	toReport,
	type BenchReport,
} from '../../benchmarks/report-storage.ts';
import type { BenchStats } from '../../benchmarks/browser/helpers.ts';

function stat(name: string, medianMs: number): BenchStats {
	return {
		name,
		iterations: 10,
		hz: 1000,
		meanMs: medianMs,
		medianMs,
		p99Ms: medianMs,
		minMs: medianMs,
		maxMs: medianMs,
	};
}

describe('compareToBaseline', () => {
	const baseline: BenchReport = {
		recordedAt: '2020-01-01T00:00:00.000Z',
		results: [
			{ name: 'idle · pointermove', meanMs: 0, medianMs: 0, p99Ms: 0.1, hz: 1 },
			{ name: 'steady drag', meanMs: 0.1, medianMs: 0.1, p99Ms: 0.2, hz: 1 },
		],
	};

	it('does not flag regression when baseline median is zero and current is within noise floor', () => {
		const current = [stat('idle · pointermove', 0.02), stat('steady drag', 0.1)];
		const { regressions } = compareToBaseline(current, baseline);
		expect(regressions).toEqual([]);
	});

	it('flags regression when current median exceeds floored baseline × ratio', () => {
		const current = [stat('steady drag', 0.2)];
		const { regressions } = compareToBaseline(current, baseline, 1.15);
		expect(regressions).toHaveLength(1);
		expect(regressions[0]!.ratio).toBeGreaterThan(1.15);
	});

	it('reports missing benchmarks', () => {
		const { missing } = compareToBaseline([stat('steady drag', 0.1)], baseline);
		expect(missing).toContain('idle · pointermove');
	});

	it('toReport strips extra fields', () => {
		const report = toReport([stat('a', 1)]);
		expect(report.results[0]).toEqual({
			name: 'a',
			meanMs: 1,
			medianMs: 1,
			p99Ms: 1,
			hz: 1000,
		});
	});

	it('uses MIN_COMPARE_MEDIAN_MS for zero baselines', () => {
		expect(MIN_COMPARE_MEDIAN_MS).toBeGreaterThan(0);
		const current = [stat('idle · pointermove', MIN_COMPARE_MEDIAN_MS * 2)];
		const { regressions } = compareToBaseline(current, baseline, 1.15);
		expect(regressions).toHaveLength(1);
	});
});
