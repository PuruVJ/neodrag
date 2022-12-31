"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImplementationsProviderImpl = void 0;
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const documents_1 = require("../../../core/documents");
const utils_1 = require("../../../utils");
const utils_2 = require("../utils");
const utils_3 = require("./utils");
class ImplementationsProviderImpl {
    constructor(languageServiceManager) {
        this.languageServiceManager = languageServiceManager;
    }
    async getImplementation(document, position) {
        const { lang, tsDoc } = await this.languageServiceManager.getLSAndTSDoc(document);
        const mainFragment = await tsDoc.createFragment();
        const offset = mainFragment.offsetAt(mainFragment.getGeneratedPosition(position));
        const node = document.html.findNodeAt(offset);
        let implementations;
        if (node.tag === 'script') {
            const { snapshot: scriptTagSnapshot, filePath: scriptFilePath, offset: scriptOffset, } = (0, utils_2.getScriptTagSnapshot)(tsDoc, document, node, position);
            implementations = lang.getImplementationAtPosition(scriptFilePath, scriptOffset);
            if (implementations) {
                implementations = implementations.map((impl) => {
                    const isInSameFile = impl.fileName === scriptFilePath;
                    impl.fileName = isInSameFile ? tsDoc.filePath : impl.fileName;
                    if (isInSameFile) {
                        impl.textSpan.start = mainFragment.offsetAt(scriptTagSnapshot.getOriginalPosition(scriptTagSnapshot.positionAt(impl.textSpan.start)));
                    }
                    return impl;
                });
            }
        }
        else {
            implementations = lang.getImplementationAtPosition(tsDoc.filePath, offset);
        }
        const docs = new utils_3.SnapshotFragmentMap(this.languageServiceManager);
        docs.set(tsDoc.filePath, { fragment: mainFragment, snapshot: tsDoc });
        if (!implementations) {
            return null;
        }
        const result = await Promise.all(implementations.map(async (implementation) => {
            const { fragment } = await docs.retrieve(implementation.fileName);
            const range = (0, documents_1.mapRangeToOriginal)(fragment, (0, utils_2.convertRange)(fragment, implementation.textSpan));
            if (range.start.line >= 0 && range.end.line >= 0) {
                return vscode_languageserver_types_1.Location.create((0, utils_1.pathToUrl)(implementation.fileName), range);
            }
        }));
        return result.filter(utils_1.isNotNullOrUndefined);
    }
}
exports.ImplementationsProviderImpl = ImplementationsProviderImpl;
