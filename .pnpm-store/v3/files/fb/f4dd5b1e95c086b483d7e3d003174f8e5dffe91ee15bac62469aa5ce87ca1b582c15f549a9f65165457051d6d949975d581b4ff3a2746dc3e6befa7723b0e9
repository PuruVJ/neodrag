import { HTMLDocument, Position } from 'vscode-html-languageservice';
import type { AstroDocument } from './AstroDocument';
import { AstroMetadata } from './parseAstro';
/**
 * Parses text as HTML
 */
export declare function parseHtml(text: string, frontmatter: AstroMetadata): HTMLDocument;
export interface AttributeContext {
    name: string;
    inValue: boolean;
    valueRange?: [number, number];
}
export declare function getAttributeContextAtPosition(document: AstroDocument, position: Position): AttributeContext | null;
