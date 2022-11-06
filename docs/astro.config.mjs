// @ts-check
import mdx from '@astrojs/mdx';
import prefetch from '@astrojs/prefetch';
import svelte from '@astrojs/svelte';
import compress from 'astro-compress';

import { defineConfig } from 'astro/config';

import { fastDimension } from 'svelte-fast-dimension';
import autoPreprocess from 'svelte-preprocess';
import sequential from 'svelte-sequential-preprocessor';

import remarkDirective from 'remark-directive';
import { h } from 'hastscript';
import { visit } from 'unist-util-visit';

/** @type {import('unified').Plugin<[], import('mdast').Root>} */
const divBlock = () => {
	return (tree) => {
		visit(tree, (node) => {
			if (
				!(
					node.type === 'textDirective' ||
					node.type === 'leafDirective' ||
					node.type === 'containerDirective'
				)
			)
				return;

			/** @type {string} */
			let tagName;
			let className = '';

			if (node.name === 'note') {
				tagName = 'div';
				className = 'note';
			}

			console.log(node);
			const data = node.data || (node.data = {});
			const attributes = node.attributes ?? (node.attributes = {});
			attributes.class += ` ${className}`;
			// @ts-ignore
			const hast = h(tagName ?? node.name, attributes);

			data.hName = hast.tagName;
			data.hProperties = hast.properties;
		});
	};
};

// https://astro.build/config
export default defineConfig({
	integrations: [
		svelte({ preprocess: sequential([autoPreprocess(), fastDimension()]) }),
		mdx(),
		prefetch(),
		compress(),
	],

	markdown: {
		remarkPlugins: [remarkDirective, divBlock],
	},
});
