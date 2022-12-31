import type { Stylesheet, TextDocument } from 'vscode-css-languageservice';
import type { Position } from 'vscode-languageserver';
import { AstroDocument, DocumentMapper, ReadableDocument, TagInformation } from '../../core/documents';
export interface CSSDocumentBase extends DocumentMapper, TextDocument {
    languageId: string;
    stylesheet: Stylesheet;
}
export declare class CSSDocument extends ReadableDocument implements DocumentMapper {
    private parent;
    private styleInfo;
    readonly version: number;
    stylesheet: Stylesheet;
    languageId: string;
    constructor(parent: AstroDocument, styleInfo: Pick<TagInformation, 'attributes' | 'start' | 'end'>);
    /**
     * Get the fragment position relative to the parent
     * @param pos Position in fragment
     */
    getOriginalPosition(pos: Position): Position;
    /**
     * Get the position relative to the start of the fragment
     * @param pos Position in parent
     */
    getGeneratedPosition(pos: Position): Position;
    /**
     * Returns true if the given parent position is inside of this fragment
     * @param pos Position in parent
     */
    isInGenerated(pos: Position): boolean;
    /**
     * Get the fragment text from the parent
     */
    getText(): string;
    /**
     * Returns the length of the fragment as calculated from the start and end position
     */
    getTextLength(): number;
    /**
     * Return the parent file path
     */
    getFilePath(): string | null;
    getURL(): string;
    getAttributes(): Record<string, string>;
    private get language();
}
