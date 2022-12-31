import { Location, Position } from 'vscode-languageserver-types';
import { AstroDocument } from '../../../core/documents';
import { ImplementationProvider } from '../../interfaces';
import { LanguageServiceManager } from '../LanguageServiceManager';
export declare class ImplementationsProviderImpl implements ImplementationProvider {
    private languageServiceManager;
    constructor(languageServiceManager: LanguageServiceManager);
    getImplementation(document: AstroDocument, position: Position): Promise<Location[] | null>;
}
