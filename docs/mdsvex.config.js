// @ts-check
import { defineMDSveXConfig, escapeSvelte } from 'mdsvex';
import { getHighlighter } from 'shiki';
import fs from 'fs';

export default defineMDSveXConfig({
	extensions: ['.svelte.md', '.md', '.svx'],

	highlight: {
		highlighter: async (code, lang) => {
			const highlighter = await getHighlighter({
				theme: JSON.parse(fs.readFileSync('./shiki-themes/bearded-arc.json', 'utf-8'))
			});
			const highlightedCode = escapeSvelte(
				highlighter.codeToHtml(code.replace(/\t/g, '  '), { lang })
			);

			return `{@html \`${highlightedCode}\` }`;
		}
	}
});
