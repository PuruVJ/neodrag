import type { RenderInstruction } from '../types';
import { HTMLBytes } from '../../escape.js';
declare const renderTemplateResultSym: unique symbol;
export declare class RenderTemplateResult {
    [renderTemplateResultSym]: boolean;
    private htmlParts;
    private expressions;
    private error;
    constructor(htmlParts: TemplateStringsArray, expressions: unknown[]);
    get [Symbol.toStringTag](): string;
    [Symbol.asyncIterator](): AsyncGenerator<any, void, undefined>;
}
export declare function isRenderTemplateResult(obj: unknown): obj is RenderTemplateResult;
export declare function renderAstroTemplateResult(component: RenderTemplateResult): AsyncIterable<string | HTMLBytes | RenderInstruction>;
export declare function renderTemplate(htmlParts: TemplateStringsArray, ...expressions: any[]): RenderTemplateResult;
export {};
