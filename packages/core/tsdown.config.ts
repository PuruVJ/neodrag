import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: {
		index: './src/index.ts',
		plugins: './src/plugins.ts',
		'drop/index': './src/drop.ts',
		'drop/plugins': './src/drop-plugins.ts',
	},
	format: 'esm',
	dts: { resolve: true },
	clean: true,
	platform: 'browser',
	treeshake: { moduleSideEffects: false },
});
