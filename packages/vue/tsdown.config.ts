import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: {
		index: './src/index.ts',
		plugins: './src/plugins.ts',
		'drop/index': './src/drop/index.ts',
		'resize': './src/resize.ts',
	},
	format: 'esm',
	dts: true,
	clean: true,
	platform: 'browser',
	treeshake: { moduleSideEffects: false },
	deps: { neverBundle: ['vue', '@neodrag/core'] },
});
