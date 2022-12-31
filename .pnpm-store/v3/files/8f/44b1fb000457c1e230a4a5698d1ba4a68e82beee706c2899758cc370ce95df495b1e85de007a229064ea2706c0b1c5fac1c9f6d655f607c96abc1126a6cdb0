import { Location } from 'vscode-languageserver';
import { AstroDocument } from '../../../core/documents';
import { FileReferencesProvider } from '../../interfaces';
import { LanguageServiceManager } from '../LanguageServiceManager';
export declare class FileReferencesProviderImpl implements FileReferencesProvider {
    private languageServiceManager;
    constructor(languageServiceManager: LanguageServiceManager);
    fileReferences(document: AstroDocument): Promise<Location[] | null>;
}
