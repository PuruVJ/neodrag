import { defineConfig } from 'tsdown';

export default defineConfig([
	{
		entry: {
			'index.svelte': './src/index.svelte.ts',
		},
		format: 'esm',
		dts: true,
		clean: true,
		platform: 'browser',
		treeshake: { moduleSideEffects: false },
		deps: { neverBundle: ['svelte', 'svelte/attachments', '@neodrag/core', '@neodrag/core/dnd'] },
	},
]);
