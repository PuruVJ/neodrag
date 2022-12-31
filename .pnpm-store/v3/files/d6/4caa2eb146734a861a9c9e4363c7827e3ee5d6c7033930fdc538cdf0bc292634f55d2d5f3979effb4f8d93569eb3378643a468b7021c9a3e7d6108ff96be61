import { TransformOptions } from 'esbuild';

interface StartOfSourceMap {
    file?: string;
    sourceRoot?: string;
}

interface RawSourceMap extends StartOfSourceMap {
    version: string;
    sources: string[];
    names: string[];
    sourcesContent?: string[];
    mappings: string;
}

declare type Transformed = {
    code: string;
    map: RawSourceMap;
    warnings?: any[];
};

declare function installSourceMapSupport(): ({ code, map }: Transformed, filePath: string) => string;

declare function transformDynamicImport(filePath: string, code: string): {
    code: string;
    map: RawSourceMap;
} | undefined;

declare function transformSync(code: string, filePath: string, extendOptions?: TransformOptions): Transformed;
declare function transform(code: string, filePath: string, extendOptions?: TransformOptions): Promise<Transformed>;

declare function resolveTsPath(filePath: string): string | undefined;

declare type Version = [number, number, number];
declare const compareNodeVersion: (version: Version) => number;

export { compareNodeVersion, installSourceMapSupport, resolveTsPath, transform, transformDynamicImport, transformSync };
