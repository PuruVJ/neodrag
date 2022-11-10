// @ts-check
import { defineConfig } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default defineConfig([
	{
		input: './src/index.ts',
		external: 'vue',
		plugins: [esbuild(), resolve(), terser()],
		output: {
			file: './dist/index.js',
			format: 'esm',
			sourcemap: true,
		},
	},
	{
		input: './src/index.ts',
		external: ['vue'],
		plugins: [dts({ respectExternal: true, compilerOptions: { preserveSymlinks: false } })],
		output: {
			file: './dist/index.d.ts',
			format: 'esm',
		},
	},
]);
