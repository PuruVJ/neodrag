import type { CancellationToken } from 'vscode-languageserver';
import { CodeAction, CodeActionContext, Range } from 'vscode-languageserver-types';
import type { ConfigManager } from '../../../core/config';
import { AstroDocument } from '../../../core/documents';
import type { CodeActionsProvider } from '../../interfaces';
import type { LanguageServiceManager } from '../LanguageServiceManager';
export declare const sortImportKind: string;
export declare class CodeActionsProviderImpl implements CodeActionsProvider {
    private languageServiceManager;
    private configManager;
    private ts;
    constructor(languageServiceManager: LanguageServiceManager, configManager: ConfigManager);
    getCodeActions(document: AstroDocument, range: Range, context: CodeActionContext, cancellationToken?: CancellationToken): Promise<CodeAction[]>;
    private getComponentQuickFix;
    private organizeSortImports;
    private fixIndentationOfImports;
}
