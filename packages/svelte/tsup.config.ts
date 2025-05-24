import { defineConfig } from 'tsup';

export default defineConfig([
	{
		entry: [`./src/index.svelte.ts`],
		format: 'esm',
		dts: true,
		external: ['svelte/action', '@neodrag/core'],
		clean: true,
		treeshake: 'smallest',
	},
]);
