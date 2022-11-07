// @ts-check
import mdx from '@astrojs/mdx';
import prefetch from '@astrojs/prefetch';
import svelte from '@astrojs/svelte';
import compress from 'astro-compress';
import serviceWorker from 'astrojs-service-worker'

import { defineConfig } from 'astro/config';

import { fastDimension } from 'svelte-fast-dimension';
import autoPreprocess from 'svelte-preprocess';
import sequential from 'svelte-sequential-preprocessor';
import UnpluginIcons from 'unplugin-icons/vite';

// import remarkCustomContainer from 'remark-custom-container';

// https://astro.build/config
export default defineConfig({
	integrations: [
		svelte({ preprocess: sequential([autoPreprocess(), fastDimension()]) }),
		mdx(),
		prefetch(),
		compress(),
		serviceWorker()
	],

	markdown: {
		// @ts-ignore
		// remarkPlugins: [remarkCustomContainer],
	},

	vite: {
		plugins: [UnpluginIcons({ autoInstall: true, compiler: 'svelte' })],
	},
});
