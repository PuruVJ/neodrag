"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeActionChangeToTextEdit = exports.CompletionsProviderImpl = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const documents_1 = require("../../../core/documents");
const utils_1 = require("../../../core/documents/utils");
const utils_2 = require("../../../utils");
const previewer_1 = require("../previewer");
const utils_3 = require("../utils");
const utils_4 = require("./utils");
// `import {...} from '..'` or `import ... from '..'`
// Note: Does not take into account if import is within a comment.
const scriptImportRegex = /\bimport\s+{([^}]*?)}\s+?from\s+['"`].+?['"`]|\bimport\s+(\w+?)\s+from\s+['"`].+?['"`]/g;
// When Svelte components are imported, we have to reference the svelte2tsx's types to properly type the component
// An unfortunate downside of this is that it polutes completions, so let's filter those internal types manually
const svelte2tsxTypes = new Set([
    'Svelte2TsxComponent',
    'Svelte2TsxComponentConstructorParameters',
    'SvelteComponentConstructor',
    'SvelteActionReturnType',
    'SvelteTransitionConfig',
    'SvelteTransitionReturnType',
    'SvelteAnimationReturnType',
    'SvelteWithOptionalProps',
    'SvelteAllProps',
    'SveltePropsAnyFallback',
    'SvelteSlotsAnyFallback',
    'SvelteRestProps',
    'SvelteSlots',
    'SvelteStore',
]);
class CompletionsProviderImpl {
    constructor(languageServiceManager, configManager) {
        this.languageServiceManager = languageServiceManager;
        this.configManager = configManager;
        this.validTriggerCharacters = ['.', '"', "'", '`', '/', '@', '<', '#'];
        this.ts = languageServiceManager.docContext.ts;
    }
    isValidTriggerCharacter(character) {
        return this.validTriggerCharacters.includes(character);
    }
    async getCompletions(document, position, completionContext, cancellationToken) {
        const triggerCharacter = completionContext?.triggerCharacter;
        const triggerKind = completionContext?.triggerKind;
        const validTriggerCharacter = this.isValidTriggerCharacter(triggerCharacter) ? triggerCharacter : undefined;
        const isCustomTriggerCharacter = triggerKind === vscode_languageserver_1.CompletionTriggerKind.TriggerCharacter;
        if ((isCustomTriggerCharacter && !validTriggerCharacter) || cancellationToken?.isCancellationRequested) {
            return null;
        }
        if (this.canReuseLastCompletion(this.lastCompletion, triggerKind, triggerCharacter, document, position)) {
            this.lastCompletion.position = position;
            return this.lastCompletion.completionList;
        }
        else {
            this.lastCompletion = undefined;
        }
        const html = document.html;
        const offset = document.offsetAt(position);
        const node = html.findNodeAt(offset);
        const { lang, tsDoc } = await this.languageServiceManager.getLSAndTSDoc(document);
        let filePath = tsDoc.filePath;
        let completions;
        const isCompletionInsideFrontmatter = (0, utils_1.isInsideFrontmatter)(document.getText(), offset);
        const isCompletionInsideExpression = (0, utils_1.isInsideExpression)(document.getText(), node.start, offset);
        const tsPreferences = await this.configManager.getTSPreferences(document);
        const formatOptions = await this.configManager.getTSFormatConfig(document);
        let scriptTagIndex = undefined;
        if (node.tag === 'script') {
            const { filePath: scriptFilePath, offset: scriptOffset, index: scriptIndex, } = (0, utils_3.getScriptTagSnapshot)(tsDoc, document, node, position);
            filePath = scriptFilePath;
            scriptTagIndex = scriptIndex;
            completions = lang.getCompletionsAtPosition(scriptFilePath, scriptOffset, {
                ...tsPreferences,
                triggerCharacter: validTriggerCharacter,
            }, formatOptions);
        }
        else {
            // PERF: Getting TS completions is fairly slow and I am currently not sure how to speed it up
            // As such, we'll try to avoid getting them when unneeded, such as when we're doing HTML stuff
            // When at the root of the document TypeScript offer all kinds of completions, because it doesn't know yet that
            // it's JSX and not JS. As such, people who are using Emmet to write their template suffer from a very degraded experience
            // from what they're used to in HTML files (which is instant completions). So let's disable ourselves when we're at the root
            if (!isCompletionInsideFrontmatter && !node.parent && !isCompletionInsideExpression) {
                return null;
            }
            // If the user just typed `<` with nothing else, let's disable ourselves until we're more sure if the user wants TS completions
            if (!isCompletionInsideFrontmatter && node.parent && node.tag === undefined && !isCompletionInsideExpression) {
                return null;
            }
            // If the current node is not a component, let's disable ourselves as the user
            // is most likely looking for HTML completions
            if (!isCompletionInsideFrontmatter && !(0, utils_1.isPossibleComponent)(node) && !isCompletionInsideExpression) {
                return null;
            }
            completions = lang.getCompletionsAtPosition(filePath, offset, {
                ...tsPreferences,
                triggerCharacter: validTriggerCharacter,
            }, formatOptions);
        }
        if (completions === undefined || completions.entries.length === 0) {
            return null;
        }
        const wordRange = completions.optionalReplacementSpan
            ? vscode_languageserver_1.Range.create(document.positionAt(completions.optionalReplacementSpan.start), document.positionAt(completions.optionalReplacementSpan.start + completions.optionalReplacementSpan.length))
            : undefined;
        const wordRangeStartPosition = wordRange?.start;
        const fragment = await tsDoc.createFragment();
        const existingImports = this.getExistingImports(document);
        const completionItems = completions.entries
            .filter((completion) => this.isValidCompletion(completion, this.ts))
            .map((entry) => this.toCompletionItem(fragment, entry, filePath, offset, isCompletionInsideFrontmatter, scriptTagIndex, existingImports))
            .filter(utils_2.isNotNullOrUndefined)
            .map((comp) => this.fixTextEditRange(wordRangeStartPosition, comp));
        const completionList = vscode_languageserver_1.CompletionList.create(completionItems, true);
        this.lastCompletion = { key: document.getFilePath() || '', position, completionList };
        return completionList;
    }
    async resolveCompletion(document, item, cancellationToken) {
        const { lang, tsDoc } = await this.languageServiceManager.getLSAndTSDoc(document);
        const tsPreferences = await this.configManager.getTSPreferences(document);
        const data = item.data;
        if (!data || !data.filePath || cancellationToken?.isCancellationRequested) {
            return item;
        }
        const fragment = await tsDoc.createFragment();
        const detail = lang.getCompletionEntryDetails(data.filePath, // fileName
        data.offset, // position
        data.originalItem.name, // entryName
        {}, // formatOptions
        data.originalItem.source, // source
        tsPreferences, // preferences
        data.originalItem.data // data
        );
        if (detail) {
            const { detail: itemDetail, documentation: itemDocumentation } = this.getCompletionDocument(detail);
            // TODO: Add support for labelDetails
            // if (data.originalItem.source) {
            // 	item.labelDetails = { description: data.originalItem.source };
            // }
            item.detail = itemDetail;
            item.documentation = itemDocumentation;
        }
        const actions = detail?.codeActions;
        const isInsideScriptTag = data.scriptTagIndex !== undefined;
        let scriptTagSnapshot;
        if (isInsideScriptTag) {
            const { snapshot } = (0, utils_3.getScriptTagSnapshot)(tsDoc, document, document.scriptTags[data.scriptTagIndex].container);
            scriptTagSnapshot = snapshot;
        }
        if (actions) {
            const edit = [];
            for (const action of actions) {
                for (const change of action.changes) {
                    if (isInsideScriptTag) {
                        change.textChanges.forEach((textChange) => {
                            textChange.span.start = fragment.offsetAt(scriptTagSnapshot.getOriginalPosition(scriptTagSnapshot.positionAt(textChange.span.start)));
                        });
                    }
                    edit.push(...change.textChanges.map((textChange) => codeActionChangeToTextEdit(document, fragment, isInsideScriptTag, textChange, this.ts)));
                }
            }
            item.additionalTextEdits = (item.additionalTextEdits ?? []).concat(edit);
        }
        return item;
    }
    toCompletionItem(fragment, comp, filePath, offset, insideFrontmatter, scriptTagIndex, existingImports) {
        let item = vscode_languageserver_protocol_1.CompletionItem.create(comp.name);
        const isAstroComponent = this.isAstroComponentImport(comp.name);
        const isImport = comp.insertText?.includes('import');
        // Avoid showing completions for using components as functions
        if (isAstroComponent && !isImport && insideFrontmatter) {
            return null;
        }
        if (isAstroComponent) {
            item.label = (0, utils_3.removeAstroComponentSuffix)(comp.name);
            // Set component imports as file completion, that way we get cool icons
            item.kind = vscode_languageserver_protocol_1.CompletionItemKind.File;
            item.detail = comp.data?.moduleSpecifier;
        }
        else {
            item.kind = (0, utils_3.scriptElementKindToCompletionItemKind)(comp.kind, this.ts);
        }
        // TS may suggest another component even if there already exists an import with the same.
        // This happens because internally, components get suffixed with __AstroComponent_
        if (isAstroComponent && existingImports.has(item.label)) {
            return null;
        }
        if (comp.kindModifiers) {
            const kindModifiers = new Set(comp.kindModifiers.split(/,|\s+/g));
            if (kindModifiers.has(this.ts.ScriptElementKindModifier.optionalModifier)) {
                if (!item.insertText) {
                    item.insertText = item.label;
                }
                if (!item.filterText) {
                    item.filterText = item.label;
                }
                item.label += '?';
            }
            if (kindModifiers.has(this.ts.ScriptElementKindModifier.deprecatedModifier)) {
                item.tags = [vscode_languageserver_1.CompletionItemTag.Deprecated];
            }
        }
        // TODO: Add support for labelDetails
        // if (comp.sourceDisplay) {
        // 	item.labelDetails = { description: ts.displayPartsToString(comp.sourceDisplay) };
        // }
        item.commitCharacters = (0, utils_3.getCommitCharactersForScriptElement)(comp.kind, this.ts);
        item.sortText = comp.sortText;
        item.preselect = comp.isRecommended;
        if (comp.replacementSpan) {
            item.insertText = comp.insertText ? (0, utils_3.removeAstroComponentSuffix)(comp.insertText) : undefined;
            item.insertTextFormat = comp.isSnippet ? vscode_languageserver_1.InsertTextFormat.Snippet : vscode_languageserver_1.InsertTextFormat.PlainText;
            item.textEdit = comp.replacementSpan
                ? vscode_languageserver_1.TextEdit.replace((0, utils_3.convertRange)(fragment, comp.replacementSpan), item.insertText ?? item.label)
                : undefined;
        }
        return {
            ...item,
            data: {
                uri: fragment.getURL(),
                filePath,
                scriptTagIndex,
                offset,
                originalItem: comp,
            },
        };
    }
    getCompletionDocument(compDetail) {
        const { sourceDisplay, documentation: tsDocumentation, displayParts } = compDetail;
        let detail = (0, utils_3.removeAstroComponentSuffix)(this.ts.displayPartsToString(displayParts));
        if (sourceDisplay) {
            const importPath = this.ts.displayPartsToString(sourceDisplay);
            detail = importPath;
        }
        const documentation = {
            kind: 'markdown',
            value: (0, previewer_1.getMarkdownDocumentation)(tsDocumentation, compDetail.tags, this.ts),
        };
        return {
            documentation,
            detail,
        };
    }
    /**
     * If the textEdit is out of the word range of the triggered position
     * vscode would refuse to show the completions
     * split those edits into additionalTextEdit to fix it
     */
    fixTextEditRange(wordRangePosition, completionItem) {
        const { textEdit } = completionItem;
        if (!textEdit || !vscode_languageserver_1.TextEdit.is(textEdit) || !wordRangePosition) {
            return completionItem;
        }
        const { newText, range: { start }, } = textEdit;
        const wordRangeStartCharacter = wordRangePosition.character;
        if (wordRangePosition.line !== wordRangePosition.line || start.character > wordRangePosition.character) {
            return completionItem;
        }
        textEdit.newText = newText.substring(wordRangeStartCharacter - start.character);
        textEdit.range.start = {
            line: start.line,
            character: wordRangeStartCharacter,
        };
        completionItem.additionalTextEdits = [
            vscode_languageserver_1.TextEdit.replace({
                start,
                end: {
                    line: start.line,
                    character: wordRangeStartCharacter,
                },
            }, newText.substring(0, wordRangeStartCharacter - start.character)),
        ];
        return completionItem;
    }
    canReuseLastCompletion(lastCompletion, triggerKind, triggerCharacter, document, position) {
        return (!!lastCompletion &&
            lastCompletion.key === document.getFilePath() &&
            lastCompletion.position.line === position.line &&
            Math.abs(lastCompletion.position.character - position.character) < 2 &&
            (triggerKind === vscode_languageserver_1.CompletionTriggerKind.TriggerForIncompleteCompletions ||
                // Special case: `.` is a trigger character, but inside import path completions
                // it shouldn't trigger another completion because we can reuse the old one
                (triggerCharacter === '.' && (0, utils_4.isPartOfImportStatement)(document.getText(), position))));
    }
    getExistingImports(document) {
        const rawImports = (0, utils_2.getRegExpMatches)(scriptImportRegex, document.getText()).map((match) => (match[1] ?? match[2]).split(','));
        const tidiedImports = rawImports.flat().map((match) => match.trim());
        return new Set(tidiedImports);
    }
    isAstroComponentImport(className) {
        return className.endsWith('__AstroComponent_');
    }
    isValidCompletion(completion, ts) {
        // Remove completion for default exported function
        const isDefaultExport = completion.name === 'default' && completion.kindModifiers == ts.ScriptElementKindModifier.exportedModifier;
        // Remove completion for svelte2tsx internal types
        const isSvelte2tsxCompletion = completion.name.startsWith('__sveltets_') || svelte2tsxTypes.has(completion.name);
        if (isDefaultExport || isSvelte2tsxCompletion) {
            return false;
        }
        return true;
    }
}
exports.CompletionsProviderImpl = CompletionsProviderImpl;
function codeActionChangeToTextEdit(document, fragment, isInsideScriptTag, change, ts) {
    change.newText = (0, utils_3.removeAstroComponentSuffix)(change.newText);
    const { span } = change;
    let range;
    const virtualRange = (0, utils_3.convertRange)(fragment, span);
    range = (0, documents_1.mapRangeToOriginal)(fragment, virtualRange);
    if (!isInsideScriptTag) {
        // If we don't have a frontmatter already, create one with the import
        const frontmatterState = document.astroMeta.frontmatter.state;
        if (frontmatterState === null) {
            return vscode_languageserver_1.TextEdit.replace(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(0, 0), vscode_languageserver_1.Position.create(0, 0)), `---${ts.sys.newLine}${change.newText}---${ts.sys.newLine}${ts.sys.newLine}`);
        }
        if (!(0, utils_1.isInsideFrontmatter)(document.getText(), document.offsetAt(range.start))) {
            range = (0, utils_3.ensureFrontmatterInsert)(range, document);
        }
        // First import in a file will wrongly have a newline before it due to how the frontmatter is replaced by a comment
        if (range.start.line === 1 && (change.newText.startsWith('\n') || change.newText.startsWith('\r\n'))) {
            change.newText = change.newText.trimStart();
        }
    }
    else {
        const existingLine = (0, utils_1.getLineAtPosition)(document.positionAt(span.start), document.getText());
        const isNewImport = !existingLine.trim().startsWith('import');
        // Avoid putting new imports on the same line as the script tag opening
        if (!(change.newText.startsWith('\n') || change.newText.startsWith('\r\n')) && isNewImport) {
            change.newText = ts.sys.newLine + change.newText;
        }
    }
    return vscode_languageserver_1.TextEdit.replace(range, change.newText);
}
exports.codeActionChangeToTextEdit = codeActionChangeToTextEdit;
