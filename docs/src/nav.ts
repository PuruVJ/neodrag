import { getCollection } from 'astro:content';

const migrations_collection = (await getCollection('migration')).sort((a, b) =>
	a.id > b.id ? 1 : -1,
);
const plugin_collection = (await getCollection('plugin')).sort((a, b) => (a.id > b.id ? 1 : -1));

export const plugins_list = plugin_collection
	.map((v) => v.id.replace(/\d{2}-(.+)\/page/, '$1'))
	.filter((v) => v !== 'introduction');

// Plugin pages are grouped into nav sections by their `section` frontmatter (default
// `'documentation'`), rendered in this order. Within a section, pages keep their numeric order.
const SECTION_ORDER = ['documentation', 'extras', 'advanced'] as const;

export function get_nav_list(framework: string) {
	framework = !framework || framework === 'core' ? 'svelte' : framework;

	const by_section = new Map<string, { slug: string; title: string }[]>();
	for (const v of plugin_collection) {
		const section = v.data.section ?? 'documentation';
		const list = by_section.get(section) ?? [];
		list.push({
			slug: `/docs/${framework}/plugin/${v.id.replace(/\d{2}-(.+)\/page/, '$1')}`,
			title: v.data.nav_title ?? v.data.title,
		});
		by_section.set(section, list);
	}
	const plugin_groups = SECTION_ORDER.filter((s) => by_section.has(s)).map((s) => ({
		title: s,
		sections: by_section.get(s)!,
	}));

	return [
		{
			title: 'start',
			sections: [{ slug: `/docs/${framework}`, title: 'Getting Started' }],
		},
		...plugin_groups,
		{
			title: 'migration',
			sections: migrations_collection.map((v) => ({
				slug: `/docs/${framework}/migration/${v.id.replace(/\d{2}-(.+)\/page/, '$1')}`,
				title: v.data.nav_title ?? v.data.title,
			})),
		},
	] satisfies {
		title: string;
		sections: {
			title: string;
			slug: string;
		}[];
	}[];
}
