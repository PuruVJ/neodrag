import { defineConfig, type Format } from 'tsup';

export default defineConfig([
	{
		entry: [`./src/index.ts`],
		format: 'esm',
		dts: true,
		external: ['@neodrag/core'],
		clean: true,
		treeshake: 'smallest',
	},
]);
