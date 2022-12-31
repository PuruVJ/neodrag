/**
 * Pipeline to:
 *
 * 1. Parse MDX (serialized markdown with embedded JSX, ESM, and  expressions)
 * 2. Transform through remark (mdast), rehype (hast), and recma (esast)
 * 3. Serialize as JavaScript
 *
 * @param {ProcessorOptions} [options]
 * @return {Processor}
 */
export function createProcessor(options?: ProcessorOptions | undefined): Processor;
export type Processor = import('unified').Processor;
export type PluggableList = import('unified').PluggableList;
export type RecmaDocumentOptions = import('./plugin/recma-document.js').RecmaDocumentOptions;
export type RecmaStringifyOptions = import('./plugin/recma-stringify.js').RecmaStringifyOptions;
export type RecmaJsxRewriteOptions = import('./plugin/recma-jsx-rewrite.js').RecmaJsxRewriteOptions;
export type RemarkRehypeOptions = import('remark-rehype').Options;
export type BaseProcessorOptions = {
    /**
     * Whether to keep JSX.
     */
    jsx?: boolean | undefined;
    /**
     * Format of the files to be processed.
     */
    format?: "mdx" | "md" | undefined;
    /**
     * Whether to compile to a whole program or a function body..
     */
    outputFormat?: "program" | "function-body" | undefined;
    /**
     * Extensions (with `.`) for markdown.
     */
    mdExtensions?: string[] | undefined;
    /**
     * Extensions (with `.`) for MDX.
     */
    mdxExtensions?: string[] | undefined;
    /**
     * List of recma (esast, JavaScript) plugins.
     */
    recmaPlugins?: import("unified").PluggableList | undefined;
    /**
     * List of remark (mdast, markdown) plugins.
     */
    remarkPlugins?: import("unified").PluggableList | undefined;
    /**
     * List of rehype (hast, HTML) plugins.
     */
    rehypePlugins?: import("unified").PluggableList | undefined;
    /**
     * Options to pass through to `remark-rehype`.
     */
    remarkRehypeOptions?: import("mdast-util-to-hast/lib/index.js").Options | undefined;
};
export type PluginOptions = Omit<RecmaDocumentOptions & RecmaStringifyOptions & RecmaJsxRewriteOptions, 'outputFormat'>;
export type ProcessorOptions = BaseProcessorOptions & PluginOptions;
