"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeActionsProviderImpl = exports.sortImportKind = void 0;
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const documents_1 = require("../../../core/documents");
const utils_1 = require("../../../utils");
const utils_2 = require("../utils");
const CompletionsProvider_1 = require("./CompletionsProvider");
const utils_3 = require("./utils");
// These are VS Code specific CodeActionKind so they're not in the language server protocol
exports.sortImportKind = `${vscode_languageserver_types_1.CodeActionKind.Source}.sortImports`;
class CodeActionsProviderImpl {
    constructor(languageServiceManager, configManager) {
        this.languageServiceManager = languageServiceManager;
        this.configManager = configManager;
        this.ts = languageServiceManager.docContext.ts;
    }
    async getCodeActions(document, range, context, cancellationToken) {
        const { lang, tsDoc } = await this.languageServiceManager.getLSAndTSDoc(document);
        const fragment = await tsDoc.createFragment();
        const tsPreferences = await this.configManager.getTSPreferences(document);
        const formatOptions = await this.configManager.getTSFormatConfig(document);
        let result = [];
        if (cancellationToken?.isCancellationRequested) {
            return [];
        }
        if (context.only?.[0] === vscode_languageserver_types_1.CodeActionKind.SourceOrganizeImports) {
            return await this.organizeSortImports(document, false, cancellationToken);
        }
        // The difference between Sort Imports and Organize Imports is that Sort Imports won't do anything destructive.
        // For example, it won't remove unused imports whereas Organize Imports will
        if (context.only?.[0] === exports.sortImportKind) {
            return await this.organizeSortImports(document, true, cancellationToken);
        }
        if (context.only?.[0] === vscode_languageserver_types_1.CodeActionKind.Source) {
            return [
                ...(await this.organizeSortImports(document, true, cancellationToken)),
                ...(await this.organizeSortImports(document, false, cancellationToken)),
            ];
        }
        if (context.diagnostics.length && (!context.only || context.only.includes(vscode_languageserver_types_1.CodeActionKind.QuickFix))) {
            const errorCodes = context.diagnostics
                .map((diag) => Number(diag.code))
                // We currently cannot support quick fix for unreachable code properly due to the way our TSX output is structured
                .filter((code) => code !== 7027);
            const html = document.html;
            const node = html.findNodeAt(document.offsetAt(range.start));
            let codeFixes;
            let isInsideScript = false;
            if (node.tag === 'script') {
                const { snapshot: scriptTagSnapshot, filePath: scriptFilePath } = (0, utils_2.getScriptTagSnapshot)(tsDoc, document, node);
                const start = scriptTagSnapshot.offsetAt(scriptTagSnapshot.getGeneratedPosition(range.start));
                const end = scriptTagSnapshot.offsetAt(scriptTagSnapshot.getGeneratedPosition(range.end));
                codeFixes = lang.getCodeFixesAtPosition(scriptFilePath, start, end, errorCodes, formatOptions, tsPreferences);
                codeFixes = codeFixes.map((fix) => ({
                    ...fix,
                    changes: mapScriptTagFixToOriginal(fix.changes, scriptTagSnapshot),
                }));
                isInsideScript = true;
            }
            else {
                const start = fragment.offsetAt(fragment.getGeneratedPosition(range.start));
                const end = fragment.offsetAt(fragment.getGeneratedPosition(range.end));
                codeFixes = errorCodes.includes(2304)
                    ? this.getComponentQuickFix(start, end, lang, tsDoc.filePath, formatOptions, tsPreferences)
                    : undefined;
                codeFixes =
                    codeFixes ??
                        lang.getCodeFixesAtPosition(tsDoc.filePath, start, end, errorCodes, formatOptions, tsPreferences);
            }
            const codeActions = codeFixes.map((fix) => codeFixToCodeAction(fix, context.diagnostics, context.only ? vscode_languageserver_types_1.CodeActionKind.QuickFix : vscode_languageserver_types_1.CodeActionKind.Empty, isInsideScript, this.ts));
            result.push(...codeActions);
        }
        return result;
        function codeFixToCodeAction(codeFix, diagnostics, kind, isInsideScript, ts) {
            const documentChanges = codeFix.changes.map((change) => {
                return vscode_languageserver_types_1.TextDocumentEdit.create(vscode_languageserver_types_1.OptionalVersionedTextDocumentIdentifier.create(document.getURL(), null), change.textChanges.map((edit) => {
                    let originalRange = (0, documents_1.mapRangeToOriginal)(fragment, (0, utils_2.convertRange)(fragment, edit.span));
                    // Inside scripts, we don't need to restrain the insertion of code inside a specific zone as it will be
                    // restricted to the area of the script tag by default
                    if (!isInsideScript) {
                        if (codeFix.fixName === 'import') {
                            return (0, CompletionsProvider_1.codeActionChangeToTextEdit)(document, fragment, false, edit, ts);
                        }
                        if (codeFix.fixName === 'fixMissingFunctionDeclaration') {
                            originalRange = (0, utils_2.checkEndOfFileCodeInsert)(originalRange, document);
                        }
                    }
                    else {
                        // Make sure new imports are not added on the file line of the script tag
                        if (codeFix.fixName === 'import') {
                            const existingLine = (0, documents_1.getLineAtPosition)(document.positionAt(edit.span.start), document.getText());
                            const isNewImport = !existingLine.trim().startsWith('import');
                            if (!(edit.newText.startsWith('\n') || edit.newText.startsWith('\r\n')) && isNewImport) {
                                edit.newText = ts.sys.newLine + edit.newText;
                            }
                        }
                    }
                    return vscode_languageserver_types_1.TextEdit.replace(originalRange, edit.newText);
                }));
            });
            const codeAction = vscode_languageserver_types_1.CodeAction.create(codeFix.description, {
                documentChanges,
            }, kind);
            codeAction.diagnostics = diagnostics;
            return codeAction;
        }
        function mapScriptTagFixToOriginal(changes, scriptTagSnapshot) {
            return changes.map((change) => {
                change.textChanges.map((edit) => {
                    edit.span.start = fragment.offsetAt(scriptTagSnapshot.getOriginalPosition(scriptTagSnapshot.positionAt(edit.span.start)));
                    return edit;
                });
                return change;
            });
        }
    }
    getComponentQuickFix(start, end, lang, filePath, formatOptions, tsPreferences) {
        const sourceFile = lang.getProgram()?.getSourceFile(filePath);
        if (!sourceFile) {
            return;
        }
        const node = (0, utils_3.findContainingNode)(sourceFile, {
            start,
            length: end - start,
        }, (n) => this.ts.isJsxClosingElement(n) || this.ts.isJsxOpeningLikeElement(n));
        if (!node) {
            return;
        }
        const tagName = node.tagName;
        // Unlike quick fixes, completions will be able to find the component, so let's use those to get it
        const completion = lang.getCompletionsAtPosition(filePath, tagName.getEnd(), tsPreferences, formatOptions);
        if (!completion) {
            return;
        }
        const name = tagName.getText();
        const suffixedName = name + '__AstroComponent_';
        const toFix = (c) => lang.getCompletionEntryDetails(filePath, end, c.name, {}, c.source, {}, c.data)?.codeActions?.map((a) => ({
            ...a,
            description: (0, utils_2.removeAstroComponentSuffix)(a.description),
            fixName: 'import',
        })) ?? [];
        return completion.entries.filter((c) => c.name === name || c.name === suffixedName).flatMap(toFix);
    }
    async organizeSortImports(document, skipDestructiveCodeActions = false, cancellationToken) {
        const { lang, tsDoc } = await this.languageServiceManager.getLSAndTSDoc(document);
        const filePath = tsDoc.filePath;
        const fragment = await tsDoc.createFragment();
        if (cancellationToken?.isCancellationRequested) {
            return [];
        }
        let changes = [];
        if (document.astroMeta.frontmatter.state === 'closed') {
            changes.push(...lang.organizeImports({ fileName: filePath, type: 'file', skipDestructiveCodeActions }, {}, {}));
        }
        document.scriptTags.forEach((scriptTag) => {
            const { filePath: scriptFilePath, snapshot: scriptTagSnapshot } = (0, utils_2.getScriptTagSnapshot)(tsDoc, document, scriptTag.container);
            const edits = lang.organizeImports({ fileName: scriptFilePath, type: 'file', skipDestructiveCodeActions }, {}, {});
            edits.forEach((edit) => {
                edit.fileName = tsDoc.filePath;
                edit.textChanges = edit.textChanges
                    .map((change) => {
                    change.span.start = fragment.offsetAt(scriptTagSnapshot.getOriginalPosition(scriptTagSnapshot.positionAt(change.span.start)));
                    return change;
                })
                    // Since our last line is a (virtual) export, organize imports will try to rewrite it, so let's only take
                    // changes that actually happens inside the script tag
                    .filter((change) => {
                    return (scriptTagSnapshot.isInGenerated(document.positionAt(change.span.start)) &&
                        !change.newText.includes('export { }'));
                });
                return edit;
            });
            changes.push(...edits);
        });
        const documentChanges = changes.map((change) => {
            return vscode_languageserver_types_1.TextDocumentEdit.create(vscode_languageserver_types_1.OptionalVersionedTextDocumentIdentifier.create(document.url, null), change.textChanges.map((edit) => {
                const range = (0, documents_1.mapRangeToOriginal)(fragment, (0, utils_2.convertRange)(fragment, edit.span));
                return vscode_languageserver_types_1.TextEdit.replace(range, this.fixIndentationOfImports(edit.newText, range, document));
            }));
        });
        return [
            vscode_languageserver_types_1.CodeAction.create(skipDestructiveCodeActions ? 'Sort Imports' : 'Organize Imports', {
                documentChanges,
            }, skipDestructiveCodeActions ? exports.sortImportKind : vscode_languageserver_types_1.CodeActionKind.SourceOrganizeImports),
        ];
    }
    // "Organize Imports" will have edits that delete all imports by return empty edits
    // and one edit which contains all the organized imports. Fix indentation
    // of that one by prepending all lines with the indentation of the first line.
    fixIndentationOfImports(edit, range, document) {
        if (!edit || range.start.character === 0) {
            return edit;
        }
        const existingLine = (0, documents_1.getLineAtPosition)(range.start, document.getText());
        const leadingChars = existingLine.substring(0, range.start.character);
        if (leadingChars.trim() !== '') {
            return edit;
        }
        return (0, utils_1.modifyLines)(edit, (line, idx) => (idx === 0 || !line ? line : leadingChars + line));
    }
}
exports.CodeActionsProviderImpl = CodeActionsProviderImpl;
