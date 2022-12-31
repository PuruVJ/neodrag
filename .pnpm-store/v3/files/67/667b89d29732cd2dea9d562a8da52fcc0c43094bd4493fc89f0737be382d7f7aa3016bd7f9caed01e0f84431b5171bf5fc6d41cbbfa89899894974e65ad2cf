import { CancellationToken, CodeAction, CodeActionContext, Color, ColorInformation, ColorPresentation, CompletionContext, CompletionItem, CompletionList, DefinitionLink, Diagnostic, FoldingRange, FormattingOptions, Hover, InlayHint, LinkedEditingRanges, Location, Position, Range, ReferenceContext, SemanticTokens, SignatureHelp, SignatureHelpContext, SymbolInformation, TextDocumentContentChangeEvent, TextDocumentIdentifier, TextEdit, WorkspaceEdit } from 'vscode-languageserver';
import type { DocumentManager } from '../core/documents/DocumentManager';
import type { AppCompletionItem, Plugin } from './interfaces';
export interface PluginHostConfig {
    filterIncompleteCompletions: boolean;
    definitionLinkSupport: boolean;
}
export declare class PluginHost {
    private docManager;
    private plugins;
    private pluginHostConfig;
    constructor(docManager: DocumentManager);
    initialize(pluginHostConfig: PluginHostConfig): void;
    registerPlugin(plugin: Plugin): void;
    getCompletions(textDocument: TextDocumentIdentifier, position: Position, completionContext?: CompletionContext, cancellationToken?: CancellationToken): Promise<CompletionList>;
    resolveCompletion(textDocument: TextDocumentIdentifier, completionItem: AppCompletionItem): Promise<CompletionItem>;
    getDiagnostics(textDocument: TextDocumentIdentifier): Promise<Diagnostic[]>;
    doHover(textDocument: TextDocumentIdentifier, position: Position): Promise<Hover | null>;
    formatDocument(textDocument: TextDocumentIdentifier, options: FormattingOptions): Promise<TextEdit[]>;
    getCodeActions(textDocument: TextDocumentIdentifier, range: Range, context: CodeActionContext, cancellationToken?: CancellationToken): Promise<CodeAction[]>;
    doTagComplete(textDocument: TextDocumentIdentifier, position: Position): Promise<string | null>;
    getFoldingRanges(textDocument: TextDocumentIdentifier): Promise<FoldingRange[] | null>;
    getDocumentSymbols(textDocument: TextDocumentIdentifier, cancellationToken?: CancellationToken): Promise<SymbolInformation[]>;
    getSemanticTokens(textDocument: TextDocumentIdentifier, range?: Range, cancellationToken?: CancellationToken): Promise<SemanticTokens | null>;
    getLinkedEditingRanges(textDocument: TextDocumentIdentifier, position: Position): Promise<LinkedEditingRanges | null>;
    fileReferences(textDocument: TextDocumentIdentifier): Promise<Location[] | null>;
    getDefinitions(textDocument: TextDocumentIdentifier, position: Position): Promise<DefinitionLink[] | Location[]>;
    getTypeDefinitions(textDocument: TextDocumentIdentifier, position: Position): Promise<Location[] | null>;
    getImplementations(textDocument: TextDocumentIdentifier, position: Position): Promise<Location[] | null>;
    getReferences(textdocument: TextDocumentIdentifier, position: Position, context: ReferenceContext): Promise<Location[] | null>;
    rename(textDocument: TextDocumentIdentifier, position: Position, newName: string): Promise<WorkspaceEdit | null>;
    getDocumentColors(textDocument: TextDocumentIdentifier): Promise<ColorInformation[]>;
    getColorPresentations(textDocument: TextDocumentIdentifier, range: Range, color: Color): Promise<ColorPresentation[]>;
    getInlayHints(textDocument: TextDocumentIdentifier, range: Range, cancellationToken?: CancellationToken): Promise<InlayHint[]>;
    getSignatureHelp(textDocument: TextDocumentIdentifier, position: Position, context: SignatureHelpContext | undefined, cancellationToken?: CancellationToken): Promise<SignatureHelp | null>;
    onWatchFileChanges(onWatchFileChangesParams: any[]): Promise<void>;
    updateNonAstroFile(fileName: string, changes: TextDocumentContentChangeEvent[], text?: string): void;
    private getDocument;
    private execute;
    private tryExecutePlugin;
}
