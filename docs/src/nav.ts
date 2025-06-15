import { getCollection } from 'astro:content';

const framework_collection = (await getCollection('framework')).sort((a, b) =>
	a.id > b.id ? 1 : -1,
);
const migrations_collection = (await getCollection('migration')).sort((a, b) =>
	a.id > b.id ? 1 : -1,
);
const plugin_collection = (await getCollection('plugin')).sort((a, b) => (a.id > b.id ? 1 : -1));

export function get_nav_list(framework: string) {
	framework = framework === 'core' ? 'svelte' : framework;

	return [
		{
			title: 'framework',
			sections: framework_collection.map((v) => ({
				slug: `/docs/${v.id.replace(/\d{2}-(.+)\/page/, '$1')}`,
				title: v.data.nav_title ?? v.data.title,
			})),
		},
		{
			title: 'plugin',
			sections: plugin_collection.map((v) => ({
				slug: `/docs/${framework}/plugin/${v.id.replace(/\d{2}-(.+)\/page/, '$1')}`,
				title: v.data.nav_title ?? v.data.title,
			})),
		},
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
