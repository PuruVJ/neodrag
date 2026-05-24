import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASELINE_REL, LATEST_REL } from '../report-storage.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const latest = join(root, LATEST_REL);
const baseline = join(root, BASELINE_REL);

if (!existsSync(latest)) {
	console.error('No latest report found. Run `pnpm bench` in packages/core first.');
	process.exit(1);
}

copyFileSync(latest, baseline);
console.log(`Recorded baseline → ${baseline}`);
