import { defineConfig } from 'ttsup';

export default defineConfig({
	entry: ['./src/index.ts'],
	external: ['react'],
	minify: 'terser',
	format: 'esm',
	dts: { resolve: true },
	clean: true,
	sourcemap: true,
});
