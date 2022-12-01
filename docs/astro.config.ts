// @ts-check
import mdx from '@astrojs/mdx';
import prefetch from '@astrojs/prefetch';
import svelte from '@astrojs/svelte';
import compress from 'astro-compress';
import critters from 'astro-critters';
import serviceWorker from 'astrojs-service-worker';

import { defineConfig } from 'astro/config';

import { fastDimension } from 'svelte-fast-dimension';
import autoPreprocess from 'svelte-preprocess';
import sequential from 'svelte-sequential-preprocessor';

import UnpluginIcons from 'unplugin-icons/vite';
import AutoImport from 'unplugin-auto-import/astro';

import container from 'remark-custom-container';

// https://astro.build/config
export default defineConfig({
	integrations: [
		svelte({ preprocess: sequential([autoPreprocess(), fastDimension()]) }),
		mdx(),
		prefetch(),
		compress(),
		serviceWorker(),
		critters(),
		AutoImport({
			dts: './src/auto-imports.d.ts',
			imports: [
				{
					'$components/options/OptionsCode.astro': [['default', 'Code']],
				},
				{
					'$components/options/OptionsExamples.svelte': [['default', 'Examples']],
				},
				{
					'$components/options/OptionsExample.astro': [['default', 'Example']],
				},
			],
			include: [/\.astro$/, /\.svelte$/, /\.mdx$/, /\.md$/],
		}),
	],

	markdown: {
		extendDefaultPlugins: true,
		// @ts-ignore
		remarkPlugins: [container],
	},

	vite: {
		plugins: [UnpluginIcons({ autoInstall: true, compiler: 'svelte' })],
	},
});
