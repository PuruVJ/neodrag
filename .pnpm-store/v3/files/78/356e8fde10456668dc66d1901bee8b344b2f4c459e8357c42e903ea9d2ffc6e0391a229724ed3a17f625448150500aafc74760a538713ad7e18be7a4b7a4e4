/**
 * Evaluate MDX.
 *
 * @param {VFileCompatible} vfileCompatible
 *   MDX document to parse (`string`, `Buffer`, `vfile`, anything that can be
 *   given to `vfile`).
 * @param {EvaluateOptions} evaluateOptions
 * @return {Promise<ExportMap>}
 */
export function evaluate(vfileCompatible: VFileCompatible, evaluateOptions: EvaluateOptions): Promise<ExportMap>;
/**
 * Synchronously evaluate MDX.
 *
 * @param {VFileCompatible} vfileCompatible
 *   MDX document to parse (`string`, `Buffer`, `vfile`, anything that can be
 *   given to `vfile`).
 * @param {EvaluateOptions} evaluateOptions
 * @return {ExportMap}
 */
export function evaluateSync(vfileCompatible: VFileCompatible, evaluateOptions: EvaluateOptions): ExportMap;
export type VFileCompatible = import('vfile').VFileCompatible;
export type EvaluateOptions = import('./util/resolve-evaluate-options.js').EvaluateOptions;
export type ExportMap = import('mdx/types').MDXModule;
