import type * as ts from 'typescript/lib/tsserverlibrary';
import type { VueCompilerOptions, ResolvedVueCompilerOptions } from '../types';
export type ParsedCommandLine = ts.ParsedCommandLine & {
    vueOptions: VueCompilerOptions;
};
export declare function createParsedCommandLineByJson(ts: typeof import('typescript/lib/tsserverlibrary'), parseConfigHost: ts.ParseConfigHost, rootDir: string, json: any, extraFileExtensions: ts.FileExtensionInfo[]): ParsedCommandLine;
export declare function createParsedCommandLine(ts: typeof import('typescript/lib/tsserverlibrary'), parseConfigHost: ts.ParseConfigHost, tsConfigPath: string, extraFileExtensions: ts.FileExtensionInfo[], extendsSet?: Set<string>): ParsedCommandLine;
export declare function resolveVueCompilerOptions(vueOptions: VueCompilerOptions): ResolvedVueCompilerOptions;
