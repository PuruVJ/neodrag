"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrettierPluginPath = exports.importPrettier = exports.importVueIntegration = exports.importSvelteIntegration = exports.getPackagePath = exports.setIsTrusted = void 0;
const path_1 = require("path");
let isTrusted = true;
function setIsTrusted(_isTrusted) {
    isTrusted = _isTrusted;
}
exports.setIsTrusted = setIsTrusted;
function getPackagePath(packageName, fromPath) {
    const paths = [];
    if (isTrusted) {
        paths.unshift(...fromPath);
    }
    try {
        return (0, path_1.dirname)(require.resolve(packageName + '/package.json', { paths }));
    }
    catch (e) {
        return undefined;
    }
}
exports.getPackagePath = getPackagePath;
function importEditorIntegration(packageName, fromPath) {
    const pkgPath = getPackagePath(packageName, [fromPath]);
    if (pkgPath) {
        try {
            const main = (0, path_1.resolve)(pkgPath, 'dist', 'editor.cjs');
            return require(main);
        }
        catch (e) {
            console.error(`Couldn't load editor module from ${pkgPath}. Make sure you're using at least version v0.2.1 of the corresponding integration`);
            return undefined;
        }
    }
    return undefined;
}
function importSvelteIntegration(fromPath) {
    return importEditorIntegration('@astrojs/svelte', fromPath);
}
exports.importSvelteIntegration = importSvelteIntegration;
function importVueIntegration(fromPath) {
    return importEditorIntegration('@astrojs/vue', fromPath);
}
exports.importVueIntegration = importVueIntegration;
function importPrettier(fromPath) {
    // This shouldn't ever fail, because we bundle Prettier in the extension itself
    const prettierPkg = getPackagePath('prettier', [fromPath, __dirname]);
    return require(prettierPkg);
}
exports.importPrettier = importPrettier;
function getPrettierPluginPath(fromPath) {
    return getPackagePath('prettier-plugin-astro', [fromPath, __dirname]);
}
exports.getPrettierPluginPath = getPrettierPluginPath;
