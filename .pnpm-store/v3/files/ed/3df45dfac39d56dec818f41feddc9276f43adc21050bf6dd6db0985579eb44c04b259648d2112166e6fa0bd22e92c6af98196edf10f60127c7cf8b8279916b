"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileReferencesProviderImpl = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const utils_1 = require("../../../utils");
const utils_2 = require("../utils");
const utils_3 = require("./utils");
class FileReferencesProviderImpl {
    constructor(languageServiceManager) {
        this.languageServiceManager = languageServiceManager;
    }
    async fileReferences(document) {
        const { lang, tsDoc } = await this.languageServiceManager.getLSAndTSDoc(document);
        const mainFragment = await tsDoc.createFragment();
        const references = lang.getFileReferences(tsDoc.filePath);
        if (!references) {
            return null;
        }
        const docs = new utils_3.SnapshotFragmentMap(this.languageServiceManager);
        docs.set(tsDoc.filePath, { fragment: mainFragment, snapshot: tsDoc });
        const locations = await Promise.all(references.map(async (ref) => {
            const defDoc = await docs.retrieveFragment(ref.fileName);
            return vscode_languageserver_1.Location.create((0, utils_1.pathToUrl)(ref.fileName), (0, utils_2.convertToLocationRange)(defDoc, ref.textSpan));
        }));
        return locations;
    }
}
exports.FileReferencesProviderImpl = FileReferencesProviderImpl;
