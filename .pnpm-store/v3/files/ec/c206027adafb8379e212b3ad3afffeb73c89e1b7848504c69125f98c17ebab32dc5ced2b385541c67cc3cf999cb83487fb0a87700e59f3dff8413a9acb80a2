"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeBasedFileHasher = void 0;
const tslib_1 = require("tslib");
const workspace_root_1 = require("../utils/workspace-root");
const perf_hooks_1 = require("perf_hooks");
const path_1 = require("path");
const fs_1 = require("fs");
const file_hasher_base_1 = require("./file-hasher-base");
const strip_indents_1 = require("../utils/strip-indents");
const ignore_1 = require("ignore");
const path_2 = require("../utils/path");
class NodeBasedFileHasher extends file_hasher_base_1.FileHasherBase {
    constructor() {
        super(...arguments);
        this.ignoredGlobs = getIgnoredGlobs();
    }
    init() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            perf_hooks_1.performance.mark('init hashing:start');
            this.clear();
            this.allFilesInDir(workspace_root_1.workspaceRoot, true);
            perf_hooks_1.performance.mark('init hashing:end');
            perf_hooks_1.performance.measure('init hashing', 'init hashing:start', 'init hashing:end');
        });
    }
    hashFiles(files) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const r = new Map();
            for (let f of files) {
                r.set(f, this.hashFile(f));
            }
            return r;
        });
    }
    allFilesInDir(absoluteDirName, recurse = true) {
        const relDirName = (0, path_1.relative)(workspace_root_1.workspaceRoot, absoluteDirName);
        if (relDirName && this.ignoredGlobs.ignores(relDirName)) {
            return;
        }
        try {
            (0, fs_1.readdirSync)(absoluteDirName).forEach((c) => {
                const absoluteChild = (0, path_1.join)(absoluteDirName, c);
                const relChild = (0, path_1.relative)(workspace_root_1.workspaceRoot, absoluteChild);
                if (this.ignoredGlobs.ignores(relChild)) {
                    return;
                }
                try {
                    const s = (0, fs_1.statSync)(absoluteChild);
                    if (s.isFile()) {
                        this.fileHashes.set((0, path_2.normalizePath)(relChild), this.hashFile(relChild));
                    }
                    else if (s.isDirectory() && recurse) {
                        this.allFilesInDir(absoluteChild, true);
                    }
                }
                catch (_a) { }
            });
        }
        catch (_a) { }
    }
}
exports.NodeBasedFileHasher = NodeBasedFileHasher;
function getIgnoredGlobs() {
    const ig = (0, ignore_1.default)();
    ig.add(readFileIfExisting(`${workspace_root_1.workspaceRoot}/.gitignore`));
    ig.add(readFileIfExisting(`${workspace_root_1.workspaceRoot}/.nxignore`));
    ig.add((0, strip_indents_1.stripIndents) `
      node_modules
      tmp
      dist
      build    
    `);
    return ig;
}
function readFileIfExisting(path) {
    return (0, fs_1.existsSync)(path) ? (0, fs_1.readFileSync)(path, 'utf-8') : '';
}
//# sourceMappingURL=node-based-file-hasher.js.map