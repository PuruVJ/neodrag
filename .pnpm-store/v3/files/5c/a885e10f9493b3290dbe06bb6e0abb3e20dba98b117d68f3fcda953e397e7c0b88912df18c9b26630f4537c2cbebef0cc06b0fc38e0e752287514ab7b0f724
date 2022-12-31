/**
 * Compile MDX to JS.
 *
 * @param {VFileCompatible} vfileCompatible
 *   MDX document to parse (`string`, `Buffer`, `vfile`, anything that can be
 *   given to `vfile`).
 * @param {CompileOptions} [compileOptions]
 * @return {Promise<VFile>}
 */
export function compile(vfileCompatible: VFileCompatible, compileOptions?: CompileOptions | undefined): Promise<VFile>;
/**
 * Synchronously compile MDX to JS.
 *
 * @param {VFileCompatible} vfileCompatible
 *   MDX document to parse (`string`, `Buffer`, `vfile`, anything that can be
 *   given to `vfile`).
 * @param {CompileOptions} [compileOptions]
 * @return {VFile}
 */
export function compileSync(vfileCompatible: VFileCompatible, compileOptions?: CompileOptions | undefined): VFile;
export type VFileCompatible = import('vfile').VFileCompatible;
export type VFile = import('vfile').VFile;
export type PluginOptions = import('./core.js').PluginOptions;
export type BaseProcessorOptions = import('./core.js').BaseProcessorOptions;
export type CoreProcessorOptions = Omit<BaseProcessorOptions, 'format'>;
export type ExtraOptions = {
    /**
     * Format of `file`
     */
    format?: "mdx" | "md" | "detect" | undefined;
};
export type CompileOptions = CoreProcessorOptions & PluginOptions & ExtraOptions;
