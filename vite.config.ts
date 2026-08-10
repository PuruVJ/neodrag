import { defineConfig } from 'vite-plus';

// Workspace-root Vite+ config: drives `vp fmt` / `vp check` (oxfmt + oxlint) and `vp run` tasks.
// Oxfmt's Svelte/Astro support is opt-in and needs the framework compilers installed
// (`svelte` + `@astrojs/compiler` devDeps).
export default defineConfig({
	fmt: {
		svelte: true,
		astro: true,
		ignorePatterns: ['dist/**', '.astro/**', '.svelte-kit/**', '.debug/**', 'coverage/**'],
	},
});
