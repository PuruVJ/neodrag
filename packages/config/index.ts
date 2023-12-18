import { defineConfig } from 'tsup';

export const coreConfig = ({ dtsBanner }: { dtsBanner?: string } = { dtsBanner: '' }) =>
	defineConfig([
		{
			entry: ['./src/index.ts'],
			format: 'esm',
			external: ['vue', 'react', 'solid-js', 'svelte'],
			dts: { resolve: true, banner: dtsBanner },
			clean: true,
			treeshake: 'smallest',
		},
		{
			entry: ['./src/index.ts'],
			minify: 'terser',
			external: ['vue', 'react', 'solid-js', 'svelte'],
			format: 'esm',
			clean: true,
			outDir: 'dist/min',
			treeshake: 'smallest',
		},
	]);
