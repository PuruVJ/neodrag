// @ts-check
import { defineMDSveXConfig, escapeSvelte } from 'mdsvex';
import { getHighlighter } from 'shiki';

export default defineMDSveXConfig({
	extensions: ['.svelte.md', '.md', '.svx'],

	highlight: {
		highlighter: async (code, lang) => {
			const highlighter = await getHighlighter({ theme: 'material-palenight' });
			const highlightedCode = escapeSvelte(
				highlighter.codeToHtml(code.replace(/\t/g, '  '), { lang })
			);

			return `{@html \`${highlightedCode}\` }`;
		}
	}
});
