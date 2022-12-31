"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticsProviderImpl = exports.DiagnosticCodes = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const documents_1 = require("../../../core/documents");
const utils_1 = require("../utils");
// List of codes:
// https://github.com/Microsoft/TypeScript/blob/main/src/compiler/diagnosticMessages.json
var DiagnosticCodes;
(function (DiagnosticCodes) {
    DiagnosticCodes[DiagnosticCodes["SPREAD_EXPECTED"] = 1005] = "SPREAD_EXPECTED";
    DiagnosticCodes[DiagnosticCodes["IS_NOT_A_MODULE"] = 2306] = "IS_NOT_A_MODULE";
    DiagnosticCodes[DiagnosticCodes["DUPLICATED_JSX_ATTRIBUTES"] = 17001] = "DUPLICATED_JSX_ATTRIBUTES";
    DiagnosticCodes[DiagnosticCodes["MUST_HAVE_PARENT_ELEMENT"] = 2657] = "MUST_HAVE_PARENT_ELEMENT";
    DiagnosticCodes[DiagnosticCodes["CANT_RETURN_OUTSIDE_FUNC"] = 1108] = "CANT_RETURN_OUTSIDE_FUNC";
    DiagnosticCodes[DiagnosticCodes["ISOLATED_MODULE_COMPILE_ERR"] = 1208] = "ISOLATED_MODULE_COMPILE_ERR";
    DiagnosticCodes[DiagnosticCodes["TYPE_NOT_ASSIGNABLE"] = 2322] = "TYPE_NOT_ASSIGNABLE";
    DiagnosticCodes[DiagnosticCodes["JSX_NO_CLOSING_TAG"] = 17008] = "JSX_NO_CLOSING_TAG";
    DiagnosticCodes[DiagnosticCodes["JSX_ELEMENT_NO_CALL"] = 2604] = "JSX_ELEMENT_NO_CALL";
})(DiagnosticCodes = exports.DiagnosticCodes || (exports.DiagnosticCodes = {}));
class DiagnosticsProviderImpl {
    constructor(languageServiceManager) {
        this.languageServiceManager = languageServiceManager;
        this.ts = languageServiceManager.docContext.ts;
    }
    async getDiagnostics(document, _cancellationToken) {
        // Don't return diagnostics for files inside node_modules. These are considered read-only
        // and they would pollute the output for astro check
        if (document.getFilePath()?.includes('/node_modules/') || document.getFilePath()?.includes('\\node_modules\\')) {
            return [];
        }
        const { lang, tsDoc } = await this.languageServiceManager.getLSAndTSDoc(document);
        const fragment = await tsDoc.createFragment();
        let scriptDiagnostics = [];
        document.scriptTags.forEach((scriptTag) => {
            const { filePath: scriptFilePath, snapshot: scriptTagSnapshot } = (0, utils_1.getScriptTagSnapshot)(tsDoc, document, scriptTag.container);
            const scriptDiagnostic = [
                ...lang.getSyntacticDiagnostics(scriptFilePath),
                ...lang.getSuggestionDiagnostics(scriptFilePath),
                ...lang.getSemanticDiagnostics(scriptFilePath),
            ]
                // We need to duplicate the diagnostic creation here because we can't map TS's diagnostics range to the original
                // file due to some internal cache inside TS that would cause it to being mapped twice in some cases
                .map((diagnostic) => ({
                range: (0, utils_1.convertRange)(scriptTagSnapshot, diagnostic),
                severity: this.mapSeverity(diagnostic.category),
                source: 'ts',
                message: this.ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
                code: diagnostic.code,
                tags: getDiagnosticTag(diagnostic),
            }))
                .map(mapRange(scriptTagSnapshot, document));
            scriptDiagnostics.push(...scriptDiagnostic);
        });
        const { script: scriptBoundaries } = this.getTagBoundaries(lang, tsDoc.filePath);
        const diagnostics = [
            ...lang.getSyntacticDiagnostics(tsDoc.filePath),
            ...lang.getSuggestionDiagnostics(tsDoc.filePath),
            ...lang.getSemanticDiagnostics(tsDoc.filePath),
        ].filter((diag) => {
            return isNoWithinBoundary(scriptBoundaries, diag, this.ts);
        });
        return [
            ...diagnostics
                .map((diagnostic) => ({
                range: (0, utils_1.convertRange)(tsDoc, diagnostic),
                severity: this.mapSeverity(diagnostic.category),
                source: 'ts',
                message: this.ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
                code: diagnostic.code,
                tags: getDiagnosticTag(diagnostic),
            }))
                .map(mapRange(fragment, document)),
            ...scriptDiagnostics,
        ]
            .filter((diag) => {
            return (
            // Make sure the diagnostic is inside the document and not in generated code
            diag.range.start.line <= document.lineCount &&
                hasNoNegativeLines(diag) &&
                isNoJSXMustHaveOneParent(diag) &&
                isNoSpreadExpected(diag, document) &&
                isNoCantReturnOutsideFunction(diag) &&
                isNoIsolatedModuleError(diag) &&
                isNoJsxCannotHaveMultipleAttrsError(diag));
        })
            .map(enhanceIfNecessary);
    }
    getTagBoundaries(lang, tsFilePath) {
        const program = lang.getProgram();
        const sourceFile = program?.getSourceFile(tsFilePath);
        const boundaries = {
            script: [],
        };
        if (!sourceFile) {
            return boundaries;
        }
        function findTags(parent, ts) {
            ts.forEachChild(parent, (node) => {
                if (ts.isJsxElement(node)) {
                    let tagName = node.openingElement.tagName.getText();
                    switch (tagName) {
                        case 'script': {
                            ts.getLineAndCharacterOfPosition(sourceFile, node.getStart());
                            boundaries.script.push([node.getStart(), node.getEnd()]);
                            break;
                        }
                    }
                }
                findTags(node, ts);
            });
        }
        findTags(sourceFile, this.ts);
        return boundaries;
    }
    mapSeverity(category) {
        switch (category) {
            case this.ts.DiagnosticCategory.Error:
                return vscode_languageserver_1.DiagnosticSeverity.Error;
            case this.ts.DiagnosticCategory.Warning:
                return vscode_languageserver_1.DiagnosticSeverity.Warning;
            case this.ts.DiagnosticCategory.Suggestion:
                return vscode_languageserver_1.DiagnosticSeverity.Hint;
            case this.ts.DiagnosticCategory.Message:
                return vscode_languageserver_1.DiagnosticSeverity.Information;
        }
    }
}
exports.DiagnosticsProviderImpl = DiagnosticsProviderImpl;
function isWithinBoundaries(boundaries, start) {
    for (let [bstart, bend] of boundaries) {
        if (start > bstart && start < bend) {
            return true;
        }
    }
    return false;
}
function diagnosticIsWithinBoundaries(sourceFile, boundaries, diagnostic, ts) {
    if ('start' in diagnostic) {
        if (diagnostic.start == null)
            return false;
        return isWithinBoundaries(boundaries, diagnostic.start);
    }
    if (!sourceFile)
        return false;
    let startRange = diagnostic.range.start;
    let pos = ts.getPositionOfLineAndCharacter(sourceFile, startRange.line, startRange.character);
    return isWithinBoundaries(boundaries, pos);
}
function isNoWithinBoundary(boundaries, diagnostic, ts) {
    return !diagnosticIsWithinBoundaries(undefined, boundaries, diagnostic, ts);
}
function mapRange(fragment, _document) {
    return (diagnostic) => {
        let range = (0, documents_1.mapRangeToOriginal)(fragment, diagnostic.range);
        return { ...diagnostic, range };
    };
}
/**
 * In some rare cases mapping of diagnostics does not work and produces negative lines.
 * We filter out these diagnostics with negative lines because else the LSP
 * apparently has a hiccup and does not show any diagnostics at all.
 */
function hasNoNegativeLines(diagnostic) {
    return diagnostic.range.start.line >= 0 && diagnostic.range.end.line >= 0;
}
/**
 * Astro allows multiple attributes to have the same name
 */
function isNoJsxCannotHaveMultipleAttrsError(diagnostic) {
    return diagnostic.code !== DiagnosticCodes.DUPLICATED_JSX_ATTRIBUTES;
}
/** Astro allows component with multiple root elements */
function isNoJSXMustHaveOneParent(diagnostic) {
    return diagnostic.code !== DiagnosticCodes.MUST_HAVE_PARENT_ELEMENT;
}
/**
 * When using the shorthand syntax for props TSX expects you to use the spread operator
 * Since the shorthand syntax works differently in Astro and this is not required, hide this message
 * However, the error code used here is quite generic, as such we need to make we only ignore in valid cases
 */
function isNoSpreadExpected(diagnostic, document) {
    if (diagnostic.code === DiagnosticCodes.SPREAD_EXPECTED &&
        diagnostic.message.includes('...') &&
        document.offsetAt(diagnostic.range.start) > (document.astroMeta.frontmatter.endOffset ?? 0)) {
        return false;
    }
    return true;
}
/**
 * Ignore "Can't return outside of function body"
 * Since the frontmatter is at the top level, users trying to return a Response for SSR mode run into this
 */
function isNoCantReturnOutsideFunction(diagnostic) {
    return diagnostic.code !== DiagnosticCodes.CANT_RETURN_OUTSIDE_FUNC;
}
/**
 * When the content of the file is invalid and can't be parsed properly for TSX generation, TS will show an error about
 * how the current module can't be compiled under --isolatedModule, this is confusing to users so let's ignore this
 */
function isNoIsolatedModuleError(diagnostic) {
    return diagnostic.code !== DiagnosticCodes.ISOLATED_MODULE_COMPILE_ERR;
}
/**
 * Some diagnostics have JSX-specific nomenclature or unclear description. Enhance them for more clarity.
 */
function enhanceIfNecessary(diagnostic) {
    // When the language integrations are not installed, the content of the imported snapshot is empty
    // As such, it triggers the "is not a module error", which we can enhance with a more helpful message for the related framework
    if (diagnostic.code === DiagnosticCodes.IS_NOT_A_MODULE) {
        if (diagnostic.message.includes('.svelte')) {
            diagnostic.message +=
                '\n\nIs the `@astrojs/svelte` package installed? You can add it to your project by running the following command: `astro add svelte`. If already installed, restarting the language server might be necessary in order for the change to take effect';
        }
        if (diagnostic.message.includes('.vue')) {
            diagnostic.message +=
                '\n\nIs the `@astrojs/vue` package installed? You can add it to your project by running the following command: `astro add vue`. If already installed, restarting the language server might be necessary in order for the change to take effect';
        }
        return diagnostic;
    }
    // JSX element has no closing tag. JSX -> HTML
    if (diagnostic.code === DiagnosticCodes.JSX_NO_CLOSING_TAG) {
        return {
            ...diagnostic,
            message: diagnostic.message.replace('JSX', 'HTML'),
        };
    }
    // JSX Element can't be constructed or called. This happens on syntax errors / invalid components
    if (diagnostic.code === DiagnosticCodes.JSX_ELEMENT_NO_CALL) {
        return {
            ...diagnostic,
            message: diagnostic.message
                .replace('JSX element type', 'Component')
                .replace('does not have any construct or call signatures.', 'is not a valid component.\n\nIf this is a Svelte or Vue component, it might have a syntax error that makes it impossible to parse.'),
        };
    }
    // For the rare case where an user might try to put a client directive on something that is not a component
    if (diagnostic.code === DiagnosticCodes.TYPE_NOT_ASSIGNABLE) {
        if (diagnostic.message.includes("Property 'client:") && diagnostic.message.includes("to type 'HTMLAttributes")) {
            return {
                ...diagnostic,
                message: 'Client directives are only available on framework components',
            };
        }
    }
    return diagnostic;
}
function getDiagnosticTag(diagnostic) {
    const tags = [];
    if (diagnostic.reportsUnnecessary) {
        tags.push(vscode_languageserver_types_1.DiagnosticTag.Unnecessary);
    }
    if (diagnostic.reportsDeprecated) {
        tags.push(vscode_languageserver_types_1.DiagnosticTag.Deprecated);
    }
    return tags;
}
