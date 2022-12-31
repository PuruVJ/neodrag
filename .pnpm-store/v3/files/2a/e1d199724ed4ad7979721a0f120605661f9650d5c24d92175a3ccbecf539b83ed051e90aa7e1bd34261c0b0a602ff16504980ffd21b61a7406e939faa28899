"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.classNameFromFilename = exports.createFromFrameworkFilePath = exports.createFromAstroFilePath = exports.createFromTSFilePath = exports.createFromNonAstroFilePath = exports.createFromFilePath = exports.createFromDocument = void 0;
const vscode_uri_1 = require("vscode-uri");
const importPackage_1 = require("../../../importPackage");
const utils_1 = require("../../../utils");
const astro2tsx_1 = __importDefault(require("../astro2tsx"));
const utils_2 = require("../utils");
const DocumentSnapshot_1 = require("./DocumentSnapshot");
// Utilities to create Snapshots from different contexts
function createFromDocument(document, ts) {
    const { code } = (0, astro2tsx_1.default)(document.getText(), classNameFromFilename(document.getURL()));
    return new DocumentSnapshot_1.AstroSnapshot(document, code, ts.ScriptKind.TSX);
}
exports.createFromDocument = createFromDocument;
/**
 * Returns an Astro or Framework or a ts/js snapshot from a file path, depending on the file contents.
 * @param filePath path to the file
 * @param createDocument function that is used to create a document in case it's an Astro file
 */
function createFromFilePath(filePath, createDocument, ts) {
    if ((0, utils_2.isAstroFilePath)(filePath)) {
        return createFromAstroFilePath(filePath, createDocument, ts);
    }
    else if ((0, utils_2.isFrameworkFilePath)(filePath)) {
        const framework = (0, utils_2.getFrameworkFromFilePath)(filePath);
        return createFromFrameworkFilePath(filePath, framework, ts);
    }
    else {
        return createFromTSFilePath(filePath, ts);
    }
}
exports.createFromFilePath = createFromFilePath;
/**
 * Return a Framework or a TS snapshot from a file path, depending on the file contents
 * Unlike createFromFilePath, this does not support creating an Astro snapshot
 */
function createFromNonAstroFilePath(filePath, ts, forceText) {
    if ((0, utils_2.isFrameworkFilePath)(filePath)) {
        const framework = (0, utils_2.getFrameworkFromFilePath)(filePath);
        return createFromFrameworkFilePath(filePath, framework, ts, forceText);
    }
    else {
        return createFromTSFilePath(filePath, ts, forceText);
    }
}
exports.createFromNonAstroFilePath = createFromNonAstroFilePath;
/**
 * Returns a ts/js snapshot from a file path.
 * @param filePath path to the js/ts file
 * @param options options that apply in case it's a svelte file
 */
function createFromTSFilePath(filePath, ts, forceText) {
    const originalText = forceText ?? ts.sys.readFile(filePath) ?? '';
    return new DocumentSnapshot_1.TypeScriptDocumentSnapshot(0, filePath, originalText, (0, utils_2.getScriptKindFromFileName)(filePath, ts), true);
}
exports.createFromTSFilePath = createFromTSFilePath;
/**
 * Returns an Astro snapshot from a file path.
 * @param filePath path to the Astro file
 * @param createDocument function that is used to create a document
 */
function createFromAstroFilePath(filePath, createDocument, ts) {
    const originalText = ts.sys.readFile(filePath) ?? '';
    return createFromDocument(createDocument(filePath, originalText), ts);
}
exports.createFromAstroFilePath = createFromAstroFilePath;
function createFromFrameworkFilePath(filePath, framework, ts, forceText) {
    const className = classNameFromFilename(filePath);
    const originalText = forceText ?? ts.sys.readFile(filePath) ?? '';
    let code = '';
    if (framework === 'svelte') {
        const svelteIntegration = (0, importPackage_1.importSvelteIntegration)(filePath);
        if (svelteIntegration) {
            code = svelteIntegration.toTSX(originalText, className);
        }
    }
    else if (framework === 'vue') {
        const vueIntegration = (0, importPackage_1.importVueIntegration)(filePath);
        if (vueIntegration) {
            code = vueIntegration.toTSX(originalText, className);
        }
    }
    return new DocumentSnapshot_1.TypeScriptDocumentSnapshot(0, filePath, code, ts.ScriptKind.TSX, false);
}
exports.createFromFrameworkFilePath = createFromFrameworkFilePath;
function classNameFromFilename(filename) {
    const url = vscode_uri_1.URI.parse(filename);
    const withoutExtensions = vscode_uri_1.Utils.basename(url).slice(0, -vscode_uri_1.Utils.extname(url).length);
    const withoutInvalidCharacters = withoutExtensions
        .split('')
        // Although "-" is invalid, we leave it in, pascal-case-handling will throw it out later
        .filter((char) => /[A-Za-z$_\d-]/.test(char))
        .join('');
    const firstValidCharIdx = withoutInvalidCharacters
        .split('')
        // Although _ and $ are valid first characters for classes, they are invalid first characters
        // for tag names. For a better import autocompletion experience, we therefore throw them out.
        .findIndex((char) => /[A-Za-z]/.test(char));
    const withoutLeadingInvalidCharacters = withoutInvalidCharacters.substr(firstValidCharIdx);
    const inPascalCase = (0, utils_1.toPascalCase)(withoutLeadingInvalidCharacters);
    const finalName = firstValidCharIdx === -1 ? `A${inPascalCase}` : inPascalCase;
    return finalName;
}
exports.classNameFromFilename = classNameFromFilename;
