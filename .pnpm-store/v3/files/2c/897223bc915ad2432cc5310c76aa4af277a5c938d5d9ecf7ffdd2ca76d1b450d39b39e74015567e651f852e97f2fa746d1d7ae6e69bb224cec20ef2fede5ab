import { ESBuildTransformResult } from 'vite';
import { CompileProps, CompileResult } from '../core/compile/index.js';
import { LogOptions } from '../core/logger/core.js';
interface CachedFullCompilation {
    compileProps: CompileProps;
    rawId: string;
    logging: LogOptions;
}
interface FullCompileResult extends Omit<CompileResult, 'map'> {
    map: ESBuildTransformResult['map'];
}
export declare function cachedFullCompilation({ compileProps, rawId, logging, }: CachedFullCompilation): Promise<FullCompileResult>;
export {};
