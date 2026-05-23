/// <reference types="@vitest/browser/providers/playwright" />
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';
import base from './vitest.config.ts';

const { test: _test, ...rest } = base as ReturnType<typeof defineConfig>;

export default defineConfig({
	...rest,
	plugins: [svelte()],
	test: {
		include: ['./tests/interactions/**/*.test.svelte.ts'],
		browser: {
			enabled: true,
			provider: 'playwright',
			headless: true,
			instances: [{ browser: 'chromium', name: 'interactions-chromium' }],
		},
	},
});
