"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultFileHasher = void 0;
const git_based_file_hasher_1 = require("./git-based-file-hasher");
const workspace_root_1 = require("../utils/workspace-root");
const node_based_file_hasher_1 = require("./node-based-file-hasher");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
function createFileHasher() {
    // special case for unit tests
    if (workspace_root_1.workspaceRoot === '/root') {
        return new node_based_file_hasher_1.NodeBasedFileHasher();
    }
    try {
        (0, child_process_1.execSync)('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
        // we don't use git based hasher when the repo uses git submodules
        if (!(0, fs_1.existsSync)((0, path_1.join)(workspace_root_1.workspaceRoot, '.git', 'modules'))) {
            return new git_based_file_hasher_1.GitBasedFileHasher();
        }
        else {
            return new node_based_file_hasher_1.NodeBasedFileHasher();
        }
    }
    catch (_a) {
        return new node_based_file_hasher_1.NodeBasedFileHasher();
    }
}
exports.defaultFileHasher = createFileHasher();
//# sourceMappingURL=file-hasher.js.map