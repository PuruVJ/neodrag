"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstroCheck = exports.DiagnosticSeverity = void 0;
const config_1 = require("./core/config");
const documents_1 = require("./core/documents");
const plugins_1 = require("./plugins");
const LanguageServiceManager_1 = require("./plugins/typescript/LanguageServiceManager");
const utils_1 = require("./utils");
var vscode_languageserver_types_1 = require("vscode-languageserver-types");
Object.defineProperty(exports, "DiagnosticSeverity", { enumerable: true, get: function () { return vscode_languageserver_types_1.DiagnosticSeverity; } });
class AstroCheck {
    constructor(workspacePath, typescriptPath, options) {
        this.docManager = documents_1.DocumentManager.newInstance();
        this.configManager = new config_1.ConfigManager();
        this.pluginHost = new plugins_1.PluginHost(this.docManager);
        try {
            const ts = require(typescriptPath);
            this.initialize(workspacePath, ts);
        }
        catch (e) {
            throw new Error(`Couldn't load TypeScript from path ${typescriptPath}`);
        }
        if (options) {
            this.configManager.updateGlobalConfig(options);
        }
    }
    upsertDocument(doc) {
        this.docManager.openDocument({
            text: doc.text,
            uri: doc.uri,
        });
        this.docManager.markAsOpenedInClient(doc.uri);
    }
    removeDocument(uri) {
        if (!this.docManager.get(uri)) {
            return;
        }
        this.docManager.closeDocument(uri);
        this.docManager.releaseDocument(uri);
    }
    async getDiagnostics() {
        return await Promise.all(this.docManager.getAllOpenedByClient().map(async (doc) => {
            const uri = doc[1].uri;
            return await this.getDiagnosticsForFile(uri);
        }));
    }
    initialize(workspacePath, ts) {
        const languageServiceManager = new LanguageServiceManager_1.LanguageServiceManager(this.docManager, [(0, utils_1.normalizeUri)(workspacePath)], this.configManager, ts);
        this.pluginHost.registerPlugin(new plugins_1.TypeScriptPlugin(this.configManager, languageServiceManager));
    }
    async getDiagnosticsForFile(uri) {
        const diagnostics = await this.pluginHost.getDiagnostics({ uri });
        return {
            fileUri: uri || '',
            text: this.docManager.get(uri)?.getText() || '',
            diagnostics,
        };
    }
}
exports.AstroCheck = AstroCheck;
