export type CostSpanStat = {
	totalMs: number;
	count: number;
	meanMs: number;
	pctOfWall: number;
};

export type EngineCostSnapshot = {
	wallMs: number;
	spans: Record<string, CostSpanStat>;
	attributedMs: number;
	unattributedMs: number;
};

export type CostProfileHost = object;

type SpanRow = { totalMs: number; count: number };

const stores = new WeakMap<CostProfileHost, Map<string, SpanRow>>();

export function costProfilingEnabled(host: CostProfileHost): boolean {
	return stores.has(host);
}

export function enableCostProfiling(host: CostProfileHost) {
	if (!stores.has(host)) stores.set(host, new Map());
}

export function resetCostProfiling(host: CostProfileHost) {
	stores.get(host)?.clear();
}

export function recordCostSpan(host: CostProfileHost, span: string, durationMs: number) {
	const store = stores.get(host);
	if (!store || durationMs < 0) return;
	const row = store.get(span) ?? { totalMs: 0, count: 0 };
	row.totalMs += durationMs;
	row.count += 1;
	store.set(span, row);
}

export function takeCostSnapshot(host: CostProfileHost, wallMs: number): EngineCostSnapshot {
	const store = stores.get(host);
	const spans: Record<string, CostSpanStat> = {};
	let attributedMs = 0;

	if (store) {
		for (const [name, row] of store) {
			attributedMs += row.totalMs;
			spans[name] = {
				totalMs: row.totalMs,
				count: row.count,
				meanMs: row.count > 0 ? row.totalMs / row.count : 0,
				pctOfWall: wallMs > 0 ? (row.totalMs / wallMs) * 100 : 0,
			};
		}
	}

	const unattributedMs = Math.max(0, wallMs - attributedMs);
	return { wallMs, spans, attributedMs, unattributedMs };
}

export function measureCost<T>(host: CostProfileHost, span: string, fn: () => T): T {
	if (!stores.has(host)) return fn();
	const t0 = performance.now();
	try {
		return fn();
	} finally {
		recordCostSpan(host, span, performance.now() - t0);
	}
}
