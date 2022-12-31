"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImportPath = exports.detectWorkspaceScope = exports.joinPathFragments = exports.normalizePath = void 0;
const path = require("path");
function removeWindowsDriveLetter(osSpecificPath) {
    return osSpecificPath.replace(/^[A-Z]:/, '');
}
/**
 * Coverts an os specific path to a unix style path
 */
function normalizePath(osSpecificPath) {
    return removeWindowsDriveLetter(osSpecificPath).split('\\').join('/');
}
exports.normalizePath = normalizePath;
/**
 * Normalized path fragments and joins them
 */
function joinPathFragments(...fragments) {
    return normalizePath(path.join(...fragments));
}
exports.joinPathFragments = joinPathFragments;
/**
 * Detect workspace scope from the package.json name
 * @param packageName
 * @returns
 */
function detectWorkspaceScope(packageName) {
    return (packageName === null || packageName === void 0 ? void 0 : packageName.startsWith('@'))
        ? packageName.substring(1).split('/')[0]
        : '';
}
exports.detectWorkspaceScope = detectWorkspaceScope;
/**
 * Prefixes project name with npm scope
 */
function getImportPath(npmScope, projectDirectory) {
    return npmScope ? `@${npmScope}/${projectDirectory}` : projectDirectory;
}
exports.getImportPath = getImportPath;
//# sourceMappingURL=path.js.map