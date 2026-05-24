/// <reference types="@vitest/browser/providers/playwright" />
import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [solid()],
	test: {
		include: ['./tests/**/*.test.tsx'],
		browser: {
			enabled: true,
			provider: 'playwright',
			headless: true,
			instances: [{ browser: 'chromium', name: 'solid-chromium' }],
		},
	},
});
