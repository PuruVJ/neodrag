import { PluggableList } from '@mdx-js/mdx/lib/core.js';
import type { AstroIntegration } from 'astro';
import type { Options as RemarkRehypeOptions } from 'remark-rehype';
export declare type MdxOptions = {
    remarkPlugins?: PluggableList;
    rehypePlugins?: PluggableList;
    recmaPlugins?: PluggableList;
    /**
     * Choose which remark and rehype plugins to inherit, if any.
     *
     * - "markdown" (default) - inherit your project’s markdown plugin config ([see Markdown docs](https://docs.astro.build/en/guides/markdown-content/#configuring-markdown))
     * - "astroDefaults" - inherit Astro’s default plugins only ([see defaults](https://docs.astro.build/en/reference/configuration-reference/#markdownextenddefaultplugins))
     * - false - do not inherit any plugins
     */
    extendPlugins?: 'markdown' | 'astroDefaults' | false;
    remarkRehype?: RemarkRehypeOptions;
};
export default function mdx(mdxOptions?: MdxOptions): AstroIntegration;
