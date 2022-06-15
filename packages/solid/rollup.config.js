// @ts-check
import resolve from '@rollup/plugin-node-resolve';
import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import { terser } from 'rollup-plugin-terser';

export default defineConfig([
	{
		input: './src/index.ts',
		external: ['solid-js', ],
		plugins: [esbuild(), resolve(), terser()],
		output: {
			file: './dist/index.js',
			format: 'esm',
			sourcemap: true,
		},
	},
	{
		input: './src/index.ts',
		external: ['solid-js'],
		plugins: [dts({ respectExternal: true })],
		output: {
			file: './dist/index.d.ts',
			format: 'esm',
		},
	},
]);
