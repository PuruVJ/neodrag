// @ts-check
import adapter from '@sveltejs/adapter-static';
import { escapeSvelte, mdsvex } from 'mdsvex';
import { getHighlighter } from 'shiki';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svelte.md', '.md', '.svx'],

	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess(),
		mdsvex({
			extensions: ['.svelte.md', '.md', '.svx'],

			highlight: {
				highlighter: async (code, lang) => {
					const highlighter = await getHighlighter({ theme: 'material-palenight' });
					const highlightedCode = escapeSvelte(
						highlighter.codeToHtml(code.replace(/\t/g, '  '), { lang })
					);

					return `{@html \`${highlightedCode}\` }`;
				}
			},

			remarkPlugins: [],
			rehypePlugins: []
		})
	],

	kit: {
		adapter: adapter(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte'
	}
};

export default config;
