/**
 * Create smart processors to handle different formats.
 *
 * @param {CompileOptions} [compileOptions]
 * @return {{extnames: Array<string>, process: process, processSync: processSync}}
 */
export function createFormatAwareProcessors(compileOptions?: import("../compile.js").CompileOptions | undefined): {
    extnames: Array<string>;
    process: (vfileCompatible: VFileCompatible) => Promise<VFile>;
    processSync: (vfileCompatible: VFileCompatible) => VFile;
};
export type VFileCompatible = import('vfile').VFileCompatible;
export type VFile = import('vfile').VFile;
export type Processor = import('unified').Processor;
export type CompileOptions = import('../compile.js').CompileOptions;
