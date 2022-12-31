import { Color, ColorInformation, ColorPresentation, CompletionContext, CompletionList, FoldingRange, Hover, Position, Range, SymbolInformation } from 'vscode-languageserver';
import type { ConfigManager } from '../../core/config/ConfigManager';
import { AstroDocument } from '../../core/documents';
import type { Plugin } from '../interfaces';
export declare class CSSPlugin implements Plugin {
    __name: string;
    private configManager;
    private cssDocuments;
    private triggerCharacters;
    constructor(configManager: ConfigManager);
    doHover(document: AstroDocument, position: Position): Promise<Hover | null>;
    private doHoverInternal;
    getCompletions(document: AstroDocument, position: Position, completionContext?: CompletionContext): Promise<CompletionList | null>;
    private getCompletionsInternal;
    getDocumentColors(document: AstroDocument): Promise<ColorInformation[]>;
    getColorPresentations(document: AstroDocument, range: Range, color: Color): Promise<ColorPresentation[]>;
    getFoldingRanges(document: AstroDocument): FoldingRange[] | null;
    getDocumentSymbols(document: AstroDocument): Promise<SymbolInformation[]>;
    private inStyleAttributeWithoutInterpolation;
    /**
     * Get the associated CSS Document for a style tag
     */
    private getCSSDocumentForStyleTag;
    /**
     * Get all the CSSDocuments in a document
     */
    private getCSSDocumentsForDocument;
    /**
     * Get all the stylesheets (Stylesheet type) in a document
     */
    private getStylesheetsForDocument;
    /**
     * Get style tag at position for a document
     */
    private getStyleTagForPosition;
    private featureEnabled;
}
