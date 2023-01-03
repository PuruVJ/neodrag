import { defineConfig } from 'ttsup';

const config = defineConfig([
	{
		entry: ['./src/index.ts'],
		format: 'esm',
		dts: { resolve: true },
		clean: true,
	},
	{
		entry: ['./src/index.ts'],
		minify: 'terser',
		format: 'esm',
		dts: { resolve: true },
		clean: true,
		outDir: 'dist/min',
	},
]);

export default config;
