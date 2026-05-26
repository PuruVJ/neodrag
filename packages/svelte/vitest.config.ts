/// <reference types="@vitest/browser/providers/playwright" />
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [svelte()],
	test: {
		include: ['./tests/**/*.test.svelte.ts'],
		browser: {
			enabled: true,
			provider: 'playwright',
			headless: true,
			instances: [{ browser: 'chromium', name: 'svelte-chromium' }],
		},
	},
});
