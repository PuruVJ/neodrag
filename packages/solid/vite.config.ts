import solid from 'vite-plugin-solid';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Unified config for @neodrag/solid. Real Vitest 4 reads `test`; `vp pack` reads `pack`.
export default {
	...defineConfig({
		plugins: [solid()],
		test: {
			include: ['./tests/**/*.test.tsx'],
			browser: {
				enabled: true,
				provider: playwright(),
				headless: true,
				instances: [{ browser: 'chromium', name: 'solid-chromium' }],
			},
		},
	}),
	pack: {
		entry: {
			index: './src/index.ts',
			sortable: './src/sortable.ts',
			resize: './src/resize.ts',
			rotate: './src/rotate.ts',
			drop: './src/drop.ts',
			collab: './src/collab.ts',
			splitpane: './src/splitpane.ts',
			panzoom: './src/panzoom.ts',
			swipe: './src/swipe.ts',
			select: './src/select.ts',
		},
		format: 'esm',
		dts: true,
		clean: true,
		platform: 'browser',
		target: 'esnext',
		treeshake: { moduleSideEffects: false },
		deps: { neverBundle: ['solid-js', '@neodrag/core', '@neodrag/core/sortable', '@neodrag/core/resize', '@neodrag/core/rotate', '@neodrag/core/drop', '@neodrag/core/collab', '@neodrag/core/splitpane', '@neodrag/core/panzoom', '@neodrag/core/swipe', '@neodrag/core/select'] },
	},
};
