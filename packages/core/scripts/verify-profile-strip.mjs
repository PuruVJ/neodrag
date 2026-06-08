import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const needles = [
	'127.0.0.1:7434',
	'ac64e1c3-d2a6-4561-a995-7ab24ced017d',
	'DEBUG_SESSION = "ae0e33"',
	'X-Debug-Session-Id',
];

function walk(dir, files = []) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, entry.name);
		if (entry.isDirectory()) walk(p, files);
		else if (/\.(mjs|js|cjs)$/.test(entry.name)) files.push(p);
	}
	return files;
}

if (!fs.existsSync(distDir)) {
	console.error('dist/ missing — run tsdown first');
	process.exit(1);
}

const hits = [];
for (const file of walk(distDir)) {
	const text = fs.readFileSync(file, 'utf8');
	for (const needle of needles) {
		if (text.includes(needle)) hits.push({ file, needle });
	}
}

if (hits.length) {
	console.error('Profile strip verification failed:');
	for (const { file, needle } of hits) {
		console.error(`  ${needle} in ${path.relative(distDir, file)}`);
	}
	process.exit(1);
}

console.log('Profile strip OK — no debug ingest in dist');
