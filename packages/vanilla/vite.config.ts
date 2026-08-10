import { defineConfig } from 'vitest/config';

// Unified config for @neodrag/vanilla. Real Vitest 4 reads `test` (node env); `vp pack` reads `pack`
// (ESM + UMD builds, was tsdown.config.ts).
export default {
	...defineConfig({
		test: {
			include: ['tests/**/*.test.ts'],
			environment: 'node',
		},
	}),
	pack: [
		{
			entry: [
				'./src/index.ts',
				'./src/sortable.ts',
				'./src/resize.ts',
				'./src/rotate.ts',
				'./src/drop.ts',
				'./src/collab.ts',
				'./src/splitpane.ts',
				'./src/panzoom.ts',
				'./src/swipe.ts',
				'./src/select.ts',
			],
			format: 'esm',
			dts: true,
			clean: true,
			platform: 'browser',
			target: 'esnext',
			treeshake: { moduleSideEffects: false },
			deps: { neverBundle: [/^@neodrag\/core(\/.*)?$/] },
		},
		{
			entry: ['./src/index.ts'],
			format: 'umd',
			globalName: 'NeoDrag',
			dts: true,
			outDir: 'dist/umd',
			platform: 'browser',
			target: 'esnext',
			treeshake: true,
			deps: { alwaysBundle: [/^@neodrag\/core(\/.*)?$/] },
		},
	],
};
