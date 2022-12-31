import { CancellationToken, Range, SemanticTokens } from 'vscode-languageserver';
import { AstroDocument } from '../../../core/documents';
import type { SemanticTokensProvider } from '../../interfaces';
import type { LanguageServiceManager } from '../LanguageServiceManager';
export declare class SemanticTokensProviderImpl implements SemanticTokensProvider {
    private languageServiceManager;
    private ts;
    constructor(languageServiceManager: LanguageServiceManager);
    getSemanticTokens(document: AstroDocument, range?: Range, cancellationToken?: CancellationToken): Promise<SemanticTokens | null>;
    private mapToOrigin;
    /**
     *  TSClassification = (TokenType + 1) << TokenEncodingConsts.typeOffset + TokenModifier
     */
    private getTokenTypeFromClassification;
    private getTokenModifierFromClassification;
}
