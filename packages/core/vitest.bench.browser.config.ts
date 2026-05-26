/// <reference types="@vitest/browser/providers/playwright" />
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [svelte()],
	test: {
		include: ['benchmarks/browser/**/*.test.ts'],
		testTimeout: 180_000,
		hookTimeout: 60_000,
		browser: {
			enabled: true,
			provider: 'playwright',
			headless: true,
			instances: [{ browser: 'chromium', name: 'bench-chromium' }],
		},
	},
});
