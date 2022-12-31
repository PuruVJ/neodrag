"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeDefinitionsProviderImpl = void 0;
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const documents_1 = require("../../../core/documents");
const utils_1 = require("../../../utils");
const utils_2 = require("../utils");
const utils_3 = require("./utils");
class TypeDefinitionsProviderImpl {
    constructor(languageServiceManager) {
        this.languageServiceManager = languageServiceManager;
    }
    async getTypeDefinitions(document, position) {
        const { lang, tsDoc } = await this.languageServiceManager.getLSAndTSDoc(document);
        const mainFragment = await tsDoc.createFragment();
        const fragmentOffset = mainFragment.offsetAt(mainFragment.getGeneratedPosition(position));
        const html = document.html;
        const offset = document.offsetAt(position);
        const node = html.findNodeAt(offset);
        let typeDefs;
        if (node.tag === 'script') {
            const { snapshot: scriptTagSnapshot, filePath: scriptFilePath, offset: scriptOffset, } = (0, utils_2.getScriptTagSnapshot)(tsDoc, document, node, position);
            typeDefs = lang.getTypeDefinitionAtPosition(scriptFilePath, scriptOffset);
            if (typeDefs) {
                typeDefs = typeDefs.map((def) => {
                    const isInSameFile = def.fileName === scriptFilePath;
                    def.fileName = isInSameFile ? tsDoc.filePath : def.fileName;
                    if (isInSameFile) {
                        def.textSpan.start = mainFragment.offsetAt(scriptTagSnapshot.getOriginalPosition(scriptTagSnapshot.positionAt(def.textSpan.start)));
                    }
                    return def;
                });
            }
        }
        else {
            typeDefs = lang.getTypeDefinitionAtPosition(tsDoc.filePath, fragmentOffset);
        }
        const docs = new utils_3.SnapshotFragmentMap(this.languageServiceManager);
        docs.set(tsDoc.filePath, { fragment: mainFragment, snapshot: tsDoc });
        if (!typeDefs) {
            return [];
        }
        const result = await Promise.all(typeDefs.map(async (typeDef) => {
            const { fragment } = await docs.retrieve(typeDef.fileName);
            const fileName = (0, utils_2.ensureRealFilePath)(typeDef.fileName);
            const range = (0, documents_1.mapRangeToOriginal)(fragment, (0, utils_2.convertRange)(fragment, typeDef.textSpan));
            if (range.start.line >= 0 && range.end.line >= 0) {
                return vscode_languageserver_protocol_1.Location.create((0, utils_1.pathToUrl)(fileName), range);
            }
        }));
        return result.filter(utils_1.isNotNullOrUndefined);
    }
}
exports.TypeDefinitionsProviderImpl = TypeDefinitionsProviderImpl;
