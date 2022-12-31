/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import type { Stream } from "stream";
import type { Pattern } from "fast-glob";
export type optionDebug = 0 | 1 | 2;
export type optionBuffer = string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView> | Stream;
export interface executions {
    fulfilled?: boolean | ((pipe: optionCallbacksPipe) => Promise<false | string>);
    failed?: boolean | ((inputPath: optionCallbacksFile) => Promise<false | string>);
    accomplished?: boolean | ((current: optionCallbacksFile) => Promise<false | string>);
    changed?: (pipe: optionCallbacksPipe) => Promise<optionCallbacksPipe>;
    passed?: (current: optionCallbacksFile) => Promise<boolean>;
    read?: (current: optionCallbacksFile) => Promise<optionBuffer>;
    wrote?: (current: optionCallbacksFile) => Promise<optionBuffer>;
}
export type optionExclude = string | RegExp | ((file: string) => boolean);
export type optionPath = string | URL | Map<string | URL, string | URL> | false;
export interface Options {
    [key: string]: any;
    path?: optionPath | optionPath[] | Set<optionPath>;
    exclude?: optionExclude | optionExclude[] | Set<optionExclude>;
    files?: Pattern | Pattern[];
    type?: string;
    pipeline?: executions;
    logger?: optionDebug;
}
export interface optionCallbacksPipe {
    debug: optionDebug;
    files: number;
    current: optionCallbacksFile;
    info: any;
}
export interface optionCallbacksFile {
    inputPath: string;
    outputPath: string;
    fileSizeAfter: number;
    fileSizeBefore: number;
    buffer: optionBuffer;
}
declare const _default: {
    path: string;
    logger: 2;
    pipeline: {
        wrote: (current: optionCallbacksFile) => Promise<optionBuffer>;
        read: (current: optionCallbacksFile) => Promise<string>;
        passed: () => Promise<true>;
        failed: (current: optionCallbacksFile) => Promise<string>;
        accomplished: (current: optionCallbacksFile) => Promise<string>;
        fulfilled: (pipe: optionCallbacksPipe) => Promise<string | false>;
        changed: (pipe: optionCallbacksPipe) => Promise<optionCallbacksPipe>;
    };
};
export default _default;
