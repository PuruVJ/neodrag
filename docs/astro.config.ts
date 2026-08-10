import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { h } from 'hastscript';
import rehypeAutolinkHeadings, { type Options } from 'rehype-autolink-headings';
import UnpluginIcons from 'unplugin-icons/vite';
import type { Plugin } from 'vite';
import { debugLogPlugin } from './debug-log-plugin.ts';

// Dev-only: in `astro dev`, Astro injects its island + HMR runtime at the very top of <head>, pushing
// the <meta charset="utf-8"> past the ~1024-byte window browsers pre-scan for an encoding. The dev
// server also sends a bare `text/html` (no charset), so the browser guesses its locale default
// (often Latin-1) and UTF-8 chars — em-dashes, smart quotes — garble into mojibake. Force the charset
// onto the response header in dev so localhost matches prod. (Prod is already correct: the built
// <meta charset> is the first tag in <head>, and Vercel serves `text/html; charset=utf-8`.)
const devHtmlCharset: Plugin = {
	name: 'neodrag:dev-html-charset',
	apply: 'serve',
	configureServer(server) {
		server.middlewares.use((_req, res, next) => {
			const setHeader = res.setHeader.bind(res);
			res.setHeader = (name, value) => {
				if (
					typeof name === 'string' &&
					name.toLowerCase() === 'content-type' &&
					typeof value === 'string' &&
					value.startsWith('text/html') &&
					!value.includes('charset')
				) {
					return setHeader(name, `${value}; charset=utf-8`);
				}
				return setHeader(name, value);
			};
			next();
		});
	},
};

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
	}),
);

// https://astro.build/config
export default defineConfig({
	site: 'https://neodrag.dev',
	integrations: [svelte(), mdx(), sitemap()],

	prefetch: {
		prefetchAll: true,
		defaultStrategy: 'hover',
	},

	markdown: {
		// extendDefaultPlugins: true,
		shikiConfig: {
			themes: {
				light: 'github-light',
				dark: 'github-dark',
			},
		},
		// @ts-ignore
		// remarkPlugins: [container],
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
							AnchorLinkIcon,
						),
					],
				} as Options,
			],
		],
	},

	vite: {
		plugins: [tailwindcss(), UnpluginIcons({ autoInstall: true, compiler: 'svelte' }), debugLogPlugin(), devHtmlCharset],

		optimizeDeps: {
			exclude: ['@neodrag/*'],
		},

		css: {
			devSourcemap: true,
		},

		build: {
			minify: 'terser',
			rolldownOptions: {
				output: {},
			},
		},
	},
});
