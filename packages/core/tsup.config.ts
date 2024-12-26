import { defineConfig } from 'tsup';

export default defineConfig([
	{
		entry: {
			index: `./src/index.ts`,
			plugins: `./src/plugins_signals.ts`,
		},
		format: 'esm',
		target: 'es2022',
		platform: 'browser',
		dts: { resolve: true },
		noExternal: ['alien-signals'],
		clean: true,
		treeshake: 'smallest',
	},
]);
