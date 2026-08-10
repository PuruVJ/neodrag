import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Unified config for @neodrag/svelte. Real Vitest 4 reads `test` (was vitest.config.ts); `vp pack`
// reads `pack` (was tsdown.config.ts). `vp run test` → `vitest run`, `vp pack` builds.
export default {
	...defineConfig({
		plugins: [svelte()],
		test: {
			include: ['./tests/**/*.test.svelte.ts'],
			browser: {
				enabled: true,
				provider: playwright(),
				headless: true,
				instances: [{ browser: 'chromium', name: 'svelte-chromium' }],
			},
		},
	}),

	// ── build (vp pack — tsdown settings) ──────────────────────────────────────
	pack: {
		entry: {
			'index.svelte': './src/index.svelte.ts',
			'sortable.svelte': './src/sortable.svelte.ts',
			'resize.svelte': './src/resize.svelte.ts',
			'rotate.svelte': './src/rotate.svelte.ts',
			'drop.svelte': './src/drop.svelte.ts',
			'splitpane.svelte': './src/splitpane.svelte.ts',
			'swipe.svelte': './src/swipe.svelte.ts',
			'select.svelte': './src/select.svelte.ts',
			'panzoom.svelte': './src/panzoom.svelte.ts',
			collab: './src/collab.ts',
		},
		format: 'esm',
		dts: true,
		clean: true,
		platform: 'browser',
		target: 'esnext',
		treeshake: { moduleSideEffects: false },
		// `@neodrag/core` (and every subpath) stays EXTERNAL — one core copy at runtime, hence one
		// shared engine. Never inline it into the wrapper bundles.
		deps: {
			neverBundle: [
				'svelte',
				'svelte/attachments',
				'@neodrag/core',
				'@neodrag/core/sortable',
				'@neodrag/core/resize',
				'@neodrag/core/rotate',
				'@neodrag/core/drop',
				'@neodrag/core/splitpane',
				'@neodrag/core/panzoom',
				'@neodrag/core/swipe',
				'@neodrag/core/select',
				'@neodrag/core/collab',
			],
		},
	},
};
