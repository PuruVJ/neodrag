import { defineConfig } from 'tsdown';

export default defineConfig([
	{
		entry: {
			'index.svelte': './src/index.svelte.ts',
			plugins: './src/plugins.ts',
			'drop/index.svelte': './src/drop/index.svelte.ts',
			'sortable/index.svelte': './src/sortable/index.svelte.ts',
			'resize/index.svelte': './src/resize/index.svelte.ts',
		},
		format: 'esm',
		dts: true,
		clean: true,
		platform: 'browser',
		treeshake: { moduleSideEffects: false },
		deps: { neverBundle: ['svelte', 'svelte/attachments', '@neodrag/core'] },
	},
]);
