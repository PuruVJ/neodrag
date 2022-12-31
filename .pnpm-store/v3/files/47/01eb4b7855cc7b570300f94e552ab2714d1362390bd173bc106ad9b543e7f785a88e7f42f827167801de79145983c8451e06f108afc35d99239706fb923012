import { InlayHint } from 'vscode-languageserver';
import { Range } from 'vscode-languageserver-types';
import type { ConfigManager } from '../../../core/config';
import type { AstroDocument } from '../../../core/documents';
import type { InlayHintsProvider } from '../../interfaces';
import type { LanguageServiceManager } from '../LanguageServiceManager';
export declare class InlayHintsProviderImpl implements InlayHintsProvider {
    private languageServiceManager;
    private configManager;
    private ts;
    constructor(languageServiceManager: LanguageServiceManager, configManager: ConfigManager);
    getInlayHints(document: AstroDocument, range: Range): Promise<InlayHint[]>;
}
