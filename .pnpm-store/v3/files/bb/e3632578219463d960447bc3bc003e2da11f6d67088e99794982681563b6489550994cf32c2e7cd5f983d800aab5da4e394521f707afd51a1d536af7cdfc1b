import { SymbolInformation } from 'vscode-languageserver-types';
import { AstroDocument } from '../../../core/documents';
import type { DocumentSymbolsProvider } from '../../interfaces';
import type { LanguageServiceManager } from '../LanguageServiceManager';
export declare class DocumentSymbolsProviderImpl implements DocumentSymbolsProvider {
    private languageServiceManager;
    private ts;
    constructor(languageServiceManager: LanguageServiceManager);
    getDocumentSymbols(document: AstroDocument): Promise<SymbolInformation[]>;
    private collectSymbols;
}
