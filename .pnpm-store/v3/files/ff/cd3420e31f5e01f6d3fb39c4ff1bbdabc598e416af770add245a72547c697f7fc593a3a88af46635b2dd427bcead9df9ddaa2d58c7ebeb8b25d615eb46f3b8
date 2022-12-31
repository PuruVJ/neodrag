"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceRootInner = exports.workspaceRoot = void 0;
const path = require("path");
const fileutils_1 = require("./fileutils");
/**
 * The root of the workspace
 */
exports.workspaceRoot = workspaceRootInner(process.cwd(), process.cwd());
function workspaceRootInner(dir, candidateRoot) {
    if (process.env.NX_WORKSPACE_ROOT_PATH)
        return process.env.NX_WORKSPACE_ROOT_PATH;
    if (path.dirname(dir) === dir)
        return candidateRoot;
    if ((0, fileutils_1.fileExists)(path.join(dir, 'nx.json'))) {
        return dir;
    }
    else if ((0, fileutils_1.fileExists)(path.join(dir, 'node_modules', 'nx', 'package.json'))) {
        return workspaceRootInner(path.dirname(dir), dir);
    }
    else {
        return workspaceRootInner(path.dirname(dir), candidateRoot);
    }
}
exports.workspaceRootInner = workspaceRootInner;
//# sourceMappingURL=workspace-root.js.map