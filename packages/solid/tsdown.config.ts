import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: {
		index: './src/index.ts',
		plugins: './src/plugins.ts',
		'drop/index': './src/drop/index.ts',
	},
	format: 'esm',
	dts: { resolve: true },
	clean: true,
	platform: 'browser',
	treeshake: { moduleSideEffects: false },
	deps: { neverBundle: ['solid-js', '@neodrag/core'] },
});
