/// <reference types="@vitest/browser/providers/playwright" />
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [vue()],
	test: {
		include: ['./tests/**/*.test.ts'],
		browser: {
			enabled: true,
			provider: 'playwright',
			headless: true,
			instances: [{ browser: 'chromium', name: 'vue-chromium' }],
		},
	},
});
