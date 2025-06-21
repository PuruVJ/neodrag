import { defineConfig } from 'tsup';

export default defineConfig([
	{
		entry: {
			'index.svelte': './src/index.svelte.ts',
			legacy: './src/legacy.ts',
		},
		format: 'esm',
		dts: true,
		external: ['svelte/action', '@neodrag/core'],
		clean: true,
		treeshake: 'smallest',
	},
]);
