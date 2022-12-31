/**
 * @typedef {import('../core.js').ProcessorOptions} ProcessorOptions
 *
 * @typedef RunnerOptions
 * @property {*} Fragment
 *   Symbol to use for fragments.
 * @property {*} [jsx]
 *   Function to generate an element with static children in production mode.
 * @property {*} [jsxs]
 *   Function to generate an element with dynamic children in production mode.
 * @property {*} [jsxDEV]
 *   Function to generate an element in development mode.
 * @property {*} [useMDXComponents]
 *   Function to get `MDXComponents` from context.
 *
 * @typedef {Omit<ProcessorOptions, 'jsx' | 'jsxImportSource' | 'jsxRuntime' | 'pragma' | 'pragmaFrag' | 'pragmaImportSource' | 'providerImportSource' | 'outputFormat'> } EvaluateProcessorOptions
 *
 * @typedef {EvaluateProcessorOptions & RunnerOptions} EvaluateOptions
 */
/**
 * Split compiletime options from runtime options.
 *
 * @param {EvaluateOptions} options
 * @returns {{compiletime: ProcessorOptions, runtime: RunnerOptions}}
 */
export function resolveEvaluateOptions(options: EvaluateOptions): {
    compiletime: ProcessorOptions;
    runtime: RunnerOptions;
};
export type ProcessorOptions = import('../core.js').ProcessorOptions;
export type RunnerOptions = {
    /**
     *  Symbol to use for fragments.
     */
    Fragment: any;
    /**
     * Function to generate an element with static children in production mode.
     */
    jsx?: any;
    /**
     * Function to generate an element with dynamic children in production mode.
     */
    jsxs?: any;
    /**
     * Function to generate an element in development mode.
     */
    jsxDEV?: any;
    /**
     * Function to get `MDXComponents` from context.
     */
    useMDXComponents?: any;
};
export type EvaluateProcessorOptions = Omit<ProcessorOptions, 'jsx' | 'jsxImportSource' | 'jsxRuntime' | 'pragma' | 'pragmaFrag' | 'pragmaImportSource' | 'providerImportSource' | 'outputFormat'>;
export type EvaluateOptions = EvaluateProcessorOptions & RunnerOptions;
