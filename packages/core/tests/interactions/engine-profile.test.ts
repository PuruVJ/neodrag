import { describe, expect, it } from 'vitest';
import {
	enableCostProfiling,
	measureCost,
	recordCostSpan,
	resetCostProfiling,
	takeCostSnapshot,
} from '../../src/engine-profile.ts';

describe('engine-profile', () => {
	it('accumulates span totals and computes pct of wall', () => {
		const host = {};
		enableCostProfiling(host);
		measureCost(host, 'a', () => {
			recordCostSpan(host, 'b', 1);
		});
		const snap = takeCostSnapshot(host, 10);
		expect(snap.spans.a?.totalMs).toBeGreaterThan(0);
		expect(snap.spans.b?.totalMs).toBe(1);
		expect(snap.attributedMs).toBeGreaterThanOrEqual(1);
		resetCostProfiling(host);
		expect(takeCostSnapshot(host, 5).attributedMs).toBe(0);
	});

	it('no-ops when profiling is disabled', () => {
		const host = {};
		measureCost(host, 'x', () => recordCostSpan(host, 'x', 5));
		expect(takeCostSnapshot(host, 1).attributedMs).toBe(0);
	});
});
