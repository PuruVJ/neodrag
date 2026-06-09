import { defineConfig } from 'tsdown';

export default defineConfig({
	tsconfig: './tsconfig.build.json',
	entry: {
		index: './src/index.ts',
		'testing/index': './src/testing/index.ts',
		'dev/index': './src/dev/index.ts',
		'sensors/index': './src/sensors/index.ts',
		'interaction/index': './src/interaction-input.ts',
	},
	format: 'esm',
	dts: { resolve: true },
	clean: true,
	platform: 'browser',
	treeshake: { moduleSideEffects: false },
});
