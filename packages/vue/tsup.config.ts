import { defineConfig } from 'tsup';

export default defineConfig([
	{
		entry: [`./src/index.ts`],
		format: 'esm',
		dts: true,
		external: ['vue', '@neodrag/core'],
		clean: true,
		treeshake: 'smallest',
	},
]);
