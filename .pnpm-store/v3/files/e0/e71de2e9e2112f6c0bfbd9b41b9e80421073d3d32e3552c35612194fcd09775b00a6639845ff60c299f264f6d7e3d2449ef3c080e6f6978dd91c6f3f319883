import { LocationLink, Position } from 'vscode-languageserver-types';
import type { AstroDocument } from '../../../core/documents';
import type { DefinitionsProvider } from '../../interfaces';
import type { LanguageServiceManager } from '../LanguageServiceManager';
export declare class DefinitionsProviderImpl implements DefinitionsProvider {
    private languageServiceManager;
    constructor(languageServiceManager: LanguageServiceManager);
    getDefinitions(document: AstroDocument, position: Position): Promise<LocationLink[]>;
}
