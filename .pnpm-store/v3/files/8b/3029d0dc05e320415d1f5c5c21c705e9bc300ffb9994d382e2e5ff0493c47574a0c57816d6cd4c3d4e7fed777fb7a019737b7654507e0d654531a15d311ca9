"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoverProviderImpl = void 0;
const documents_1 = require("../../../core/documents");
const previewer_1 = require("../previewer");
const utils_1 = require("../utils");
const partsMap = new Map([['JSX attribute', 'HTML attribute']]);
class HoverProviderImpl {
    constructor(languageServiceManager) {
        this.languageServiceManager = languageServiceManager;
        this.ts = languageServiceManager.docContext.ts;
    }
    async doHover(document, position) {
        const { lang, tsDoc } = await this.languageServiceManager.getLSAndTSDoc(document);
        const fragment = await tsDoc.createFragment();
        const offset = fragment.offsetAt(fragment.getGeneratedPosition(position));
        const html = document.html;
        const documentOffset = document.offsetAt(position);
        const node = html.findNodeAt(documentOffset);
        let info;
        if (node.tag === 'script') {
            const { snapshot: scriptTagSnapshot, filePath: scriptFilePath, offset: scriptOffset, } = (0, utils_1.getScriptTagSnapshot)(tsDoc, document, node, position);
            info = lang.getQuickInfoAtPosition(scriptFilePath, scriptOffset);
            if (info) {
                info.textSpan.start = fragment.offsetAt(scriptTagSnapshot.getOriginalPosition(scriptTagSnapshot.positionAt(info.textSpan.start)));
            }
        }
        else {
            info = lang.getQuickInfoAtPosition(tsDoc.filePath, offset);
        }
        if (!info) {
            return null;
        }
        const textSpan = info.textSpan;
        const displayParts = (info.displayParts || []).map((value) => ({
            text: partsMap.has(value.text) ? partsMap.get(value.text) : value.text,
            kind: value.kind,
        }));
        const declaration = this.ts.displayPartsToString(displayParts);
        const documentation = (0, previewer_1.getMarkdownDocumentation)(info.documentation, info.tags, this.ts);
        // https://microsoft.github.io/language-server-protocol/specification#textDocument_hover
        const contents = ['```typescript', declaration, '```']
            .concat(documentation ? ['---', documentation] : [])
            .join('\n');
        return (0, documents_1.mapObjWithRangeToOriginal)(fragment, {
            range: (0, utils_1.convertRange)(fragment, textSpan),
            contents,
        });
    }
}
exports.HoverProviderImpl = HoverProviderImpl;
