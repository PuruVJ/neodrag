import { defineConfig } from 'tsup';

export default defineConfig([
	{
		entry: [`./src/index.ts`],
		format: 'esm',
		dts: { resolve: true },
		external: ['solid-js', '@neodrag/core'],
		clean: true,
		treeshake: 'smallest',
	},
]);
