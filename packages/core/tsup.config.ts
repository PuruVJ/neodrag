import { defineConfig } from 'tsup';

export default defineConfig([
	{
		entry: {
			index: `./src/index.ts`,
			plugins: `./src/plugins.ts`,
			'drop/index': `./src/drop/index.ts`,
			'drop/plugins': `./src/drop/plugins.ts`,
			'interactions/index': `./src/interactions/index.ts`,
		},
		format: 'esm',
		dts: { resolve: true },
		clean: true,
		treeshake: 'smallest',
	},
]);
