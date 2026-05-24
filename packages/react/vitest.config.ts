/// <reference types="@vitest/browser/providers/playwright" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react()],
	test: {
		include: ['./tests/**/*.test.tsx'],
		browser: {
			enabled: true,
			provider: 'playwright',
			headless: true,
			instances: [{ browser: 'chromium', name: 'react-chromium' }],
		},
	},
});
