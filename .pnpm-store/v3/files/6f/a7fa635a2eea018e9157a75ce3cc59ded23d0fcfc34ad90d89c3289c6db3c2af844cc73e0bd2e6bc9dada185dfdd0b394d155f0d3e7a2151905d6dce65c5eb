import type { SourceMapConsumer } from 'source-map';
import { CodeAction, ColorPresentation, CompletionItem, Diagnostic, FoldingRange, Hover, InsertReplaceEdit, LocationLink, Position, Range, SelectionRange, SymbolInformation, TextDocumentEdit, TextEdit } from 'vscode-languageserver';
import { TagInformation } from './utils';
export interface DocumentMapper {
    /**
     * Map the generated position to the original position
     * @param generatedPosition Position in fragment
     */
    getOriginalPosition(generatedPosition: Position): Position;
    /**
     * Map the original position to the generated position
     * @param originalPosition Position in parent
     */
    getGeneratedPosition(originalPosition: Position): Position;
    /**
     * Returns true if the given original position is inside of the generated map
     * @param pos Position in original
     */
    isInGenerated(pos: Position): boolean;
    /**
     * Get document URL
     */
    getURL(): string;
    /**
     * Implement this if you need teardown logic before this mapper gets cleaned up.
     */
    destroy?(): void;
}
/**
 * Does not map, returns positions as is.
 */
export declare class IdentityMapper implements DocumentMapper {
    private url;
    private parent?;
    constructor(url: string, parent?: DocumentMapper | undefined);
    getOriginalPosition(generatedPosition: Position): Position;
    getGeneratedPosition(originalPosition: Position): Position;
    isInGenerated(position: Position): boolean;
    getURL(): string;
    destroy(): void;
}
/**
 * Maps positions in a fragment relative to a parent.
 */
export declare class FragmentMapper implements DocumentMapper {
    private originalText;
    private tagInfo;
    private url;
    private lineOffsetsOriginal;
    private lineOffsetsGenerated;
    constructor(originalText: string, tagInfo: TagInformation, url: string);
    getOriginalPosition(generatedPosition: Position): Position;
    private offsetInParent;
    getGeneratedPosition(originalPosition: Position): Position;
    isInGenerated(pos: Position): boolean;
    getURL(): string;
}
export declare class SourceMapDocumentMapper implements DocumentMapper {
    protected consumer: SourceMapConsumer;
    protected sourceUri: string;
    private parent?;
    constructor(consumer: SourceMapConsumer, sourceUri: string, parent?: DocumentMapper | undefined);
    getOriginalPosition(generatedPosition: Position): Position;
    getGeneratedPosition(originalPosition: Position): Position;
    isInGenerated(position: Position): boolean;
    getURL(): string;
    /**
     * Needs to be called when source mapper is no longer needed in order to prevent memory leaks.
     */
    destroy(): void;
}
export declare function mapRangeToOriginal(fragment: Pick<DocumentMapper, 'getOriginalPosition'>, range: Range): Range;
export declare function mapRangeToGenerated(fragment: DocumentMapper, range: Range): Range;
export declare function mapCompletionItemToOriginal(fragment: Pick<DocumentMapper, 'getOriginalPosition'>, item: CompletionItem): CompletionItem;
export declare function mapHoverToParent(fragment: Pick<DocumentMapper, 'getOriginalPosition'>, hover: Hover): Hover;
export declare function mapObjWithRangeToOriginal<T extends {
    range: Range;
}>(fragment: Pick<DocumentMapper, 'getOriginalPosition'>, objWithRange: T): T;
export declare function mapInsertReplaceEditToOriginal(fragment: Pick<DocumentMapper, 'getOriginalPosition'>, edit: InsertReplaceEdit): InsertReplaceEdit;
export declare function mapEditToOriginal(fragment: Pick<DocumentMapper, 'getOriginalPosition'>, edit: TextEdit | InsertReplaceEdit): TextEdit | InsertReplaceEdit;
export declare function mapDiagnosticToGenerated(fragment: DocumentMapper, diagnostic: Diagnostic): Diagnostic;
export declare function mapColorPresentationToOriginal(fragment: Pick<DocumentMapper, 'getOriginalPosition'>, presentation: ColorPresentation): ColorPresentation;
export declare function mapSymbolInformationToOriginal(fragment: Pick<DocumentMapper, 'getOriginalPosition'>, info: SymbolInformation): SymbolInformation;
export declare function mapLocationLinkToOriginal(fragment: DocumentMapper, def: LocationLink): LocationLink;
export declare function mapTextDocumentEditToOriginal(fragment: DocumentMapper, edit: TextDocumentEdit): TextDocumentEdit;
export declare function mapCodeActionToOriginal(fragment: DocumentMapper, codeAction: CodeAction): CodeAction;
export declare function mapFoldingRangeToParent(fragment: DocumentMapper, foldingRange: FoldingRange): FoldingRange;
export declare function mapSelectionRangeToParent(fragment: Pick<DocumentMapper, 'getOriginalPosition'>, selectionRange: SelectionRange): SelectionRange;
