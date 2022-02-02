// @ts-check
import { defineConfig } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';

export default defineConfig([
	{
		input: './src/index.tsx',
		plugins: [esbuild({ minify: true }), resolve()],
		output: {
			file: './dist/index.js',
			format: 'esm',
			sourcemap: true,
		},
	},
	{
		input: './src/index.tsx',
		external: ['react', 'react-dom'],
		plugins: [dts({ respectExternal: true })],
		output: {
			file: './dist/index.d.ts',
			format: 'esm',
		},
	},
]);
