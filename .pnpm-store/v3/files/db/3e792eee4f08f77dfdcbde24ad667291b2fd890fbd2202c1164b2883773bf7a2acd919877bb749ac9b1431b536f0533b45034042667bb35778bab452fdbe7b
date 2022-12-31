import type { Hover, Position } from 'vscode-languageserver';
import { AstroDocument } from '../../../core/documents';
import type { HoverProvider } from '../../interfaces';
import type { LanguageServiceManager } from '../LanguageServiceManager';
export declare class HoverProviderImpl implements HoverProvider {
    private languageServiceManager;
    private ts;
    constructor(languageServiceManager: LanguageServiceManager);
    doHover(document: AstroDocument, position: Position): Promise<Hover | null>;
}
