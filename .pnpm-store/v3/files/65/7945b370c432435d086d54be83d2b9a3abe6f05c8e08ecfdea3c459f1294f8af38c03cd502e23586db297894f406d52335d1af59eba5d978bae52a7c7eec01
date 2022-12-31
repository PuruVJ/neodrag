"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectGraphCacheDirectory = exports.cacheDir = void 0;
const path_1 = require("path");
const fileutils_1 = require("./fileutils");
const workspace_root_1 = require("./workspace-root");
function readCacheDirectoryProperty(root) {
    try {
        const nxJson = (0, fileutils_1.readJsonFile)((0, path_1.join)(root, 'nx.json'));
        return nxJson.tasksRunnerOptions.default.options.cacheDirectory;
    }
    catch (_a) {
        return undefined;
    }
}
function absolutePath(root, path) {
    if ((0, path_1.isAbsolute)(path)) {
        return path;
    }
    else {
        return (0, path_1.join)(root, path);
    }
}
function cacheDirectory(root, cacheDirectory) {
    const cacheDirFromEnv = process.env.NX_CACHE_DIRECTORY;
    if (cacheDirFromEnv) {
        cacheDirectory = cacheDirFromEnv;
    }
    if (cacheDirectory) {
        return absolutePath(root, cacheDirectory);
    }
    else {
        return (0, path_1.join)(root, 'node_modules', '.cache', 'nx');
    }
}
/**
 * Path to the directory where Nx stores its cache and daemon-related files.
 */
exports.cacheDir = cacheDirectory(workspace_root_1.workspaceRoot, readCacheDirectoryProperty(workspace_root_1.workspaceRoot));
exports.projectGraphCacheDirectory = absolutePath(workspace_root_1.workspaceRoot, (_a = process.env.NX_PROJECT_GRAPH_CACHE_DIRECTORY) !== null && _a !== void 0 ? _a : (0, path_1.join)(workspace_root_1.workspaceRoot, 'node_modules', '.cache', 'nx'));
//# sourceMappingURL=cache-directory.js.map