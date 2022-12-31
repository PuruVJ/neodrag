"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const tslib_1 = require("tslib");
const workspace_root_1 = require("../utils/workspace-root");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const child_process_1 = require("child_process");
const cache_directory_1 = require("../utils/cache-directory");
const os_1 = require("os");
const fastGlob = require("fast-glob");
class Cache {
    constructor(options) {
        this.options = options;
        this.root = workspace_root_1.workspaceRoot;
        this.cachePath = this.createCacheDir();
        this.terminalOutputsDir = this.createTerminalOutputsDir();
        this.useFsExtraToCopyAndRemove = (0, os_1.platform)() === 'win32';
    }
    removeOldCacheRecords() {
        /**
         * Even though spawning a process is fast, we don't want to do it every time
         * the user runs a command. Instead, we want to do it once in a while.
         */
        const shouldSpawnProcess = Math.floor(Math.random() * 50) === 1;
        if (shouldSpawnProcess) {
            const scriptPath = require.resolve('./remove-old-cache-records.js');
            try {
                const p = (0, child_process_1.spawn)('node', [scriptPath, `"${this.cachePath}"`], {
                    stdio: 'ignore',
                    detached: true,
                });
                p.unref();
            }
            catch (e) {
                console.log(`Unable to start remove-old-cache-records script:`);
                console.log(e.message);
            }
        }
    }
    get(task) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const res = yield this.getFromLocalDir(task);
            if (res) {
                return Object.assign(Object.assign({}, res), { remote: false });
            }
            else if (this.options.remoteCache) {
                // didn't find it locally but we have a remote cache
                // attempt remote cache
                yield this.options.remoteCache.retrieve(task.hash, this.cachePath);
                // try again from local cache
                const res2 = yield this.getFromLocalDir(task);
                return res2 ? Object.assign(Object.assign({}, res2), { remote: true }) : null;
            }
            else {
                return null;
            }
        });
    }
    put(task, terminalOutput, outputs, code) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.tryAndRetry(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const td = (0, path_1.join)(this.cachePath, task.hash);
                const tdCommit = (0, path_1.join)(this.cachePath, `${task.hash}.commit`);
                // might be left overs from partially-completed cache invocations
                yield (0, fs_extra_1.remove)(tdCommit);
                yield this.remove(td);
                yield (0, fs_extra_1.mkdir)(td);
                yield (0, fs_extra_1.writeFile)((0, path_1.join)(td, 'terminalOutput'), terminalOutput !== null && terminalOutput !== void 0 ? terminalOutput : 'no terminal output');
                yield (0, fs_extra_1.mkdir)((0, path_1.join)(td, 'outputs'));
                const expandedOutputs = yield this.expandOutputsInWorkspace(outputs);
                yield Promise.all(expandedOutputs.map((f) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const src = (0, path_1.join)(this.root, f);
                    if (yield (0, fs_extra_1.pathExists)(src)) {
                        const isFile = (yield (0, fs_extra_1.lstat)(src)).isFile();
                        const cached = (0, path_1.join)(td, 'outputs', f);
                        const directory = isFile ? (0, path_1.dirname)(cached) : cached;
                        yield (0, fs_extra_1.mkdir)(directory, { recursive: true });
                        yield this.copy(src, cached);
                    }
                })));
                // we need this file to account for partial writes to the cache folder.
                // creating this file is atomic, whereas creating a folder is not.
                // so if the process gets terminated while we are copying stuff into cache,
                // the cache entry won't be used.
                yield (0, fs_extra_1.writeFile)((0, path_1.join)(td, 'code'), code.toString());
                yield (0, fs_extra_1.writeFile)(tdCommit, 'true');
                if (this.options.remoteCache) {
                    yield this.options.remoteCache.store(task.hash, this.cachePath);
                }
                if (terminalOutput) {
                    const outputPath = this.temporaryOutputPath(task);
                    yield (0, fs_extra_1.writeFile)(outputPath, terminalOutput);
                }
            }));
        });
    }
    copyFilesFromCache(hash, cachedResult, outputs) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.tryAndRetry(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const expandedOutputs = yield this.expandOutputsInCache(outputs, cachedResult);
                yield Promise.all(expandedOutputs.map((f) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const cached = (0, path_1.join)(cachedResult.outputsPath, f);
                    if (yield (0, fs_extra_1.pathExists)(cached)) {
                        const isFile = (yield (0, fs_extra_1.lstat)(cached)).isFile();
                        const src = (0, path_1.join)(this.root, f);
                        yield this.remove(src);
                        // Ensure parent directory is created if src is a file
                        const directory = isFile ? (0, path_1.resolve)(src, '..') : src;
                        yield (0, fs_extra_1.mkdir)(directory, { recursive: true });
                        yield this.copy(cached, src);
                    }
                })));
            }));
        });
    }
    temporaryOutputPath(task) {
        return (0, path_1.join)(this.terminalOutputsDir, task.hash);
    }
    expandOutputsInWorkspace(outputs) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this._expandOutputs(outputs, workspace_root_1.workspaceRoot);
        });
    }
    expandOutputsInCache(outputs, cachedResult) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this._expandOutputs(outputs, cachedResult.outputsPath);
        });
    }
    _expandOutputs(outputs, cwd) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (yield Promise.all(outputs.map((entry) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (yield (0, fs_extra_1.pathExists)((0, path_1.join)(cwd, entry))) {
                    return entry;
                }
                return fastGlob(entry, { cwd, dot: true });
            })))).flat();
        });
    }
    copy(src, destination) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // 'cp -a /path/dir/ dest/' operates differently to 'cp -a /path/dir dest/'
            // --> which means actual build works but subsequent populate from cache (using cp -a) does not
            // --> the fix is to remove trailing slashes to ensure consistent & expected behaviour
            src = src.replace(/[\/\\]$/, '');
            if (this.useFsExtraToCopyAndRemove) {
                return (0, fs_extra_1.copy)(src, destination);
            }
            return new Promise((res, rej) => {
                (0, child_process_1.execFile)('cp', ['-a', src, (0, path_1.dirname)(destination)], (error) => {
                    if (!error) {
                        res();
                    }
                    else {
                        this.useFsExtraToCopyAndRemove = true;
                        (0, fs_extra_1.copy)(src, destination).then(res, rej);
                    }
                });
            });
        });
    }
    remove(path) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.useFsExtraToCopyAndRemove) {
                return (0, fs_extra_1.remove)(path);
            }
            return new Promise((res, rej) => {
                (0, child_process_1.execFile)('rm', ['-rf', path], (error) => {
                    if (!error) {
                        res();
                    }
                    else {
                        this.useFsExtraToCopyAndRemove = true;
                        (0, fs_extra_1.remove)(path).then(res, rej);
                    }
                });
            });
        });
    }
    getFromLocalDir(task) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const tdCommit = (0, path_1.join)(this.cachePath, `${task.hash}.commit`);
            const td = (0, path_1.join)(this.cachePath, task.hash);
            if (yield (0, fs_extra_1.pathExists)(tdCommit)) {
                const terminalOutput = yield (0, fs_extra_1.readFile)((0, path_1.join)(td, 'terminalOutput'), 'utf-8');
                let code = 0;
                try {
                    code = Number(yield (0, fs_extra_1.readFile)((0, path_1.join)(td, 'code'), 'utf-8'));
                }
                catch (_a) { }
                return {
                    terminalOutput,
                    outputsPath: (0, path_1.join)(td, 'outputs'),
                    code,
                };
            }
            else {
                return null;
            }
        });
    }
    createCacheDir() {
        (0, fs_extra_1.mkdirSync)(cache_directory_1.cacheDir, { recursive: true });
        return cache_directory_1.cacheDir;
    }
    createTerminalOutputsDir() {
        const path = (0, path_1.join)(this.cachePath, 'terminalOutputs');
        (0, fs_extra_1.mkdirSync)(path, { recursive: true });
        return path;
    }
    tryAndRetry(fn) {
        let attempts = 0;
        const baseTimeout = 100;
        const _try = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                attempts++;
                return yield fn();
            }
            catch (e) {
                if (attempts === 10) {
                    // After enough attempts, throw the error
                    throw e;
                }
                yield new Promise((res) => setTimeout(res, baseTimeout * attempts));
                return yield _try();
            }
        });
        return _try();
    }
}
exports.Cache = Cache;
//# sourceMappingURL=cache.js.map