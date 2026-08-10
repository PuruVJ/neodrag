import { defineConfig } from 'vitest/config';

// Unified config for @neodrag/liveblocks. Real Vitest 4 reads `test` (node env); `vp pack` reads `pack`.
export default {
	...defineConfig({
		test: {
			environment: 'node',
			include: ['tests/**/*.test.ts'],
		},
	}),
	pack: {
		entry: { index: './src/index.ts' },
		format: 'esm',
		dts: true,
		clean: true,
		platform: 'browser',
		target: 'esnext',
		treeshake: { moduleSideEffects: false },
		deps: { neverBundle: ['@neodrag/core', '@liveblocks/client'] },
	},
};
