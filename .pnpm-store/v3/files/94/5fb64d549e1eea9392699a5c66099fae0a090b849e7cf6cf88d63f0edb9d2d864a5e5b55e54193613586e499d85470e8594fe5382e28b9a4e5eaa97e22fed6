"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNodes = exports.getRootTsConfigPath = exports.getRootTsConfigFileName = exports.resolveModuleByImport = exports.readTsConfig = void 0;
const workspace_root_1 = require("./workspace-root");
const fs_1 = require("fs");
const path_1 = require("path");
const normalizedAppRoot = workspace_root_1.workspaceRoot.replace(/\\/g, '/');
let tsModule;
function readTsConfig(tsConfigPath) {
    if (!tsModule) {
        tsModule = require('typescript');
    }
    const readResult = tsModule.readConfigFile(tsConfigPath, tsModule.sys.readFile);
    return tsModule.parseJsonConfigFileContent(readResult.config, tsModule.sys, (0, path_1.dirname)(tsConfigPath));
}
exports.readTsConfig = readTsConfig;
function readTsConfigOptions(tsConfigPath) {
    if (!tsModule) {
        tsModule = require('typescript');
    }
    const readResult = tsModule.readConfigFile(tsConfigPath, tsModule.sys.readFile);
    // we don't need to scan the files, we only care about options
    const host = {
        readDirectory: () => [],
        fileExists: tsModule.sys.fileExists,
    };
    return tsModule.parseJsonConfigFileContent(readResult.config, host, (0, path_1.dirname)(tsConfigPath)).options;
}
let compilerHost;
/**
 * Find a module based on it's import
 *
 * @param importExpr Import used to resolve to a module
 * @param filePath
 * @param tsConfigPath
 */
function resolveModuleByImport(importExpr, filePath, tsConfigPath) {
    compilerHost = compilerHost || getCompilerHost(tsConfigPath);
    const { options, host, moduleResolutionCache } = compilerHost;
    const { resolvedModule } = tsModule.resolveModuleName(importExpr, filePath, options, host, moduleResolutionCache);
    if (!resolvedModule) {
        return;
    }
    else {
        return resolvedModule.resolvedFileName.replace(`${normalizedAppRoot}/`, '');
    }
}
exports.resolveModuleByImport = resolveModuleByImport;
function getCompilerHost(tsConfigPath) {
    const options = readTsConfigOptions(tsConfigPath);
    const host = tsModule.createCompilerHost(options, true);
    const moduleResolutionCache = tsModule.createModuleResolutionCache(workspace_root_1.workspaceRoot, host.getCanonicalFileName);
    return { options, host, moduleResolutionCache };
}
function getRootTsConfigFileName() {
    for (const tsConfigName of ['tsconfig.base.json', 'tsconfig.json']) {
        const tsConfigPath = (0, path_1.join)(workspace_root_1.workspaceRoot, tsConfigName);
        if ((0, fs_1.existsSync)(tsConfigPath)) {
            return tsConfigName;
        }
    }
    return null;
}
exports.getRootTsConfigFileName = getRootTsConfigFileName;
function getRootTsConfigPath() {
    const tsConfigFileName = getRootTsConfigFileName();
    return tsConfigFileName ? (0, path_1.join)(workspace_root_1.workspaceRoot, tsConfigFileName) : null;
}
exports.getRootTsConfigPath = getRootTsConfigPath;
function findNodes(node, kind, max = Infinity) {
    if (!node || max == 0) {
        return [];
    }
    const arr = [];
    const hasMatch = Array.isArray(kind)
        ? kind.includes(node.kind)
        : node.kind === kind;
    if (hasMatch) {
        arr.push(node);
        max--;
    }
    if (max > 0) {
        for (const child of node.getChildren()) {
            findNodes(child, kind, max).forEach((node) => {
                if (max > 0) {
                    arr.push(node);
                }
                max--;
            });
            if (max <= 0) {
                break;
            }
        }
    }
    return arr;
}
exports.findNodes = findNodes;
//# sourceMappingURL=typescript.js.map