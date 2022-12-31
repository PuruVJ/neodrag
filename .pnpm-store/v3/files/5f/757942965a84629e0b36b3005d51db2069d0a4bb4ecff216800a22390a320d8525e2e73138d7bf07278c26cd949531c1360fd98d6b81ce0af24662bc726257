import type { RenderTemplateResult } from './render-template';
declare const headAndContentSym: unique symbol;
export declare type HeadAndContent = {
    [headAndContentSym]: true;
    head: string | RenderTemplateResult;
    content: RenderTemplateResult;
};
export declare function isHeadAndContent(obj: unknown): obj is HeadAndContent;
export declare function createHeadAndContent(head: string | RenderTemplateResult, content: RenderTemplateResult): HeadAndContent;
export {};
