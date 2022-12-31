import { CancellationToken, CodeAction, CodeActionContext, CompletionContext, DefinitionLink, Diagnostic, FoldingRange, Hover, InlayHint, Location, Position, Range, ReferenceContext, SemanticTokens, SignatureHelp, SignatureHelpContext, SymbolInformation, TextDocumentContentChangeEvent, WorkspaceEdit } from 'vscode-languageserver';
import type { ConfigManager } from '../../core/config';
import type { AstroDocument } from '../../core/documents';
import type { AppCompletionItem, AppCompletionList, OnWatchFileChangesParam, Plugin } from '../interfaces';
import { Astro2TSXResult } from './astro2tsx';
import { CompletionItemData } from './features/CompletionsProvider';
import type { LanguageServiceManager } from './LanguageServiceManager';
export declare class TypeScriptPlugin implements Plugin {
    __name: string;
    private configManager;
    private readonly languageServiceManager;
    private readonly codeActionsProvider;
    private readonly completionProvider;
    private readonly hoverProvider;
    private readonly fileReferencesProvider;
    private readonly definitionsProvider;
    private readonly typeDefinitionsProvider;
    private readonly implementationsProvider;
    private readonly referencesProvider;
    private readonly signatureHelpProvider;
    private readonly diagnosticsProvider;
    private readonly documentSymbolsProvider;
    private readonly inlayHintsProvider;
    private readonly semanticTokensProvider;
    private readonly foldingRangesProvider;
    private readonly ts;
    constructor(configManager: ConfigManager, languageServiceManager: LanguageServiceManager);
    doHover(document: AstroDocument, position: Position): Promise<Hover | null>;
    rename(document: AstroDocument, position: Position, newName: string): Promise<WorkspaceEdit | null>;
    getFoldingRanges(document: AstroDocument): Promise<FoldingRange[] | null>;
    getSemanticTokens(document: AstroDocument, range?: Range, cancellationToken?: CancellationToken): Promise<SemanticTokens | null>;
    getDocumentSymbols(document: AstroDocument): Promise<SymbolInformation[]>;
    getCodeActions(document: AstroDocument, range: Range, context: CodeActionContext, cancellationToken?: CancellationToken): Promise<CodeAction[]>;
    getCompletions(document: AstroDocument, position: Position, completionContext?: CompletionContext, cancellationToken?: CancellationToken): Promise<AppCompletionList<CompletionItemData> | null>;
    resolveCompletion(document: AstroDocument, completionItem: AppCompletionItem<CompletionItemData>, cancellationToken?: CancellationToken): Promise<AppCompletionItem<CompletionItemData>>;
    getInlayHints(document: AstroDocument, range: Range): Promise<InlayHint[]>;
    fileReferences(document: AstroDocument): Promise<Location[] | null>;
    getDefinitions(document: AstroDocument, position: Position): Promise<DefinitionLink[]>;
    getTypeDefinitions(document: AstroDocument, position: Position): Promise<Location[] | null>;
    getImplementation(document: AstroDocument, position: Position): Promise<Location[] | null>;
    findReferences(document: AstroDocument, position: Position, context: ReferenceContext): Promise<Location[] | null>;
    getDiagnostics(document: AstroDocument, cancellationToken?: CancellationToken): Promise<Diagnostic[]>;
    onWatchFileChanges(onWatchFileChangesParas: OnWatchFileChangesParam[]): Promise<void>;
    updateNonAstroFile(fileName: string, changes: TextDocumentContentChangeEvent[], text?: string): Promise<void>;
    getSignatureHelp(document: AstroDocument, position: Position, context: SignatureHelpContext | undefined, cancellationToken?: CancellationToken): Promise<SignatureHelp | null>;
    getTSXForDocument(document: AstroDocument): Astro2TSXResult;
    /**
     * @internal Public for tests only
     */
    getSnapshotManager(fileName: string): Promise<import("./snapshots/SnapshotManager").SnapshotManager>;
    private featureEnabled;
}
