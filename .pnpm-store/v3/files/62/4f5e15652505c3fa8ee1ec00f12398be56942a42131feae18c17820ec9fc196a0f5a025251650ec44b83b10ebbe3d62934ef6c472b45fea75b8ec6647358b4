"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startLanguageServer = void 0;
const vscode = __importStar(require("vscode-languageserver"));
const vscode_languageserver_1 = require("vscode-languageserver");
const ConfigManager_1 = require("./core/config/ConfigManager");
const DiagnosticsManager_1 = require("./core/DiagnosticsManager");
const DocumentManager_1 = require("./core/documents/DocumentManager");
const plugins_1 = require("./plugins");
const AstroPlugin_1 = require("./plugins/astro/AstroPlugin");
const CSSPlugin_1 = require("./plugins/css/CSSPlugin");
const HTMLPlugin_1 = require("./plugins/html/HTMLPlugin");
const PluginHost_1 = require("./plugins/PluginHost");
const CodeActionsProvider_1 = require("./plugins/typescript/features/CodeActionsProvider");
const LanguageServiceManager_1 = require("./plugins/typescript/LanguageServiceManager");
const utils_1 = require("./plugins/typescript/utils");
const utils_2 = require("./utils");
const TagCloseRequest = new vscode.RequestType('html/tag');
// Start the language server
function startLanguageServer(connection, env) {
    // Create our managers
    const documentManager = new DocumentManager_1.DocumentManager();
    const pluginHost = new PluginHost_1.PluginHost(documentManager);
    let configManager;
    let typescriptPlugin = undefined;
    let hasConfigurationCapability = false;
    connection.onInitialize((params) => {
        const environment = params.initializationOptions?.environment ?? 'node';
        const workspaceUris = params.workspaceFolders?.map((folder) => folder.uri.toString()) ?? [params.rootUri ?? ''];
        workspaceUris.forEach((uri) => {
            uri = (0, utils_2.urlToPath)(uri);
            // If the workspace is not an Astro project, we shouldn't warn about not finding Astro
            // Unless the extension enabled itself in an untitled workspace, in which case the warning is valid
            if (!(0, utils_2.isAstroWorkspace)(uri) && uri !== '/' && uri !== '') {
                return;
            }
            const astroInstall = (0, utils_2.getAstroInstall)([uri]);
            if (!astroInstall) {
                connection.sendNotification(vscode_languageserver_1.ShowMessageNotification.type, {
                    message: `Couldn't find Astro in workspace "${uri}". Experience might be degraded. For the best experience, please make sure Astro is installed and then restart the language server`,
                    type: vscode_languageserver_1.MessageType.Warning,
                });
            }
        });
        hasConfigurationCapability = !!(params.capabilities.workspace && !!params.capabilities.workspace.configuration);
        configManager = new ConfigManager_1.ConfigManager(connection, hasConfigurationCapability);
        pluginHost.initialize({
            filterIncompleteCompletions: !params.initializationOptions?.dontFilterIncompleteCompletions,
            definitionLinkSupport: !!params.capabilities.textDocument?.definition?.linkSupport,
        });
        // Register plugins
        pluginHost.registerPlugin(new HTMLPlugin_1.HTMLPlugin(configManager));
        pluginHost.registerPlugin(new CSSPlugin_1.CSSPlugin(configManager));
        // We don't currently support running the TypeScript and Astro plugin in the browser
        if (environment === 'node') {
            const ts = env.loadTypescript(params.initializationOptions);
            if (ts) {
                const tsLocalized = env.loadTypescriptLocalized(params.initializationOptions);
                const languageServiceManager = new LanguageServiceManager_1.LanguageServiceManager(documentManager, workspaceUris.map(utils_2.normalizeUri), configManager, ts, tsLocalized);
                typescriptPlugin = new plugins_1.TypeScriptPlugin(configManager, languageServiceManager);
                pluginHost.registerPlugin(new AstroPlugin_1.AstroPlugin(configManager, languageServiceManager));
                pluginHost.registerPlugin(typescriptPlugin);
            }
            else {
                connection.sendNotification(vscode_languageserver_1.ShowMessageNotification.type, {
                    message: `Astro: Couldn't load TypeScript from path ${params?.initializationOptions?.typescript?.serverPath}. Only HTML and CSS features will be enabled`,
                    type: vscode_languageserver_1.MessageType.Warning,
                });
            }
        }
        return {
            capabilities: {
                textDocumentSync: {
                    openClose: true,
                    change: vscode.TextDocumentSyncKind.Incremental,
                    save: {
                        includeText: true,
                    },
                },
                foldingRangeProvider: true,
                definitionProvider: true,
                typeDefinitionProvider: true,
                referencesProvider: true,
                implementationProvider: true,
                renameProvider: true,
                documentFormattingProvider: true,
                codeActionProvider: {
                    codeActionKinds: [
                        vscode_languageserver_1.CodeActionKind.QuickFix,
                        vscode_languageserver_1.CodeActionKind.SourceOrganizeImports,
                        // VS Code specific
                        CodeActionsProvider_1.sortImportKind,
                    ],
                },
                completionProvider: {
                    resolveProvider: true,
                    triggerCharacters: [
                        '.',
                        '"',
                        "'",
                        '`',
                        '/',
                        '@',
                        '<',
                        ' ',
                        // Emmet
                        '>',
                        '*',
                        '#',
                        '$',
                        '+',
                        '^',
                        '(',
                        '[',
                        '@',
                        '-',
                        // No whitespace because
                        // it makes for weird/too many completions
                        // of other completion providers
                        // Astro
                        ':',
                    ],
                },
                colorProvider: true,
                hoverProvider: true,
                documentSymbolProvider: true,
                linkedEditingRangeProvider: true,
                semanticTokensProvider: {
                    legend: (0, utils_1.getSemanticTokenLegend)(),
                    range: true,
                    full: true,
                },
                inlayHintProvider: true,
                signatureHelpProvider: {
                    triggerCharacters: ['(', ',', '<'],
                    retriggerCharacters: [')'],
                },
            },
        };
    });
    // The params don't matter here because in "pull mode" it's always null, it's intended that when the config is updated
    // you should just reset "your internal cache" and get the config again for relevant documents, weird API design
    connection.onDidChangeConfiguration(async (change) => {
        if (hasConfigurationCapability) {
            configManager.updateConfig();
            documentManager.getAllOpenedByClient().forEach(async (document) => {
                await configManager.getConfig('astro', document[1].uri);
            });
        }
        else {
            configManager.updateGlobalConfig(change.settings.astro || ConfigManager_1.defaultLSConfig);
        }
        updateAllDiagnostics();
    });
    // Documents
    connection.onDidOpenTextDocument((params) => {
        documentManager.openDocument(params.textDocument);
        documentManager.markAsOpenedInClient(params.textDocument.uri);
    });
    connection.onDidCloseTextDocument((params) => documentManager.closeDocument(params.textDocument.uri));
    connection.onDidChangeTextDocument((params) => {
        documentManager.updateDocument(params.textDocument, params.contentChanges);
    });
    const diagnosticsManager = new DiagnosticsManager_1.DiagnosticsManager(connection.sendDiagnostics, documentManager, pluginHost.getDiagnostics.bind(pluginHost));
    const updateAllDiagnostics = (0, utils_2.debounceThrottle)(() => diagnosticsManager.updateAll(), 1000);
    connection.onDidChangeWatchedFiles(async (evt) => {
        const params = evt.changes
            .map((change) => ({
            fileName: (0, utils_2.urlToPath)(change.uri),
            changeType: change.type,
        }))
            .filter((change) => !!change.fileName);
        await pluginHost.onWatchFileChanges(params);
        updateAllDiagnostics();
    });
    // Features
    connection.onHover((params) => pluginHost.doHover(params.textDocument, params.position));
    connection.onDefinition((evt) => pluginHost.getDefinitions(evt.textDocument, evt.position));
    connection.onTypeDefinition((evt) => pluginHost.getTypeDefinitions(evt.textDocument, evt.position));
    connection.onReferences((evt) => pluginHost.getReferences(evt.textDocument, evt.position, evt.context));
    connection.onImplementation((evt) => pluginHost.getImplementations(evt.textDocument, evt.position));
    connection.onFoldingRanges((evt) => pluginHost.getFoldingRanges(evt.textDocument));
    connection.onCodeAction((evt, cancellationToken) => pluginHost.getCodeActions(evt.textDocument, evt.range, evt.context, cancellationToken));
    connection.onCompletion(async (evt) => {
        const promise = pluginHost.getCompletions(evt.textDocument, evt.position, evt.context);
        return promise;
    });
    connection.onCompletionResolve((completionItem) => {
        const data = completionItem.data;
        if (!data) {
            return completionItem;
        }
        return pluginHost.resolveCompletion(data, completionItem);
    });
    connection.onDocumentSymbol((params, cancellationToken) => pluginHost.getDocumentSymbols(params.textDocument, cancellationToken));
    connection.onRequest(vscode_languageserver_1.SemanticTokensRequest.type, (evt, cancellationToken) => pluginHost.getSemanticTokens(evt.textDocument, undefined, cancellationToken));
    connection.onRequest(vscode_languageserver_1.SemanticTokensRangeRequest.type, (evt, cancellationToken) => pluginHost.getSemanticTokens(evt.textDocument, evt.range, cancellationToken));
    connection.onRequest(vscode_languageserver_1.LinkedEditingRangeRequest.type, async (evt) => await pluginHost.getLinkedEditingRanges(evt.textDocument, evt.position));
    connection.onDocumentFormatting((params) => pluginHost.formatDocument(params.textDocument, params.options));
    connection.onDocumentColor((params) => pluginHost.getDocumentColors(params.textDocument));
    connection.onColorPresentation((params) => pluginHost.getColorPresentations(params.textDocument, params.range, params.color));
    connection.onRequest(vscode_languageserver_1.InlayHintRequest.type, (params, cancellationToken) => pluginHost.getInlayHints(params.textDocument, params.range, cancellationToken));
    connection.onRequest(TagCloseRequest, (evt) => pluginHost.doTagComplete(evt.textDocument, evt.position));
    connection.onSignatureHelp((evt, cancellationToken) => pluginHost.getSignatureHelp(evt.textDocument, evt.position, evt.context, cancellationToken));
    connection.onRenameRequest((evt) => pluginHost.rename(evt.textDocument, evt.position, evt.newName));
    connection.onDidSaveTextDocument(updateAllDiagnostics);
    connection.onNotification('$/onDidChangeNonAstroFile', async (e) => {
        const path = (0, utils_2.urlToPath)(e.uri);
        if (path) {
            pluginHost.updateNonAstroFile(path, e.changes, e.text);
        }
        updateAllDiagnostics();
    });
    connection.onRequest('$/getFileReferences', async (uri) => {
        return pluginHost.fileReferences({ uri });
    });
    connection.onRequest('$/getTSXOutput', async (uri) => {
        const doc = documentManager.get(uri);
        if (!doc) {
            return undefined;
        }
        if (doc && typescriptPlugin) {
            const tsxOutput = typescriptPlugin.getTSXForDocument(doc);
            return tsxOutput.code;
        }
    });
    documentManager.on('documentChange', updateAllDiagnostics);
    documentManager.on('documentClose', (document) => {
        diagnosticsManager.removeDiagnostics(document);
        configManager.removeDocument(document.uri);
    });
    // Taking off 🚀
    connection.onInitialized(() => {
        connection.console.log('Successfully initialized! 🚀');
        // Register for all configuration changes.
        if (hasConfigurationCapability) {
            connection.client.register(vscode_languageserver_1.DidChangeConfigurationNotification.type);
        }
    });
    connection.listen();
}
exports.startLanguageServer = startLanguageServer;
