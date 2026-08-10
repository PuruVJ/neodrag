import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const framework = defineCollection({
	loader: glob({
		pattern: '**/*.mdx',
		base: './src/content/framework',
		// generateId: ({ entry }) => entry.replace(/\d{2}-(.+)\/\+page\.mdx/, '$1'),
	}),
	schema: z.object({
		title: z.string(),
		tagline: z.string(),
		nav_title: z.string().optional(),
	}),
});

const migration = defineCollection({
	loader: glob({
		pattern: '**/+page.mdx',
		base: './src/content/guide',
		// generateId: ({ entry }) => entry.replace(/\d{2}-(.+)\/\+page\.mdx/, '$1'),
	}),
	schema: z.object({
		title: z.string(),
		tagline: z.string(),
		nav_title: z.string().optional(),
	}),
});

const plugin = defineCollection({
	loader: glob({
		pattern: '**/*.mdx',
		base: './src/content/plugin',
		// generateId: ({ entry }) => entry.replace(/\d{2}-(.+)\/\+page/, '$1'),
	}),
	schema: z.object({
		title: z.string(),
		tagline: z.string(),
		nav_title: z.string().optional(),
		/** Nav grouping — `'documentation'` (default), `'extras'` (the `use:[]` plugins), or `'advanced'`. */
		section: z.enum(['documentation', 'extras', 'advanced']).optional(),
	}),
});

export const collections = {
	framework,
	migration,
	plugin,
};
