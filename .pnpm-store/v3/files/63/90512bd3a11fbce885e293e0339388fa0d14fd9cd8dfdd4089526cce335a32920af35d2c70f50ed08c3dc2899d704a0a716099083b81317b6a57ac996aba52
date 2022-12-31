"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileHasherBase = void 0;
const tslib_1 = require("tslib");
const workspace_root_1 = require("../utils/workspace-root");
const perf_hooks_1 = require("perf_hooks");
const hashing_impl_1 = require("./hashing-impl");
const path_1 = require("../utils/path");
class FileHasherBase {
    constructor() {
        this.isInitialized = false;
    }
    clear() {
        this.fileHashes = new Map();
        this.isInitialized = false;
    }
    ensureInitialized() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.isInitialized) {
                yield this.init();
            }
        });
    }
    allFileData() {
        const res = [];
        this.fileHashes.forEach((hash, file) => {
            res.push({
                file,
                hash,
            });
        });
        res.sort((x, y) => x.file.localeCompare(y.file));
        return res;
    }
    incrementalUpdate(updatedFiles, deletedFiles = []) {
        perf_hooks_1.performance.mark('incremental hashing:start');
        updatedFiles.forEach((hash, filename) => {
            this.fileHashes.set(filename, hash);
        });
        for (const deletedFile of deletedFiles) {
            this.fileHashes.delete(deletedFile);
        }
        perf_hooks_1.performance.mark('incremental hashing:end');
        perf_hooks_1.performance.measure('incremental hashing', 'incremental hashing:start', 'incremental hashing:end');
    }
    hashFile(path) {
        if (!this.fileHashes) {
            throw new Error('FileHasher is invoked before being initialized');
        }
        const relativePath = (0, path_1.normalizePath)(path.startsWith(workspace_root_1.workspaceRoot)
            ? path.slice(workspace_root_1.workspaceRoot.length + 1)
            : path);
        try {
            // this has to be absolute to avoid issues with cwd
            return hashing_impl_1.defaultHashing.hashFile((0, path_1.joinPathFragments)(workspace_root_1.workspaceRoot, relativePath));
        }
        catch (_a) {
            return '';
        }
    }
}
exports.FileHasherBase = FileHasherBase;
//# sourceMappingURL=file-hasher-base.js.map