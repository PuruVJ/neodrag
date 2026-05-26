import type { EngineCostSnapshot } from '../../src/engine-profile.ts';
import { summarize, type BenchStats } from './helpers.ts';

export type ScenarioCostReport = {
	id: string;
	group: string;
	wall: BenchStats;
	snapshot: EngineCostSnapshot;
	enginePctOfWall: number;
	topSpans: Array<{
		span: string;
		totalMs: number;
		pctOfWall: number;
		count: number;
		callsPerRun: number;
		meanMs: number;
	}>;
};

export type HumanCostReport = {
	recordedAt: string;
	note: string;
	scenarios: ScenarioCostReport[];
};

export function mergeCostSnapshots(samples: EngineCostSnapshot[]): EngineCostSnapshot {
	const wallMs = samples.reduce((a, s) => a + s.wallMs, 0);
	const spanTotals = new Map<string, { totalMs: number; count: number }>();

	for (const sample of samples) {
		for (const [span, stat] of Object.entries(sample.spans)) {
			const row = spanTotals.get(span) ?? { totalMs: 0, count: 0 };
			row.totalMs += stat.totalMs;
			row.count += stat.count;
			spanTotals.set(span, row);
		}
	}

	const spans: EngineCostSnapshot['spans'] = {};
	let attributedMs = 0;
	for (const [span, row] of spanTotals) {
		attributedMs += row.totalMs;
		spans[span] = {
			totalMs: row.totalMs,
			count: row.count,
			meanMs: row.count > 0 ? row.totalMs / row.count : 0,
			pctOfWall: wallMs > 0 ? (row.totalMs / wallMs) * 100 : 0,
		};
	}

	return {
		wallMs,
		spans,
		attributedMs,
		unattributedMs: Math.max(0, wallMs - attributedMs),
	};
}

export function topSpans(
	snapshot: EngineCostSnapshot,
	wallMsPerRun: number,
	iterations: number,
	limit = 12,
) {
	const runs = Math.max(1, iterations);
	return Object.entries(snapshot.spans)
		.map(([span, stat]) => {
			const perRunMs = stat.totalMs / runs;
			const callsPerRun = stat.count / runs;
			return {
				span,
				totalMs: perRunMs,
				pctOfWall: wallMsPerRun > 0 ? (perRunMs / wallMsPerRun) * 100 : 0,
				count: stat.count,
				callsPerRun,
				meanMs: callsPerRun > 0 ? perRunMs / callsPerRun : 0,
			};
		})
		.sort((a, b) => b.totalMs - a.totalMs)
		.slice(0, limit);
}

export function formatCostTable(reports: ScenarioCostReport[]) {
	const rows = reports.map((r) => {
		const top = r.topSpans[0];
		const enginePct = r.enginePctOfWall;
		return {
			scenario: `${r.group}/${r.id}`,
			'wall median (ms)': +r.wall.medianMs.toFixed(3),
			'engine %': +enginePct.toFixed(1),
			'top span': top?.span ?? '—',
			'top %': top ? +top.pctOfWall.toFixed(1) : 0,
		};
	});
	return rows;
}

export function formatSpanBreakdown(report: ScenarioCostReport) {
	return report.topSpans.map((s) => ({
		span: s.span,
		'ms/run': +s.totalMs.toFixed(3),
		'% wall': +s.pctOfWall.toFixed(1),
		'calls/run': +s.callsPerRun.toFixed(1),
		'mean (µs)': +(s.meanMs * 1000).toFixed(1),
	}));
}

export function buildHumanCostReport(scenarios: ScenarioCostReport[]): HumanCostReport {
	return {
		recordedAt: new Date().toISOString(),
		note: 'Engine instrumentation (profile:true). Spans are inclusive/nested. unattributed ≈ harness + DOM + gaps.',
		scenarios,
	};
}

export async function measureScenarioCost(
	id: string,
	group: string,
	run: (options?: { measure?: boolean }) => Promise<EngineCostSnapshot | void>,
	options: { iterations: number; warmup: number },
): Promise<ScenarioCostReport> {
	const { iterations, warmup } = options;
	const wallSamples: number[] = [];
	const snapshots: EngineCostSnapshot[] = [];

	for (let i = 0; i < warmup; i++) {
		await run();
	}

	for (let i = 0; i < iterations; i++) {
		const snap = await run({ measure: true });
		if (!snap) throw new Error(`Scenario ${group}/${id} did not return a cost snapshot`);
		wallSamples.push(snap.wallMs);
		snapshots.push(snap);
	}

	const merged = mergeCostSnapshots(snapshots);
	const wall = summarize(`${group}/${id}`, wallSamples);
	const engineMsPerRun = merged.attributedMs / Math.max(iterations, 1);
	const enginePctOfWall = wall.medianMs > 0 ? (engineMsPerRun / wall.medianMs) * 100 : 0;

	return {
		id,
		group,
		wall,
		snapshot: merged,
		enginePctOfWall,
		topSpans: topSpans(merged, wall.medianMs, iterations),
	};
}
