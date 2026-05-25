import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: { index: './src/index.ts' },
	format: 'esm',
	dts: { resolve: true },
	clean: true,
	platform: 'browser',
	treeshake: { moduleSideEffects: false },
});
