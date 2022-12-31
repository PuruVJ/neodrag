import type { DiagnosticCode } from '@astrojs/compiler/shared/diagnostics.js';
import { AstroErrorCodes } from './errors-data.js';
interface ErrorProperties {
    code: AstroErrorCodes | DiagnosticCode;
    title?: string;
    name?: string;
    message?: string;
    location?: ErrorLocation;
    hint?: string;
    stack?: string;
    frame?: string;
}
export interface ErrorLocation {
    file?: string;
    line?: number;
    column?: number;
}
declare type ErrorTypes = 'AstroError' | 'CompilerError' | 'CSSError' | 'MarkdownError' | 'InternalError' | 'AggregateError';
export declare class AstroError extends Error {
    errorCode: AstroErrorCodes | DiagnosticCode;
    loc: ErrorLocation | undefined;
    title: string | undefined;
    hint: string | undefined;
    frame: string | undefined;
    type: ErrorTypes;
    constructor(props: ErrorProperties, ...params: any);
    setErrorCode(errorCode: AstroErrorCodes): void;
    setLocation(location: ErrorLocation): void;
    setName(name: string): void;
    setMessage(message: string): void;
    setHint(hint: string): void;
    setFrame(source: string, location: ErrorLocation): void;
    static is(err: Error | unknown): err is AstroError;
}
export declare class CompilerError extends AstroError {
    type: ErrorTypes;
    constructor(props: Omit<ErrorProperties, 'code'> & {
        code: DiagnosticCode;
    }, ...params: any);
    static is(err: Error | unknown): err is CompilerError;
}
export declare class CSSError extends AstroError {
    type: ErrorTypes;
    static is(err: Error | unknown): err is CSSError;
}
export declare class MarkdownError extends AstroError {
    type: ErrorTypes;
    static is(err: Error | unknown): err is MarkdownError;
}
export declare class InternalError extends AstroError {
    type: ErrorTypes;
    static is(err: Error | unknown): err is InternalError;
}
export declare class AggregateError extends AstroError {
    type: ErrorTypes;
    errors: AstroError[];
    constructor(props: ErrorProperties & {
        errors: AstroError[];
    }, ...params: any);
    static is(err: Error | unknown): err is AggregateError;
}
/**
 * Generic object representing an error with all possible data
 * Compatible with both Astro's and Vite's errors
 */
export interface ErrorWithMetadata {
    [name: string]: any;
    name: string;
    title?: string;
    type?: ErrorTypes;
    message: string;
    stack: string;
    errorCode?: number;
    hint?: string;
    id?: string;
    frame?: string;
    plugin?: string;
    pluginCode?: string;
    fullCode?: string;
    loc?: {
        file?: string;
        line?: number;
        column?: number;
    };
    cause?: any;
}
export {};
