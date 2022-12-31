import type { Stylesheet } from 'vscode-css-languageservice';
import { CompletionItem, CompletionList } from 'vscode-languageserver';
import type { AttributeContext } from '../../../core/documents/parseHtml';
export declare function getIdClassCompletion(stylesheets: Stylesheet[], attributeContext: AttributeContext): CompletionList | null;
/**
 * incomplete see
 * https://github.com/microsoft/vscode-css-languageservice/blob/master/src/parser/cssNodes.ts#L14
 * The enum is not exported. we have to update this whenever it changes
 */
export declare enum NodeType {
    ClassSelector = 14,
    IdentifierSelector = 15
}
export declare type CSSNode = {
    type: number;
    children: CSSNode[] | undefined;
    getText(): string;
};
export declare function collectSelectors(stylesheets: CSSNode[], type: number): CompletionItem[];
