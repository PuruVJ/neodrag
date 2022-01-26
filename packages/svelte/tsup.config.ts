import { defineConfig } from 'tsup';
import { readFileSync } from 'node:fs';

const banner = readFileSync('./src/draggable.d.ts', 'utf8');

export default defineConfig({
	sourcemap: true,
	clean: true,
	dts: { banner },
	format: ['esm'],
	external: [],
	entryPoints: ['src/index.ts'],
	minify: true,
	target: 'es2021',
});
