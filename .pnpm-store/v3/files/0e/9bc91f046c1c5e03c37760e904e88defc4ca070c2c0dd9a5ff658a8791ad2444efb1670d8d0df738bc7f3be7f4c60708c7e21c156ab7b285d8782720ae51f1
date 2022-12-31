import { CompletionContext, FoldingRange, FormattingOptions, Position, TextEdit } from 'vscode-languageserver';
import type { ConfigManager } from '../../core/config';
import type { AstroDocument } from '../../core/documents';
import type { AppCompletionList, Plugin } from '../interfaces';
import type { LanguageServiceManager } from '../typescript/LanguageServiceManager';
export declare class AstroPlugin implements Plugin {
    __name: string;
    private configManager;
    private readonly languageServiceManager;
    private readonly ts;
    private readonly completionProvider;
    constructor(configManager: ConfigManager, languageServiceManager: LanguageServiceManager);
    getCompletions(document: AstroDocument, position: Position, completionContext?: CompletionContext): Promise<AppCompletionList | null>;
    formatDocument(document: AstroDocument, options: FormattingOptions): Promise<TextEdit[]>;
    getFoldingRanges(document: AstroDocument): FoldingRange[];
}
