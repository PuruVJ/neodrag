// @ts-check
import mdx from '@astrojs/mdx';
import prefetch from '@astrojs/prefetch';
import svelte from '@astrojs/svelte';
import compress from 'astro-compress';
import critters from 'astro-critters';
import serviceWorker from 'astrojs-service-worker';
import { rehypeHeadingIds } from '@astrojs/markdown-remark';

import { defineConfig } from 'astro/config';

import { fastDimension } from 'svelte-fast-dimension';
import autoPreprocess from 'svelte-preprocess';
import sequential from 'svelte-sequential-preprocessor';

import AutoImport from 'unplugin-auto-import/astro';
import UnpluginIcons from 'unplugin-icons/vite';

import { h } from 'hastscript';
import rehypeAutolinkHeadings, { type Options } from 'rehype-autolink-headings';
import container from 'remark-custom-container';

const AnchorLinkIcon = h(
	'svg',
	{
		width: '0.75em',
		height: '0.75em',
		version: 1.1,
		viewBox: '0 0 16 16',
		xlmns: 'http://www.w3.org/2000/svg',
	},
	h('path', {
		fillRule: 'evenodd',
		fill: 'currentcolor',
		d: 'M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z',
	})
);

// https://astro.build/config
export default defineConfig({
	integrations: [
		svelte({ preprocess: sequential([autoPreprocess(), fastDimension()]) }),
		mdx(),
		prefetch(),
		// compress(),
		// serviceWorker(),
		// critters(),
		AutoImport({
			dts: './src/auto-imports.d.ts',
			imports: [
				{
					'$components/options/OptionsCode.astro': [['default', 'Code']],
				},
				{
					'$components/options/OptionsExamples.svelte': [
						['default', 'Examples'],
					],
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
		rehypePlugins: [
			rehypeHeadingIds,
			[
				rehypeAutolinkHeadings,
				{
					test: (heading) => /^h[1-5]$/i.test(heading.tagName),
					behavior: 'append',
					properties: {
						ariaHidden: 'true',
						tabindex: -1,
						class: 'unstyled heading-anchor',
					},
					content: (heading) => [
						h(
							`span`,
							{
								ariaHidden: 'true',
							},
							AnchorLinkIcon
						),
					],
				} as Options,
			],
		],
	},

	vite: {
		// @ts-ignore
		plugins: [UnpluginIcons({ autoInstall: true, compiler: 'svelte' })],
	},
});
