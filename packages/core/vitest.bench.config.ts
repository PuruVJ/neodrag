import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		browser: {
			enabled: false,
		},
		include: ['benchmarks/**/*.bench.ts', 'benchmarks/**/*.guard.test.ts'],
		benchmark: {
			include: ['benchmarks/**/*.bench.ts'],
		},
	},
});
