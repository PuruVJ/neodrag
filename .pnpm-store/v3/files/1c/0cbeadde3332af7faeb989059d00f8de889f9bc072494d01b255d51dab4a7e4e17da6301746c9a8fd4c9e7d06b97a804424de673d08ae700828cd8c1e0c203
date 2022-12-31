"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readModulePackageJson = exports.readModulePackageJsonWithoutFallbacks = exports.buildTargetFromScript = exports.readNxMigrateConfig = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const fileutils_1 = require("./fileutils");
const workspace_root_1 = require("./workspace-root");
function readNxMigrateConfig(json) {
    const parseNxMigrationsConfig = (fromJson) => {
        if (!fromJson) {
            return {};
        }
        if (typeof fromJson === 'string') {
            return { migrations: fromJson, packageGroup: [] };
        }
        return Object.assign(Object.assign({}, (fromJson.migrations ? { migrations: fromJson.migrations } : {})), (fromJson.packageGroup ? { packageGroup: fromJson.packageGroup } : {}));
    };
    return Object.assign(Object.assign(Object.assign({}, parseNxMigrationsConfig(json['ng-update'])), parseNxMigrationsConfig(json['nx-migrations'])), parseNxMigrationsConfig(json));
}
exports.readNxMigrateConfig = readNxMigrateConfig;
function buildTargetFromScript(script, nx) {
    var _a;
    const nxTargetConfiguration = ((_a = nx === null || nx === void 0 ? void 0 : nx.targets) === null || _a === void 0 ? void 0 : _a[script]) || {};
    return Object.assign(Object.assign({}, nxTargetConfiguration), { executor: 'nx:run-script', options: Object.assign(Object.assign({}, (nxTargetConfiguration.options || {})), { script }) });
}
exports.buildTargetFromScript = buildTargetFromScript;
/**
 * Uses `require.resolve` to read the package.json for a module.
 *
 * This will fail if the module doesn't export package.json
 *
 * @returns package json contents and path
 */
function readModulePackageJsonWithoutFallbacks(moduleSpecifier, requirePaths = [workspace_root_1.workspaceRoot]) {
    const packageJsonPath = require.resolve(`${moduleSpecifier}/package.json`, {
        paths: requirePaths,
    });
    const packageJson = (0, fileutils_1.readJsonFile)(packageJsonPath);
    return {
        path: packageJsonPath,
        packageJson,
    };
}
exports.readModulePackageJsonWithoutFallbacks = readModulePackageJsonWithoutFallbacks;
/**
 * Reads the package.json file for a specified module.
 *
 * Includes a fallback that accounts for modules that don't export package.json
 *
 * @param {string} moduleSpecifier The module to look up
 * @param {string[]} requirePaths List of paths look in. Pass `module.paths` to ensure non-hoisted dependencies are found.
 *
 * @example
 * // Use the caller's lookup paths for non-hoisted dependencies
 * readModulePackageJson('http-server', module.paths);
 *
 * @returns package json contents and path
 */
function readModulePackageJson(moduleSpecifier, requirePaths = [workspace_root_1.workspaceRoot]) {
    let packageJsonPath;
    let packageJson;
    try {
        ({ path: packageJsonPath, packageJson } =
            readModulePackageJsonWithoutFallbacks(moduleSpecifier, requirePaths));
    }
    catch (_a) {
        const entryPoint = require.resolve(moduleSpecifier, {
            paths: requirePaths,
        });
        let moduleRootPath = (0, path_1.dirname)(entryPoint);
        packageJsonPath = (0, path_1.join)(moduleRootPath, 'package.json');
        while (!(0, fs_1.existsSync)(packageJsonPath)) {
            moduleRootPath = (0, path_1.dirname)(moduleRootPath);
            packageJsonPath = (0, path_1.join)(moduleRootPath, 'package.json');
        }
        packageJson = (0, fileutils_1.readJsonFile)(packageJsonPath);
        if (packageJson.name && packageJson.name !== moduleSpecifier) {
            throw new Error(`Found module ${packageJson.name} while trying to locate ${moduleSpecifier}/package.json`);
        }
    }
    return {
        packageJson,
        path: packageJsonPath,
    };
}
exports.readModulePackageJson = readModulePackageJson;
//# sourceMappingURL=package-json.js.map