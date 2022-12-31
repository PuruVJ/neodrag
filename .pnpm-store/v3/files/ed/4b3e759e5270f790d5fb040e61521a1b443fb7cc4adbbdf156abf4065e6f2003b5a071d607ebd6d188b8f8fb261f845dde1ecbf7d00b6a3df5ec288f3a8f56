import { CancellationToken, Position, SignatureHelp, SignatureHelpContext } from 'vscode-languageserver';
import type { AstroDocument } from '../../../core/documents';
import type { SignatureHelpProvider } from '../../interfaces';
import type { LanguageServiceManager } from '../LanguageServiceManager';
export declare class SignatureHelpProviderImpl implements SignatureHelpProvider {
    private languageServiceManager;
    private ts;
    constructor(languageServiceManager: LanguageServiceManager);
    private static readonly triggerCharacters;
    private static readonly retriggerCharacters;
    getSignatureHelp(document: AstroDocument, position: Position, context: SignatureHelpContext | undefined, cancellationToken?: CancellationToken): Promise<SignatureHelp | null>;
    private isReTrigger;
    private isTriggerCharacter;
    /**
     * adopted from https://github.com/microsoft/vscode/blob/265a2f6424dfbd3a9788652c7d376a7991d049a3/extensions/typescript-language-features/src/languageFeatures/signatureHelp.ts#L103
     */
    private toTsTriggerReason;
    /**
     * adopted from https://github.com/microsoft/vscode/blob/265a2f6424dfbd3a9788652c7d376a7991d049a3/extensions/typescript-language-features/src/languageFeatures/signatureHelp.ts#L73
     */
    private toSignatureHelpInformation;
}
