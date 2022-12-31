import { Location, Position } from 'vscode-languageserver-protocol';
import { AstroDocument } from '../../../core/documents';
import type { TypeDefinitionsProvider } from '../../interfaces';
import type { LanguageServiceManager } from '../LanguageServiceManager';
export declare class TypeDefinitionsProviderImpl implements TypeDefinitionsProvider {
    private languageServiceManager;
    constructor(languageServiceManager: LanguageServiceManager);
    getTypeDefinitions(document: AstroDocument, position: Position): Promise<Location[]>;
}
