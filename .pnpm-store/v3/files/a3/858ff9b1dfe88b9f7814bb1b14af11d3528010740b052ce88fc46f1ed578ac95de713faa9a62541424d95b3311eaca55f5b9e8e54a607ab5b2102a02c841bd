"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureHelpProviderImpl = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const previewer_1 = require("../previewer");
const utils_1 = require("../utils");
class SignatureHelpProviderImpl {
    constructor(languageServiceManager) {
        this.languageServiceManager = languageServiceManager;
        this.ts = languageServiceManager.docContext.ts;
    }
    async getSignatureHelp(document, position, context, cancellationToken) {
        const { lang, tsDoc } = await this.languageServiceManager.getLSAndTSDoc(document);
        const fragment = await tsDoc.createFragment();
        if (cancellationToken?.isCancellationRequested) {
            return null;
        }
        const offset = fragment.offsetAt(fragment.getGeneratedPosition(position));
        const node = document.html.findNodeAt(offset);
        let info;
        const triggerReason = this.toTsTriggerReason(context);
        if (node.tag === 'script') {
            const { filePath: scriptFilePath, offset: scriptOffset } = (0, utils_1.getScriptTagSnapshot)(tsDoc, document, node, position);
            info = lang.getSignatureHelpItems(scriptFilePath, scriptOffset, triggerReason ? { triggerReason } : undefined);
        }
        else {
            info = lang.getSignatureHelpItems(tsDoc.filePath, offset, triggerReason ? { triggerReason } : undefined);
        }
        if (!info) {
            return null;
        }
        const signatures = info.items.map((item) => this.toSignatureHelpInformation(item, this.ts));
        return {
            signatures,
            activeSignature: info.selectedItemIndex,
            activeParameter: info.argumentIndex,
        };
    }
    isReTrigger(isRetrigger, triggerCharacter) {
        return (isRetrigger &&
            (this.isTriggerCharacter(triggerCharacter) ||
                SignatureHelpProviderImpl.retriggerCharacters.includes(triggerCharacter)));
    }
    isTriggerCharacter(triggerCharacter) {
        return SignatureHelpProviderImpl.triggerCharacters.includes(triggerCharacter);
    }
    /**
     * adopted from https://github.com/microsoft/vscode/blob/265a2f6424dfbd3a9788652c7d376a7991d049a3/extensions/typescript-language-features/src/languageFeatures/signatureHelp.ts#L103
     */
    toTsTriggerReason(context) {
        switch (context?.triggerKind) {
            case vscode_languageserver_1.SignatureHelpTriggerKind.TriggerCharacter:
                if (context.triggerCharacter) {
                    if (this.isReTrigger(context.isRetrigger, context.triggerCharacter)) {
                        return { kind: 'retrigger', triggerCharacter: context.triggerCharacter };
                    }
                    if (this.isTriggerCharacter(context.triggerCharacter)) {
                        return {
                            kind: 'characterTyped',
                            triggerCharacter: context.triggerCharacter,
                        };
                    }
                }
                return { kind: 'invoked' };
            case vscode_languageserver_1.SignatureHelpTriggerKind.ContentChange:
                return context.isRetrigger ? { kind: 'retrigger' } : { kind: 'invoked' };
            case vscode_languageserver_1.SignatureHelpTriggerKind.Invoked:
            default:
                return { kind: 'invoked' };
        }
    }
    /**
     * adopted from https://github.com/microsoft/vscode/blob/265a2f6424dfbd3a9788652c7d376a7991d049a3/extensions/typescript-language-features/src/languageFeatures/signatureHelp.ts#L73
     */
    toSignatureHelpInformation(item, ts) {
        const [prefixLabel, separatorLabel, suffixLabel] = [
            item.prefixDisplayParts,
            item.separatorDisplayParts,
            item.suffixDisplayParts,
        ].map(this.ts.displayPartsToString);
        let textIndex = prefixLabel.length;
        let signatureLabel = '';
        const parameters = [];
        const lastIndex = item.parameters.length - 1;
        item.parameters.forEach((parameter, index) => {
            const label = ts.displayPartsToString(parameter.displayParts);
            const startIndex = textIndex;
            const endIndex = textIndex + label.length;
            const doc = ts.displayPartsToString(parameter.documentation);
            signatureLabel += label;
            parameters.push(vscode_languageserver_1.ParameterInformation.create([startIndex, endIndex], doc));
            if (index < lastIndex) {
                textIndex = endIndex + separatorLabel.length;
                signatureLabel += separatorLabel;
            }
        });
        const signatureDocumentation = (0, previewer_1.getMarkdownDocumentation)(item.documentation, item.tags.filter((tag) => tag.name !== 'param'), ts);
        return {
            label: prefixLabel + signatureLabel + suffixLabel,
            documentation: signatureDocumentation
                ? {
                    value: signatureDocumentation,
                    kind: vscode_languageserver_1.MarkupKind.Markdown,
                }
                : undefined,
            parameters,
        };
    }
}
exports.SignatureHelpProviderImpl = SignatureHelpProviderImpl;
SignatureHelpProviderImpl.triggerCharacters = ['(', ',', '<'];
SignatureHelpProviderImpl.retriggerCharacters = [')'];
