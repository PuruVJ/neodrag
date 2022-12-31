"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginHost = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const documents_1 = require("../core/documents");
const utils_1 = require("../utils");
var ExecuteMode;
(function (ExecuteMode) {
    ExecuteMode[ExecuteMode["None"] = 0] = "None";
    ExecuteMode[ExecuteMode["FirstNonNull"] = 1] = "FirstNonNull";
    ExecuteMode[ExecuteMode["Collect"] = 2] = "Collect";
})(ExecuteMode || (ExecuteMode = {}));
class PluginHost {
    constructor(docManager) {
        this.docManager = docManager;
        this.plugins = [];
        this.pluginHostConfig = {
            filterIncompleteCompletions: true,
            definitionLinkSupport: false,
        };
    }
    initialize(pluginHostConfig) {
        this.pluginHostConfig = pluginHostConfig;
    }
    registerPlugin(plugin) {
        this.plugins.push(plugin);
    }
    async getCompletions(textDocument, position, completionContext, cancellationToken) {
        const document = this.getDocument(textDocument.uri);
        const completions = await Promise.all(this.plugins.map(async (plugin) => {
            const result = await this.tryExecutePlugin(plugin, 'getCompletions', [document, position, completionContext, cancellationToken], null);
            if (result) {
                return { result: result, plugin: plugin.__name };
            }
        })).then((fullCompletions) => fullCompletions.filter(utils_1.isNotNullOrUndefined));
        const html = completions.find((completion) => completion.plugin === 'html');
        const ts = completions.find((completion) => completion.plugin === 'typescript');
        const astro = completions.find((completion) => completion.plugin === 'astro');
        if (html && ts) {
            const inComponentStartTag = (0, documents_1.isInComponentStartTag)(document.html, document.offsetAt(position));
            // If the HTML plugin returned completions, it's highly likely that TS ones are duplicate
            if (html.result.items.length > 0) {
                ts.result.items = [];
            }
            // Inside components, if the Astro plugin has completions we don't want the TS ones are they're duplicates
            if (astro && astro.result.items.length > 0 && inComponentStartTag) {
                ts.result.items = [];
            }
        }
        let flattenedCompletions = completions.flatMap((completion) => completion.result.items);
        const isIncomplete = completions.reduce((incomplete, completion) => incomplete || completion.result.isIncomplete, false);
        // If the result is incomplete, we need to filter the results ourselves
        // to throw out non-matching results. VSCode does filter client-side,
        // but other IDEs might not.
        if (isIncomplete && this.pluginHostConfig.filterIncompleteCompletions) {
            const offset = document.offsetAt(position);
            // Assumption for performance reasons:
            // Noone types import names longer than 20 characters and still expects perfect autocompletion.
            const text = document.getText().substring(Math.max(0, offset - 20), offset);
            const start = (0, utils_1.regexLastIndexOf)(text, /[\W\s]/g) + 1;
            const filterValue = text.substring(start).toLowerCase();
            flattenedCompletions = flattenedCompletions.filter((comp) => comp.label.toLowerCase().includes(filterValue));
        }
        return vscode_languageserver_1.CompletionList.create(flattenedCompletions, isIncomplete);
    }
    async resolveCompletion(textDocument, completionItem) {
        const document = this.getDocument(textDocument.uri);
        const result = await this.execute('resolveCompletion', [document, completionItem], ExecuteMode.FirstNonNull);
        return result ?? completionItem;
    }
    async getDiagnostics(textDocument) {
        const document = this.getDocument(textDocument.uri);
        const diagnostics = await this.execute('getDiagnostics', [document], ExecuteMode.Collect);
        return diagnostics;
    }
    async doHover(textDocument, position) {
        const document = this.getDocument(textDocument.uri);
        return this.execute('doHover', [document, position], ExecuteMode.FirstNonNull);
    }
    async formatDocument(textDocument, options) {
        const document = this.getDocument(textDocument.uri);
        return await this.execute('formatDocument', [document, options], ExecuteMode.Collect);
    }
    async getCodeActions(textDocument, range, context, cancellationToken) {
        const document = this.getDocument(textDocument.uri);
        return await this.execute('getCodeActions', [document, range, context, cancellationToken], ExecuteMode.Collect);
    }
    async doTagComplete(textDocument, position) {
        const document = this.getDocument(textDocument.uri);
        return this.execute('doTagComplete', [document, position], ExecuteMode.FirstNonNull);
    }
    async getFoldingRanges(textDocument) {
        const document = this.getDocument(textDocument.uri);
        return await this.execute('getFoldingRanges', [document], ExecuteMode.Collect);
    }
    async getDocumentSymbols(textDocument, cancellationToken) {
        const document = this.getDocument(textDocument.uri);
        return await this.execute('getDocumentSymbols', [document, cancellationToken], ExecuteMode.Collect);
    }
    async getSemanticTokens(textDocument, range, cancellationToken) {
        const document = this.getDocument(textDocument.uri);
        return await this.execute('getSemanticTokens', [document, range, cancellationToken], ExecuteMode.FirstNonNull);
    }
    async getLinkedEditingRanges(textDocument, position) {
        const document = this.getDocument(textDocument.uri);
        return await this.execute('getLinkedEditingRanges', [document, position], ExecuteMode.FirstNonNull);
    }
    async fileReferences(textDocument) {
        const document = this.getDocument(textDocument.uri);
        return await this.execute('fileReferences', [document], ExecuteMode.FirstNonNull);
    }
    async getDefinitions(textDocument, position) {
        const document = this.getDocument(textDocument.uri);
        const definitions = await this.execute('getDefinitions', [document, position], ExecuteMode.Collect);
        if (this.pluginHostConfig.definitionLinkSupport) {
            return definitions;
        }
        else {
            return definitions.map((def) => ({ range: def.targetSelectionRange, uri: def.targetUri }));
        }
    }
    getTypeDefinitions(textDocument, position) {
        const document = this.getDocument(textDocument.uri);
        return this.execute('getTypeDefinitions', [document, position], ExecuteMode.FirstNonNull);
    }
    getImplementations(textDocument, position) {
        const document = this.getDocument(textDocument.uri);
        return this.execute('getImplementation', [document, position], ExecuteMode.FirstNonNull);
    }
    getReferences(textdocument, position, context) {
        const document = this.getDocument(textdocument.uri);
        return this.execute('findReferences', [document, position, context], ExecuteMode.FirstNonNull);
    }
    async rename(textDocument, position, newName) {
        const document = this.getDocument(textDocument.uri);
        return this.execute('rename', [document, position, newName], ExecuteMode.FirstNonNull);
    }
    async getDocumentColors(textDocument) {
        const document = this.getDocument(textDocument.uri);
        return await this.execute('getDocumentColors', [document], ExecuteMode.Collect);
    }
    async getColorPresentations(textDocument, range, color) {
        const document = this.getDocument(textDocument.uri);
        return await this.execute('getColorPresentations', [document, range, color], ExecuteMode.Collect);
    }
    async getInlayHints(textDocument, range, cancellationToken) {
        const document = this.getDocument(textDocument.uri);
        return (await this.execute('getInlayHints', [document, range], ExecuteMode.FirstNonNull)) ?? [];
    }
    async getSignatureHelp(textDocument, position, context, cancellationToken) {
        const document = this.getDocument(textDocument.uri);
        return await this.execute('getSignatureHelp', [document, position, context, cancellationToken], ExecuteMode.FirstNonNull);
    }
    async onWatchFileChanges(onWatchFileChangesParams) {
        for (const support of this.plugins) {
            await support.onWatchFileChanges?.(onWatchFileChangesParams);
        }
    }
    updateNonAstroFile(fileName, changes, text) {
        for (const support of this.plugins) {
            support.updateNonAstroFile?.(fileName, changes, text);
        }
    }
    getDocument(uri) {
        const document = this.docManager.get(uri);
        if (!document) {
            throw new Error('Cannot call methods on an unopened document');
        }
        return document;
    }
    async execute(name, args, mode) {
        const plugins = this.plugins.filter((plugin) => typeof plugin[name] === 'function');
        switch (mode) {
            case ExecuteMode.FirstNonNull:
                for (const plugin of plugins) {
                    const res = await this.tryExecutePlugin(plugin, name, args, null);
                    if (res != null) {
                        return res;
                    }
                }
                return null;
            case ExecuteMode.Collect:
                return (await Promise.all(plugins.map((plugin) => {
                    let ret = this.tryExecutePlugin(plugin, name, args, []);
                    return ret;
                }))).flat();
            case ExecuteMode.None:
                await Promise.all(plugins.map((plugin) => this.tryExecutePlugin(plugin, name, args, null)));
                return;
        }
    }
    async tryExecutePlugin(plugin, fnName, args, failValue) {
        try {
            return await plugin[fnName](...args);
        }
        catch (e) {
            console.error(e);
            return failValue;
        }
    }
}
exports.PluginHost = PluginHost;
