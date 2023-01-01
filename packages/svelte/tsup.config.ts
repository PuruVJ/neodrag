import { defineConfig } from 'ttsup';

export default defineConfig({
	entry: ['./src/index.ts'],
	minify: 'terser',
	format: 'esm',
	dts: { resolve: true },
	clean: true,
	sourcemap: true,
});
