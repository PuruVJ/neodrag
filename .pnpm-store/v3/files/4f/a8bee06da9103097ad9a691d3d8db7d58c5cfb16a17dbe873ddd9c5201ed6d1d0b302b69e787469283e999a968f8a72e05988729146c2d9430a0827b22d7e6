"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLockFile = exports.getLockFileName = exports.writeLockFile = exports.mapLockFileDataToPartialGraph = exports.parseLockFile = exports.lockFileHash = exports.lockFileExists = void 0;
const fs_extra_1 = require("fs-extra");
const package_manager_1 = require("../utils/package-manager");
const yarn_1 = require("./yarn");
const npm_1 = require("./npm");
const pnpm_1 = require("./pnpm");
const workspace_root_1 = require("../utils/workspace-root");
const path_1 = require("path");
const mapping_1 = require("./utils/mapping");
const hashing_1 = require("./utils/hashing");
const fs_1 = require("fs");
const pruning_1 = require("./utils/pruning");
const YARN_LOCK_FILE = 'yarn.lock';
const NPM_LOCK_FILE = 'package-lock.json';
const PNPM_LOCK_FILE = 'pnpm-lock.yaml';
const YARN_LOCK_PATH = (0, path_1.join)(workspace_root_1.workspaceRoot, YARN_LOCK_FILE);
const NPM_LOCK_PATH = (0, path_1.join)(workspace_root_1.workspaceRoot, NPM_LOCK_FILE);
const PNPM_LOCK_PATH = (0, path_1.join)(workspace_root_1.workspaceRoot, PNPM_LOCK_FILE);
/**
 * Check if lock file exists
 */
function lockFileExists(packageManager = (0, package_manager_1.detectPackageManager)(workspace_root_1.workspaceRoot)) {
    if (packageManager === 'yarn') {
        return (0, fs_1.existsSync)(YARN_LOCK_PATH);
    }
    if (packageManager === 'pnpm') {
        return (0, fs_1.existsSync)(PNPM_LOCK_PATH);
    }
    if (packageManager === 'npm') {
        return (0, fs_1.existsSync)(NPM_LOCK_PATH);
    }
    throw Error(`Unknown package manager ${packageManager} or lock file missing`);
}
exports.lockFileExists = lockFileExists;
/**
 * Hashes lock file content
 */
function lockFileHash(packageManager = (0, package_manager_1.detectPackageManager)(workspace_root_1.workspaceRoot)) {
    let file;
    if (packageManager === 'yarn') {
        file = (0, fs_extra_1.readFileSync)(YARN_LOCK_PATH, 'utf8');
    }
    if (packageManager === 'pnpm') {
        file = (0, fs_extra_1.readFileSync)(PNPM_LOCK_PATH, 'utf8');
    }
    if (packageManager === 'npm') {
        file = (0, fs_extra_1.readFileSync)(NPM_LOCK_PATH, 'utf8');
    }
    if (file) {
        return (0, hashing_1.hashString)(file);
    }
    else {
        throw Error(`Unknown package manager ${packageManager} or lock file missing`);
    }
}
exports.lockFileHash = lockFileHash;
/**
 * Parses lock file and maps dependencies and metadata to {@link LockFileData}
 */
function parseLockFile(packageManager = (0, package_manager_1.detectPackageManager)(workspace_root_1.workspaceRoot)) {
    if (packageManager === 'yarn') {
        const file = (0, fs_extra_1.readFileSync)(YARN_LOCK_PATH, 'utf8');
        return (0, yarn_1.parseYarnLockFile)(file);
    }
    if (packageManager === 'pnpm') {
        const file = (0, fs_extra_1.readFileSync)(PNPM_LOCK_PATH, 'utf8');
        return (0, pnpm_1.parsePnpmLockFile)(file);
    }
    if (packageManager === 'npm') {
        const file = (0, fs_extra_1.readFileSync)(NPM_LOCK_PATH, 'utf8');
        return (0, npm_1.parseNpmLockFile)(file);
    }
    throw Error(`Unknown package manager: ${packageManager}`);
}
exports.parseLockFile = parseLockFile;
/**
 * Maps lock file data to {@link ProjectGraphExternalNode} hash map
 * @param lockFileData
 * @returns
 */
function mapLockFileDataToPartialGraph(lockFileData, packageManager = (0, package_manager_1.detectPackageManager)(workspace_root_1.workspaceRoot)) {
    let externalNodes;
    if (packageManager === 'yarn') {
        externalNodes = (0, mapping_1.mapExternalNodes)(lockFileData, yarn_1.transitiveDependencyYarnLookup);
    }
    if (packageManager === 'pnpm') {
        externalNodes = (0, mapping_1.mapExternalNodes)(lockFileData, pnpm_1.transitiveDependencyPnpmLookup);
    }
    if (packageManager === 'npm') {
        externalNodes = (0, mapping_1.mapExternalNodes)(lockFileData, npm_1.transitiveDependencyNpmLookup);
    }
    if (externalNodes) {
        (0, hashing_1.hashExternalNodes)(externalNodes);
        return externalNodes;
    }
    throw Error(`Unknown package manager: ${packageManager}`);
}
exports.mapLockFileDataToPartialGraph = mapLockFileDataToPartialGraph;
/**
 * Stringifies {@link LockFileData} content and writes it to lock file
 */
function writeLockFile(lockFile, packageManager = (0, package_manager_1.detectPackageManager)(workspace_root_1.workspaceRoot)) {
    if (packageManager === 'yarn') {
        const content = (0, yarn_1.stringifyYarnLockFile)(lockFile);
        (0, fs_extra_1.writeFileSync)(YARN_LOCK_PATH, content);
        return;
    }
    if (packageManager === 'pnpm') {
        const content = (0, pnpm_1.stringifyPnpmLockFile)(lockFile);
        (0, fs_extra_1.writeFileSync)(PNPM_LOCK_PATH, content);
        return;
    }
    if (packageManager === 'npm') {
        const content = (0, npm_1.stringifyNpmLockFile)(lockFile);
        (0, fs_extra_1.writeFileSync)(NPM_LOCK_PATH, content);
        return;
    }
    throw Error(`Unknown package manager: ${packageManager}`);
}
exports.writeLockFile = writeLockFile;
function getLockFileName(packageManager = (0, package_manager_1.detectPackageManager)(workspace_root_1.workspaceRoot)) {
    if (packageManager === 'yarn') {
        return YARN_LOCK_FILE;
    }
    if (packageManager === 'pnpm') {
        return PNPM_LOCK_FILE;
    }
    if (packageManager === 'npm') {
        return NPM_LOCK_FILE;
    }
    throw Error(`Unknown package manager: ${packageManager}`);
}
exports.getLockFileName = getLockFileName;
/**
 * Create lock file based on the root level lock file and (pruned) package.json
 *
 * @param packageJson
 * @param isProduction
 * @param packageManager
 * @returns
 */
function createLockFile(packageJson, packageManager = (0, package_manager_1.detectPackageManager)(workspace_root_1.workspaceRoot)) {
    const lockFileData = parseLockFile(packageManager);
    const normalizedPackageJson = (0, pruning_1.normalizePackageJson)(packageJson);
    if (packageManager === 'yarn') {
        const prunedData = (0, yarn_1.pruneYarnLockFile)(lockFileData, normalizedPackageJson);
        return (0, yarn_1.stringifyYarnLockFile)(prunedData);
    }
    if (packageManager === 'pnpm') {
        const prunedData = (0, pnpm_1.prunePnpmLockFile)(lockFileData, normalizedPackageJson);
        return (0, pnpm_1.stringifyPnpmLockFile)(prunedData);
    }
    if (packageManager === 'npm') {
        const prunedData = (0, npm_1.pruneNpmLockFile)(lockFileData, normalizedPackageJson);
        return (0, npm_1.stringifyNpmLockFile)(prunedData);
    }
    throw Error(`Unknown package manager: ${packageManager}`);
}
exports.createLockFile = createLockFile;
//# sourceMappingURL=lock-file.js.map