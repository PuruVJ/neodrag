import { Location, Position, ReferenceContext } from 'vscode-languageserver-types';
import { AstroDocument } from '../../../core/documents';
import type { FindReferencesProvider } from '../../interfaces';
import type { LanguageServiceManager } from '../LanguageServiceManager';
export declare class FindReferencesProviderImpl implements FindReferencesProvider {
    private languageServiceManager;
    constructor(languageServiceManager: LanguageServiceManager);
    findReferences(document: AstroDocument, position: Position, context: ReferenceContext): Promise<Location[] | null>;
}
