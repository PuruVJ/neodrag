import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: {
		index: './src/index.ts',
		plugins: './src/plugins.ts',
		presets: './src/presets.ts',
		'drop/index': './src/drop/index.ts',
		'drop/plugins': './src/drop-plugins.ts',
		'testing/index': './src/testing/index.ts',
		'dev/index': './src/dev/index.ts',
		'sensors/index': './src/sensors/index.ts',
	},
	format: 'esm',
	dts: { resolve: true },
	clean: true,
	platform: 'browser',
	treeshake: { moduleSideEffects: false },
});
