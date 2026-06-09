import { defineConfig } from 'tsdown';

export default defineConfig([
	{
		entry: ['./src/index.ts'],
		format: 'esm',
		dts: true,
		clean: true,
		platform: 'browser',
		treeshake: { moduleSideEffects: false },
		deps: { neverBundle: [/^@neodrag\/core(\/.*)?$/] },
	},
	{
		entry: ['./src/index.ts'],
		format: 'umd',
		globalName: 'NeoDrag',
		dts: true,
		outDir: 'dist/umd',
		platform: 'browser',
		treeshake: true,
		deps: { alwaysBundle: [/^@neodrag\/core(\/.*)?$/] },
	},
]);
