"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScriptTagSnapshot = exports.getScriptTagLanguage = exports.isDocumentSymbolsPath = exports.ensureRealFilePath = exports.ensureRealAstroFilePath = exports.toRealAstroFilePath = exports.toVirtualFilePath = exports.toVirtualAstroFilePath = exports.isVirtualFilePath = exports.isVirtualSvelteFilePath = exports.isVirtualVueFilePath = exports.isVirtualAstroFilePath = exports.isFrameworkFilePath = exports.isAstroFilePath = exports.isVirtualFrameworkFilePath = exports.getFrameworkFromFilePath = exports.removeAstroComponentSuffix = exports.checkEndOfFileCodeInsert = exports.ensureFrontmatterInsert = exports.convertToLocationRange = exports.convertRange = exports.getScriptKindFromFileName = exports.isSubPath = exports.findTsConfigPath = exports.getExtensionFromScriptKind = exports.getCommitCharactersForScriptElement = exports.scriptElementKindToCompletionItemKind = exports.symbolKindFromString = exports.getSemanticTokenLegend = void 0;
const path_1 = require("path");
const vscode_languageserver_1 = require("vscode-languageserver");
const documents_1 = require("../../core/documents");
const utils_1 = require("../../utils");
function getSemanticTokenLegend() {
    const tokenModifiers = [];
    [
        [0 /* TokenModifier.declaration */, vscode_languageserver_1.SemanticTokenModifiers.declaration],
        [1 /* TokenModifier.static */, vscode_languageserver_1.SemanticTokenModifiers.static],
        [2 /* TokenModifier.async */, vscode_languageserver_1.SemanticTokenModifiers.async],
        [3 /* TokenModifier.readonly */, vscode_languageserver_1.SemanticTokenModifiers.readonly],
        [4 /* TokenModifier.defaultLibrary */, vscode_languageserver_1.SemanticTokenModifiers.defaultLibrary],
        [5 /* TokenModifier.local */, 'local'],
    ].forEach(([tsModifier, legend]) => (tokenModifiers[tsModifier] = legend));
    const tokenTypes = [];
    [
        [0 /* TokenType.class */, vscode_languageserver_1.SemanticTokenTypes.class],
        [1 /* TokenType.enum */, vscode_languageserver_1.SemanticTokenTypes.enum],
        [2 /* TokenType.interface */, vscode_languageserver_1.SemanticTokenTypes.interface],
        [3 /* TokenType.namespace */, vscode_languageserver_1.SemanticTokenTypes.namespace],
        [4 /* TokenType.typeParameter */, vscode_languageserver_1.SemanticTokenTypes.typeParameter],
        [5 /* TokenType.type */, vscode_languageserver_1.SemanticTokenTypes.type],
        [6 /* TokenType.parameter */, vscode_languageserver_1.SemanticTokenTypes.parameter],
        [7 /* TokenType.variable */, vscode_languageserver_1.SemanticTokenTypes.variable],
        [8 /* TokenType.enumMember */, vscode_languageserver_1.SemanticTokenTypes.enumMember],
        [9 /* TokenType.property */, vscode_languageserver_1.SemanticTokenTypes.property],
        [10 /* TokenType.function */, vscode_languageserver_1.SemanticTokenTypes.function],
        [11 /* TokenType.method */, vscode_languageserver_1.SemanticTokenTypes.method],
    ].forEach(([tokenType, legend]) => (tokenTypes[tokenType] = legend));
    return {
        tokenModifiers,
        tokenTypes,
    };
}
exports.getSemanticTokenLegend = getSemanticTokenLegend;
function symbolKindFromString(kind) {
    switch (kind) {
        case 'module':
            return vscode_languageserver_1.SymbolKind.Module;
        case 'class':
            return vscode_languageserver_1.SymbolKind.Class;
        case 'local class':
            return vscode_languageserver_1.SymbolKind.Class;
        case 'interface':
            return vscode_languageserver_1.SymbolKind.Interface;
        case 'enum':
            return vscode_languageserver_1.SymbolKind.Enum;
        case 'enum member':
            return vscode_languageserver_1.SymbolKind.Constant;
        case 'var':
            return vscode_languageserver_1.SymbolKind.Variable;
        case 'local var':
            return vscode_languageserver_1.SymbolKind.Variable;
        case 'function':
            return vscode_languageserver_1.SymbolKind.Function;
        case 'local function':
            return vscode_languageserver_1.SymbolKind.Function;
        case 'method':
            return vscode_languageserver_1.SymbolKind.Method;
        case 'getter':
            return vscode_languageserver_1.SymbolKind.Method;
        case 'setter':
            return vscode_languageserver_1.SymbolKind.Method;
        case 'property':
            return vscode_languageserver_1.SymbolKind.Property;
        case 'constructor':
            return vscode_languageserver_1.SymbolKind.Constructor;
        case 'parameter':
            return vscode_languageserver_1.SymbolKind.Variable;
        case 'type parameter':
            return vscode_languageserver_1.SymbolKind.Variable;
        case 'alias':
            return vscode_languageserver_1.SymbolKind.Variable;
        case 'let':
            return vscode_languageserver_1.SymbolKind.Variable;
        case 'const':
            return vscode_languageserver_1.SymbolKind.Constant;
        case 'JSX attribute':
            return vscode_languageserver_1.SymbolKind.Property;
        default:
            return vscode_languageserver_1.SymbolKind.Variable;
    }
}
exports.symbolKindFromString = symbolKindFromString;
function scriptElementKindToCompletionItemKind(kind, ts) {
    switch (kind) {
        case ts.ScriptElementKind.primitiveType:
        case ts.ScriptElementKind.keyword:
            return vscode_languageserver_1.CompletionItemKind.Keyword;
        case ts.ScriptElementKind.constElement:
            return vscode_languageserver_1.CompletionItemKind.Constant;
        case ts.ScriptElementKind.letElement:
        case ts.ScriptElementKind.variableElement:
        case ts.ScriptElementKind.localVariableElement:
        case ts.ScriptElementKind.alias:
            return vscode_languageserver_1.CompletionItemKind.Variable;
        case ts.ScriptElementKind.memberVariableElement:
        case ts.ScriptElementKind.memberGetAccessorElement:
        case ts.ScriptElementKind.memberSetAccessorElement:
            return vscode_languageserver_1.CompletionItemKind.Field;
        case ts.ScriptElementKind.functionElement:
            return vscode_languageserver_1.CompletionItemKind.Function;
        case ts.ScriptElementKind.memberFunctionElement:
        case ts.ScriptElementKind.constructSignatureElement:
        case ts.ScriptElementKind.callSignatureElement:
        case ts.ScriptElementKind.indexSignatureElement:
            return vscode_languageserver_1.CompletionItemKind.Method;
        case ts.ScriptElementKind.enumElement:
            return vscode_languageserver_1.CompletionItemKind.Enum;
        case ts.ScriptElementKind.moduleElement:
        case ts.ScriptElementKind.externalModuleName:
            return vscode_languageserver_1.CompletionItemKind.Module;
        case ts.ScriptElementKind.classElement:
        case ts.ScriptElementKind.typeElement:
            return vscode_languageserver_1.CompletionItemKind.Class;
        case ts.ScriptElementKind.interfaceElement:
            return vscode_languageserver_1.CompletionItemKind.Interface;
        case ts.ScriptElementKind.warning:
        case ts.ScriptElementKind.scriptElement:
            return vscode_languageserver_1.CompletionItemKind.File;
        case ts.ScriptElementKind.directory:
            return vscode_languageserver_1.CompletionItemKind.Folder;
        case ts.ScriptElementKind.string:
            return vscode_languageserver_1.CompletionItemKind.Constant;
    }
    return vscode_languageserver_1.CompletionItemKind.Property;
}
exports.scriptElementKindToCompletionItemKind = scriptElementKindToCompletionItemKind;
function getCommitCharactersForScriptElement(kind, ts) {
    const commitCharacters = [];
    switch (kind) {
        case ts.ScriptElementKind.memberGetAccessorElement:
        case ts.ScriptElementKind.memberSetAccessorElement:
        case ts.ScriptElementKind.constructSignatureElement:
        case ts.ScriptElementKind.callSignatureElement:
        case ts.ScriptElementKind.indexSignatureElement:
        case ts.ScriptElementKind.enumElement:
        case ts.ScriptElementKind.interfaceElement:
            commitCharacters.push('.');
            break;
        case ts.ScriptElementKind.moduleElement:
        case ts.ScriptElementKind.alias:
        case ts.ScriptElementKind.constElement:
        case ts.ScriptElementKind.letElement:
        case ts.ScriptElementKind.variableElement:
        case ts.ScriptElementKind.localVariableElement:
        case ts.ScriptElementKind.memberVariableElement:
        case ts.ScriptElementKind.classElement:
        case ts.ScriptElementKind.functionElement:
        case ts.ScriptElementKind.memberFunctionElement:
            commitCharacters.push('.', ',');
            commitCharacters.push('(');
            break;
    }
    return commitCharacters.length === 0 ? undefined : commitCharacters;
}
exports.getCommitCharactersForScriptElement = getCommitCharactersForScriptElement;
function getExtensionFromScriptKind(kind, ts) {
    switch (kind) {
        case ts.ScriptKind.JSX:
            return ts.Extension.Jsx;
        case ts.ScriptKind.TS:
            return ts.Extension.Ts;
        case ts.ScriptKind.TSX:
            return ts.Extension.Tsx;
        case ts.ScriptKind.JSON:
            return ts.Extension.Json;
        case ts.ScriptKind.JS:
        default:
            return ts.Extension.Js;
    }
}
exports.getExtensionFromScriptKind = getExtensionFromScriptKind;
function findTsConfigPath(fileName, rootUris, ts) {
    const searchDir = (0, path_1.dirname)(fileName);
    const path = ts.findConfigFile(searchDir, ts.sys.fileExists, 'tsconfig.json') ||
        ts.findConfigFile(searchDir, ts.sys.fileExists, 'jsconfig.json') ||
        '';
    // Don't return config files that exceed the current workspace context.
    return !!path && rootUris.some((rootUri) => isSubPath(rootUri, path)) ? path : '';
}
exports.findTsConfigPath = findTsConfigPath;
function isSubPath(uri, possibleSubPath) {
    return (0, utils_1.pathToUrl)(possibleSubPath).startsWith(uri);
}
exports.isSubPath = isSubPath;
function getScriptKindFromFileName(fileName, ts) {
    const ext = fileName.substring(fileName.lastIndexOf('.'));
    switch (ext.toLowerCase()) {
        case ts.Extension.Js:
            return ts.ScriptKind.JS;
        case ts.Extension.Jsx:
            return ts.ScriptKind.JSX;
        case ts.Extension.Ts:
            return ts.ScriptKind.TS;
        case ts.Extension.Tsx:
            return ts.ScriptKind.TSX;
        case ts.Extension.Json:
            return ts.ScriptKind.JSON;
        default:
            return ts.ScriptKind.Unknown;
    }
}
exports.getScriptKindFromFileName = getScriptKindFromFileName;
function convertRange(document, range) {
    return vscode_languageserver_1.Range.create(document.positionAt(range.start || 0), document.positionAt((range.start || 0) + (range.length || 0)));
}
exports.convertRange = convertRange;
function convertToLocationRange(defDoc, textSpan) {
    const range = (0, documents_1.mapRangeToOriginal)(defDoc, convertRange(defDoc, textSpan));
    // Some definition like the svelte component class definition don't exist in the original, so we map to 0,1
    if (range.start.line < 0) {
        range.start.line = 0;
        range.start.character = 1;
    }
    if (range.end.line < 0) {
        range.end = range.start;
    }
    return range;
}
exports.convertToLocationRange = convertToLocationRange;
// Some code actions will insert code at the start of the file instead of inside our frontmatter
// We'll redirect those to the proper starting place
function ensureFrontmatterInsert(resultRange, document) {
    if (document.astroMeta.frontmatter.state === 'closed') {
        const position = document.positionAt(document.astroMeta.frontmatter.startOffset);
        position.line += 1;
        position.character = resultRange.start.character;
        return vscode_languageserver_1.Range.create(position, position);
    }
    return resultRange;
}
exports.ensureFrontmatterInsert = ensureFrontmatterInsert;
// Some code actions ill insert code at the end of the generated TSX file, so we'll manually
// redirect it to the end of the frontmatter instead
function checkEndOfFileCodeInsert(resultRange, document) {
    if (resultRange.start.line > document.lineCount) {
        if (document.astroMeta.frontmatter.state === 'closed') {
            const position = document.positionAt(document.astroMeta.frontmatter.endOffset);
            return vscode_languageserver_1.Range.create(position, position);
        }
    }
    return resultRange;
}
exports.checkEndOfFileCodeInsert = checkEndOfFileCodeInsert;
function removeAstroComponentSuffix(name) {
    return name.replace(/(\w+)__AstroComponent_/, '$1');
}
exports.removeAstroComponentSuffix = removeAstroComponentSuffix;
const VirtualExtension = {
    ts: 'ts',
    tsx: 'tsx',
};
function getFrameworkFromFilePath(filePath) {
    filePath = ensureRealFilePath(filePath);
    return (0, path_1.extname)(filePath).substring(1);
}
exports.getFrameworkFromFilePath = getFrameworkFromFilePath;
function isVirtualFrameworkFilePath(ext, virtualExt, filePath) {
    return filePath.endsWith('.' + ext + '.' + virtualExt);
}
exports.isVirtualFrameworkFilePath = isVirtualFrameworkFilePath;
function isAstroFilePath(filePath) {
    return filePath.endsWith('.astro');
}
exports.isAstroFilePath = isAstroFilePath;
function isFrameworkFilePath(filePath) {
    return filePath.endsWith('.svelte') || filePath.endsWith('.vue');
}
exports.isFrameworkFilePath = isFrameworkFilePath;
function isVirtualAstroFilePath(filePath) {
    return isVirtualFrameworkFilePath('astro', VirtualExtension.tsx, filePath);
}
exports.isVirtualAstroFilePath = isVirtualAstroFilePath;
function isVirtualVueFilePath(filePath) {
    return isVirtualFrameworkFilePath('vue', VirtualExtension.tsx, filePath);
}
exports.isVirtualVueFilePath = isVirtualVueFilePath;
function isVirtualSvelteFilePath(filePath) {
    return isVirtualFrameworkFilePath('svelte', VirtualExtension.tsx, filePath);
}
exports.isVirtualSvelteFilePath = isVirtualSvelteFilePath;
function isVirtualFilePath(filePath) {
    return isVirtualAstroFilePath(filePath) || isVirtualVueFilePath(filePath) || isVirtualSvelteFilePath(filePath);
}
exports.isVirtualFilePath = isVirtualFilePath;
function toVirtualAstroFilePath(filePath) {
    if (isVirtualAstroFilePath(filePath)) {
        return filePath;
    }
    else if (isAstroFilePath(filePath)) {
        return `${filePath}.tsx`;
    }
    else {
        return filePath;
    }
}
exports.toVirtualAstroFilePath = toVirtualAstroFilePath;
function toVirtualFilePath(filePath) {
    if (isVirtualFilePath(filePath)) {
        return filePath;
    }
    else if (isFrameworkFilePath(filePath) || isAstroFilePath(filePath)) {
        return `${filePath}.tsx`;
    }
    else {
        return filePath;
    }
}
exports.toVirtualFilePath = toVirtualFilePath;
function toRealAstroFilePath(filePath) {
    return filePath.slice(0, -'.tsx'.length);
}
exports.toRealAstroFilePath = toRealAstroFilePath;
function ensureRealAstroFilePath(filePath) {
    return isVirtualAstroFilePath(filePath) ? toRealAstroFilePath(filePath) : filePath;
}
exports.ensureRealAstroFilePath = ensureRealAstroFilePath;
function ensureRealFilePath(filePath) {
    // For Document Symbols, we need to return a different snapshot, so we append a query param to the file path
    // However, we need this removed when we need to deal with real (as in, real on the filesystem) paths
    filePath = filePath.replace('?documentSymbols', '');
    if (isVirtualFilePath(filePath)) {
        let extLen = filePath.endsWith('.tsx') ? 4 : 3;
        return filePath.slice(0, filePath.length - extLen);
    }
    else {
        return filePath;
    }
}
exports.ensureRealFilePath = ensureRealFilePath;
function isDocumentSymbolsPath(filePath) {
    return filePath.endsWith('?documentSymbols');
}
exports.isDocumentSymbolsPath = isDocumentSymbolsPath;
/**
 * Return if a script tag is TypeScript or JavaScript
 */
function getScriptTagLanguage(scriptTag) {
    // Using any kind of attributes on the script tag will disable hoisting, so we can just check if there's any
    if (Object.entries(scriptTag.attributes).length === 0) {
        return 'ts';
    }
    return 'js';
}
exports.getScriptTagLanguage = getScriptTagLanguage;
function getScriptTagSnapshot(snapshot, document, tagInfo, position) {
    const index = document.scriptTags.findIndex((value) => value.container.start == tagInfo.start);
    const scriptTagLanguage = getScriptTagLanguage(document.scriptTags[index]);
    const scriptFilePath = snapshot.filePath + `.__script${index}.${scriptTagLanguage}`;
    const scriptTagSnapshot = snapshot.scriptTagSnapshots[index];
    let offset = 0;
    if (position) {
        offset = scriptTagSnapshot.offsetAt(scriptTagSnapshot.getGeneratedPosition(position));
    }
    return {
        snapshot: scriptTagSnapshot,
        filePath: scriptFilePath,
        index,
        offset,
    };
}
exports.getScriptTagSnapshot = getScriptTagSnapshot;
