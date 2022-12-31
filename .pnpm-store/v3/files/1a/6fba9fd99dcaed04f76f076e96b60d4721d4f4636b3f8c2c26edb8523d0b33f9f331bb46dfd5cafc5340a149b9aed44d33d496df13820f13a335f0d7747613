"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindReferencesProviderImpl = void 0;
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const documents_1 = require("../../../core/documents");
const utils_1 = require("../../../utils");
const utils_2 = require("../utils");
const utils_3 = require("./utils");
class FindReferencesProviderImpl {
    constructor(languageServiceManager) {
        this.languageServiceManager = languageServiceManager;
    }
    async findReferences(document, position, context) {
        const { lang, tsDoc } = await this.languageServiceManager.getLSAndTSDoc(document);
        const mainFragment = await tsDoc.createFragment();
        const offset = mainFragment.offsetAt(mainFragment.getGeneratedPosition(position));
        const node = document.html.findNodeAt(offset);
        let references;
        if (node.tag === 'script') {
            const { snapshot: scriptTagSnapshot, filePath: scriptFilePath, offset: scriptOffset, } = (0, utils_2.getScriptTagSnapshot)(tsDoc, document, node, position);
            references = lang.getReferencesAtPosition(scriptFilePath, scriptOffset);
            if (references) {
                references = references.map((ref) => {
                    const isInSameFile = ref.fileName === scriptFilePath;
                    ref.fileName = isInSameFile ? tsDoc.filePath : ref.fileName;
                    if (isInSameFile) {
                        ref.textSpan.start = mainFragment.offsetAt(scriptTagSnapshot.getOriginalPosition(scriptTagSnapshot.positionAt(ref.textSpan.start)));
                    }
                    return ref;
                });
            }
        }
        else {
            references = lang.getReferencesAtPosition(tsDoc.filePath, offset);
        }
        if (!references) {
            return null;
        }
        const docs = new utils_3.SnapshotFragmentMap(this.languageServiceManager);
        docs.set(tsDoc.filePath, { fragment: mainFragment, snapshot: tsDoc });
        const result = await Promise.all(references.map(async (reference) => {
            if (!context.includeDeclaration) {
                return null;
            }
            const { fragment } = await docs.retrieve(reference.fileName);
            const range = (0, documents_1.mapRangeToOriginal)(fragment, (0, utils_2.convertRange)(fragment, reference.textSpan));
            if (range.start.line >= 0 && range.end.line >= 0) {
                return vscode_languageserver_types_1.Location.create((0, utils_1.pathToUrl)(reference.fileName), range);
            }
        }));
        return result.filter(utils_1.isNotNullOrUndefined);
    }
}
exports.FindReferencesProviderImpl = FindReferencesProviderImpl;
