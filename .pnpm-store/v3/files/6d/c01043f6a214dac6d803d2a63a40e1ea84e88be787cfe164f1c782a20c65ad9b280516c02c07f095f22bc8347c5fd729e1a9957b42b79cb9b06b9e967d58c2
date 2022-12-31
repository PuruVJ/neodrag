"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitBasedFileHasher = void 0;
const tslib_1 = require("tslib");
const workspace_root_1 = require("../utils/workspace-root");
const perf_hooks_1 = require("perf_hooks");
const git_hasher_1 = require("./git-hasher");
const fs_1 = require("fs");
const file_hasher_base_1 = require("./file-hasher-base");
const ignore_1 = require("ignore");
class GitBasedFileHasher extends file_hasher_base_1.FileHasherBase {
    /**
     * For the project graph daemon server use-case we can potentially skip expensive work
     * by leveraging knowledge of the uncommitted and untracked files, so the init() method
     * returns a Map containing this data.
     */
    init() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            perf_hooks_1.performance.mark('init hashing:start');
            this.clear();
            const gitResult = yield (0, git_hasher_1.getFileHashes)(workspace_root_1.workspaceRoot);
            const ignore = getIgnoredGlobs();
            gitResult.allFiles.forEach((hash, filename) => {
                if (!ignore.ignores(filename)) {
                    this.fileHashes.set(filename, hash);
                }
            });
            this.isInitialized = true;
            perf_hooks_1.performance.mark('init hashing:end');
            perf_hooks_1.performance.measure('init hashing', 'init hashing:start', 'init hashing:end');
        });
    }
    hashFiles(files) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (yield (0, git_hasher_1.getGitHashForFiles)(files, workspace_root_1.workspaceRoot)).hashes;
        });
    }
}
exports.GitBasedFileHasher = GitBasedFileHasher;
function getIgnoredGlobs() {
    if ((0, fs_1.existsSync)(`${workspace_root_1.workspaceRoot}/.nxignore`)) {
        const ig = (0, ignore_1.default)();
        ig.add((0, fs_1.readFileSync)(`${workspace_root_1.workspaceRoot}/.nxignore`, 'utf-8'));
        return ig;
    }
    else {
        return { ignores: (file) => false };
    }
}
//# sourceMappingURL=git-based-file-hasher.js.map