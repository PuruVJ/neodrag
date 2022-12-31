/**
 * Compile MDX w/ rollup.
 *
 * @param {Options} [options]
 * @return {Plugin}
 */
export function rollup(options?: Options | undefined): Plugin;
export type FilterPattern = import('@rollup/pluginutils').FilterPattern;
export type CompileOptions = Omit<import('@mdx-js/mdx').CompileOptions, 'SourceMapGenerator'>;
export type Plugin = import('rollup').Plugin;
export type RollupPluginOptions = {
    /**
     * List of picomatch patterns to include
     */
    include?: import("@rollup/pluginutils").FilterPattern | undefined;
    /**
     * List of picomatch patterns to exclude
     */
    exclude?: import("@rollup/pluginutils").FilterPattern | undefined;
};
export type Options = CompileOptions & RollupPluginOptions;
