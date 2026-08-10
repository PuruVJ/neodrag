import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Unified config for @neodrag/core. Real Vitest 4 reads the `test` block (was vitest.config.ts);
// `vp pack` reads the `pack` block (was tsdown.config.ts). `vp run test` → `vitest run`, `vp pack`
// builds. Typed with `vitest/config` (real Vitest 4 types); `pack` is attached as a plain field that
// `vp pack` consumes at runtime. Mouse/pointer interaction is synthesized in-browser by
// `tests/mouse.ts` (DOM event dispatch) — no Playwright-side custom commands.

export default {
	...defineConfig({
		plugins: [svelte()],
		optimizeDeps: {
			exclude: ['chromium-bidi', 'fsevents'],
		},
		test: {
			setupFiles: ['./tests/setup-interaction-defaults.ts'],
			browser: {
				enabled: true,
				provider: playwright(),
				headless: true,
				instances: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }],
			},
			coverage: { provider: 'v8' },
			include: [
				'./tests/*.test.ts',
				'./tests/*.test.svelte.ts',
				'./tests/interactions/*.test.ts',
				'./tests/interactions/*.test.svelte.ts',
			],
			// In-source tests (`if (import.meta.vitest) { … }`) — run in the real-browser matrix; the build
			// strips them from dist via `pack.define`.
			includeSource: ['./src/**/*.ts'],
		},
	}),

	// ── build (vp pack — tsdown settings; consumed by `vp pack`, not part of Vitest's UserConfig) ──
	pack: {
		tsconfig: './tsconfig.build.json',
		// All entries build in ONE pass so shared modules (shared.ts/engine.ts) hoist into a common
		// chunk rather than inlining per entry — keeps `sharedEngine` a true singleton across subpaths.
		entry: {
			index: './src/index.ts',
			'sortable/index': './src/sortable/index.ts',
			'resize/index': './src/resize/index.ts',
			'rotate/index': './src/rotate/index.ts',
			'drop/index': './src/drop/index.ts',
			'splitpane/index': './src/splitpane/index.ts',
			'panzoom/index': './src/panzoom/index.ts',
			'swipe/index': './src/swipe/index.ts',
			'select/index': './src/select/index.ts',
			'collab/index': './src/collab/index.ts',
			'testing/index': './src/testing/index.ts',
			'dev/index': './src/dev/index.ts',
			'sensors/index': './src/sensors/index.ts',
			'interaction/index': './src/interaction-input.ts',
		},
		format: 'esm',
		dts: true,
		clean: true,
		platform: 'browser',
		target: 'esnext',
		treeshake: { moduleSideEffects: false },
		// In-source vitest blocks fold to `if (undefined)` and treeshake out of dist.
		define: { 'import.meta.vitest': 'undefined' },
	},
};
