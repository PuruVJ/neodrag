import type { SourceMapOptions } from "./index";
export interface RawSourceMap {
    version: number;
    file: string;
    sources: Array<string>;
    sourceRoot?: string;
    sourcesContent?: Array<string>;
    mappings: string;
    names: Array<string>;
}
/**
 * Generate a simple source map indicating that each line maps directly to the original line.
 */
export default function computeSourceMap(code: string, filePath: string, { compiledFilename }: SourceMapOptions): RawSourceMap;
