import path from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [svelte()],
	root: import.meta.dirname,
	resolve: {
		alias: {
			'@neodrag/test': path.resolve(import.meta.dirname, '../../../testing/src/index.ts'),
		},
	},
});
