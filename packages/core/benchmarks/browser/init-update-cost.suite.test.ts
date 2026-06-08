/**
 * Engine cost spans: bind.install vs bind.diff vs drag hot path.
 */
import { describe, expect, it } from 'vitest';
import { Neodrag } from '../../src/index.ts';
import { position } from '../../src/plugins.ts';
import { createBox, dragSteps, resetBody } from './helpers.ts';

type SpanRow = { meanMs: number; pctOfWall: number; count: number };

function topSpans(snapshot: { spans: Record<string, SpanRow> }, limit = 8) {
	return Object.entries(snapshot.spans)
		.sort((a, b) => b[1].meanMs - a[1].meanMs)
		.slice(0, limit)
		.map(([name, row]) => ({
			span: name,
			meanMs: +row.meanMs.toFixed(4),
			pct: +row.pctOfWall.toFixed(1),
			count: row.count,
		}));
}

describe('init vs update · engine cost spans', () => {
	it('bind.install dominates cold attach; bind.diff dominates churn', () => {
		resetBody();
		const engine = new Neodrag({ dev: false, plugins: [], profile: true });
		const box = createBox();

		const installWall = performance.now();
		const installHandle = engine.draggable(box, []);
		const installMs = performance.now() - installWall;
		const installSnap = engine.takeCostProfile(installMs);
		engine.resetCostProfile();

		installHandle.destroy();
		const warmHandle = engine.draggable(box, []);
		engine.resetCostProfile();

		let tick = 0;
		const churnWall = performance.now();
		for (let i = 0; i < 80; i++) {
			tick += 1;
			warmHandle.update([position({ current: { x: tick, y: tick } })]);
		}
		const churnMs = performance.now() - churnWall;
		const churnSnap = engine.takeCostProfile(churnMs);
		engine.resetCostProfile();

		const dragWall = performance.now();
		for (let i = 0; i < 24; i++) {
			dragSteps(box, DRAG.fromX, DRAG.fromY, DRAG.toX, DRAG.toY, 6);
		}
		const dragMs = performance.now() - dragWall;
		const dragSnap = engine.takeCostProfile(dragMs);

		console.log('\n=== Cost · cold install ===');
		console.table(topSpans(installSnap));
		console.log('\n=== Cost · 80× position churn (bind.diff) ===');
		console.table(topSpans(churnSnap));
		console.log('\n=== Cost · 24× 6-step drag ===');
		console.table(topSpans(dragSnap));

		const installBind = installSnap.spans['bind.install'];
		const churnDiff = churnSnap.spans['bind.diff'];
		expect(installBind).toBeDefined();
		expect(churnDiff).toBeDefined();
		expect(installBind!.meanMs).toBeGreaterThan(0);
		expect(churnDiff!.meanMs).toBeGreaterThan(0);
		expect(installBind!.pctOfWall + churnDiff!.pctOfWall).toBeGreaterThan(10);

		warmHandle.destroy();
		engine.dispose();
		box.remove();
	});
});

const DRAG = { fromX: 120, fromY: 120, toX: 220, toY: 220 };
