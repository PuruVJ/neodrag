import type { Position, Range } from 'vscode-languageserver';
/** Normalizes a document URI */
export declare function normalizeUri(uri: string): string;
/**
 * Some paths (on windows) start with a upper case driver letter, some don't.
 * This is normalized here.
 */
export declare function normalizePath(path: string): string;
/** Turns a URL into a normalized FS Path */
export declare function urlToPath(stringUrl: string): string | null;
/** Converts a path to a URL */
export declare function pathToUrl(path: string): string;
/**
 * Given a path like foo/bar or foo/bar.astro , returns its last path
 * (bar or bar.astro in this example).
 */
export declare function getLastPartOfPath(path: string): string;
/**
 * Return an element in an object using a path as a string (ex: `astro.typescript.format` will return astro['typescript']['format']).
 * From: https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_get
 */
export declare function get<T>(obj: Record<string, any>, path: string): T | undefined;
/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 * From: https://stackoverflow.com/a/48218209
 */
export declare function mergeDeep(...objects: Record<string, any>[]): Record<string, any>;
/**
 * Transform a string into PascalCase
 */
export declare function toPascalCase(string: string): string;
/**
 * Function to modify each line of a text, preserving the line break style (`\n` or `\r\n`)
 */
export declare function modifyLines(text: string, replacementFn: (line: string, lineIdx: number) => string): string;
/** Clamps a number between min and max */
export declare function clamp(num: number, min: number, max: number): number;
export declare function isNotNullOrUndefined<T>(val: T | undefined | null): val is T;
export declare function isInRange(range: Range, positionToTest: Position): boolean;
export declare function isBeforeOrEqualToPosition(position: Position, positionToTest: Position): boolean;
/**
 * Like str.lastIndexOf, but for regular expressions. Note that you need to provide the g-flag to your RegExp!
 */
export declare function regexLastIndexOf(text: string, regex: RegExp, endPos?: number): number;
/**
 * Get all matches of a regexp.
 */
export declare function getRegExpMatches(regex: RegExp, str: string): RegExpExecArray[];
/**
 * Debounces a function but cancels previous invocation only if
 * a second function determines it should.
 *
 * @param fn The function with it's argument
 * @param determineIfSame The function which determines if the previous invocation should be canceld or not
 * @param milliseconds Number of miliseconds to debounce
 */
export declare function debounceSameArg<T>(fn: (arg: T) => void, shouldCancelPrevious: (newArg: T, prevArg?: T) => boolean, milliseconds: number): (arg: T) => void;
/**
 * Debounces a function but also waits at minimum the specified number of milliseconds until
 * the next invocation. This avoids needless calls when a synchronous call (like diagnostics)
 * took too long and the whole timeout of the next call was eaten up already.
 *
 * @param fn The function with it's argument
 * @param milliseconds Number of milliseconds to debounce/throttle
 */
export declare function debounceThrottle<T extends (...args: any) => void>(fn: T, milliseconds: number): T;
/**
 * Try to determine if a workspace could be an Astro project based on the content of `package.json`
 */
export declare function isAstroWorkspace(workspacePath: string): boolean;
export interface AstroInstall {
    path: string;
    version: {
        full: string;
        major: number;
        minor: number;
        patch: number;
    };
}
export declare function getAstroInstall(basePaths: string[]): AstroInstall | undefined;
