import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { HumanCostReport } from '../browser/cost-report.ts';

const HEADROOM = 1.3;
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const latest = join(root, 'benchmarks/reports/human-cost.json');
const baseline = join(root, 'benchmarks/reports/human-cost-baseline.json');

if (!existsSync(latest)) {
	console.error('No human-cost report. Run `pnpm bench:cost` in packages/core first.');
	process.exit(1);
}

const report = JSON.parse(readFileSync(latest, 'utf8')) as HumanCostReport;
for (const scenario of report.scenarios) {
	scenario.wall.medianMs *= HEADROOM;
	scenario.wall.meanMs *= HEADROOM;
	scenario.wall.p99Ms *= HEADROOM;
	scenario.wall.maxMs *= HEADROOM;
}
writeFileSync(baseline, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Recorded human-cost baseline with ${HEADROOM}× headroom → ${baseline}`);
