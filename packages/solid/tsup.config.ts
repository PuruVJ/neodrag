import { defineConfig } from 'ttsup';

export default defineConfig({
	entry: ['./src/index.ts'],
	external: ['solid-js'],
	minify: 'terser',
	format: 'esm',
	dts: { resolve: true },
	clean: true,
	sourcemap: true,
});
