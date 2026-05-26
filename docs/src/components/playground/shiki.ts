import { createHighlighter } from 'shiki';

const THEMES = {
	light: 'github-light',
	dark: 'github-dark',
} as const;

const LANGS = ['svelte', 'vue', 'tsx', 'ts', 'jsx', 'javascript'] as const;

let highlighter_promise: ReturnType<typeof createHighlighter> | null = null;

function get_highlighter() {
	highlighter_promise ??= createHighlighter({
		themes: [THEMES.light, THEMES.dark],
		langs: [...LANGS],
	});
	return highlighter_promise;
}

/** Same dual-theme output shape as Astro `<Code themes={{ light, dark }} />`. */
export async function highlight_playground_code(code: string, lang: string) {
	const highlighter = await get_highlighter();

	let resolved_lang = lang;
	if (!highlighter.getLoadedLanguages().includes(lang)) {
		resolved_lang = lang === 'solid' || lang === 'react' ? 'tsx' : 'ts';
	}

	const html = highlighter.codeToHtml(code, {
		lang: resolved_lang,
		themes: {
			light: THEMES.light,
			dark: THEMES.dark,
		},
	});

	return html.replace('class="shiki shiki-themes', 'class="astro-code astro-code-themes');
}
