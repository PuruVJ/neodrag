import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const latest = resolve(root, 'benchmarks/reports/lifecycle-latest.json');
const baseline = resolve(root, 'benchmarks/reports/lifecycle-baseline.json');

if (!existsSync(latest)) {
	console.error('Missing lifecycle-latest.json — run `pnpm bench:lifecycle` first.');
	process.exit(1);
}

copyFileSync(latest, baseline);
console.log(`Wrote ${baseline}`);
