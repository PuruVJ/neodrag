"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageServiceManager = void 0;
const utils_1 = require("../../utils");
const language_service_1 = require("./language-service");
const SnapshotManager_1 = require("./snapshots/SnapshotManager");
class LanguageServiceManager {
    constructor(docManager, workspaceUris, configManager, ts, tsLocalized) {
        this.docManager = docManager;
        this.workspaceUris = workspaceUris;
        this.configManager = configManager;
        /**
         * Create an AstroDocument (only for astro files)
         */
        this.createDocument = (fileName, content) => {
            const uri = (0, utils_1.pathToUrl)(fileName);
            const document = this.docManager.openDocument({
                text: content,
                uri,
            });
            this.docManager.lockDocument(uri);
            return document;
        };
        this.globalSnapshotManager = new SnapshotManager_1.GlobalSnapshotManager(ts);
        this.docContext = {
            createDocument: this.createDocument,
            globalSnapshotManager: this.globalSnapshotManager,
            configManager: this.configManager,
            ts,
            tsLocalized: tsLocalized,
        };
        const handleDocumentChange = (document) => {
            this.getSnapshot(document);
        };
        docManager.on('documentChange', (0, utils_1.debounceSameArg)(handleDocumentChange, (newDoc, prevDoc) => newDoc.uri === prevDoc?.uri, 1000));
        docManager.on('documentOpen', handleDocumentChange);
    }
    async getSnapshot(pathOrDoc) {
        const filePath = typeof pathOrDoc === 'string' ? pathOrDoc : pathOrDoc.getFilePath() || '';
        const tsService = await this.getTypeScriptLanguageService(filePath);
        return tsService.updateSnapshot(pathOrDoc, this.docContext.ts);
    }
    /**
     * Updates snapshot path in all existing ts services and retrieves snapshot
     */
    async updateSnapshotPath(oldPath, newPath) {
        await this.deleteSnapshot(oldPath);
        return this.getSnapshot(newPath);
    }
    /**
     * Deletes snapshot in all existing ts services
     */
    async deleteSnapshot(filePath) {
        await (0, language_service_1.forAllLanguageServices)((service) => service.deleteSnapshot(filePath));
        this.docManager.releaseDocument((0, utils_1.pathToUrl)(filePath));
    }
    /**
     * Updates project files in all existing ts services
     */
    async updateProjectFiles() {
        await (0, language_service_1.forAllLanguageServices)((service) => service.updateProjectFiles());
    }
    /**
     * Updates file in all ts services where it exists
     */
    async updateExistingNonAstroFile(path, changes, text) {
        path = (0, utils_1.normalizePath)(path);
        // Only update once because all snapshots are shared between
        // services. Since we don't have a current version of TS/JS
        // files, the operation wouldn't be idempotent.
        let didUpdate = false;
        await (0, language_service_1.forAllLanguageServices)((service) => {
            if (service.hasFile(path) && !didUpdate) {
                didUpdate = true;
                service.updateNonAstroFile(path, changes, text);
            }
        });
    }
    async getLSAndTSDoc(document) {
        const lang = await this.getLSForPath(document.getFilePath() || '');
        const tsDoc = await this.getSnapshot(document);
        return { tsDoc, lang };
    }
    async getLSForPath(path) {
        return (await this.getTypeScriptLanguageService(path)).getService();
    }
    async getTypeScriptLanguageService(filePath) {
        return (0, language_service_1.getLanguageService)(filePath, this.workspaceUris, this.docContext);
    }
    /**
     * @internal Public for tests only
     */
    async getSnapshotManager(filePath) {
        return (await this.getTypeScriptLanguageService(filePath)).snapshotManager;
    }
}
exports.LanguageServiceManager = LanguageServiceManager;
