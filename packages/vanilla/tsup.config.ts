import { defineConfig, type Format } from 'tsup';

export default defineConfig([
	{
		entry: [`./src/index.ts`],
		format: 'esm',
		dts: true,
		external: ['svelte/action', '@neodrag/core'],
		clean: true,
		treeshake: 'smallest',
	},
	{
		entry: ['./src/index.ts'],
		format: 'umd' as Format,
		globalName: 'NeoDrag',
		dts: true,
		clean: true,
		outDir: 'dist/umd',
		treeshake: true,
	},
]);
