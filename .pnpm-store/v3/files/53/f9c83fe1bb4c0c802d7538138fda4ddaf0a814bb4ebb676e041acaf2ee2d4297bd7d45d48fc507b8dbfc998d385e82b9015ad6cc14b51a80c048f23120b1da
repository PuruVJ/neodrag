"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileHashes = exports.getGitHashForBatch = exports.getGitHashForFiles = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const fileutils_1 = require("../utils/fileutils");
const path_1 = require("../utils/path");
function getGitHashForFiles(potentialFilesToHash, path) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { filesToHash, deleted } = getActualFilesToHash(potentialFilesToHash, path);
        const res = new Map();
        const promises = [];
        if (filesToHash.length) {
            // On windows the max length is limited by the length of
            // the overall comand, rather than the number of individual
            // arguments. Since file paths are large and rather variable,
            // we use a smaller batchSize.
            const batchSize = process.platform === 'win32' ? 250 : 4000;
            for (let startIndex = 0; startIndex < filesToHash.length; startIndex += batchSize) {
                promises.push(getGitHashForBatch(filesToHash.slice(startIndex, startIndex + batchSize), path));
            }
        }
        // Merge batch results into final result set
        const batchResults = yield Promise.all(promises);
        for (const batch of batchResults) {
            batch.forEach((v, k) => res.set(k, v));
        }
        return { hashes: res, deleted };
    });
}
exports.getGitHashForFiles = getGitHashForFiles;
function getGitHashForBatch(filesToHash, path) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const res = new Map();
        const { stdout: hashStdout, stderr: hashStderr } = yield spawnProcess('git', ['hash-object', ...filesToHash], path);
        const hashes = hashStdout.split('\n').filter((s) => !!s);
        if (hashes.length !== filesToHash.length) {
            throw new Error(`Passed ${filesToHash.length} file paths to Git to hash, but received ${hashes.length} hashes.\n${hashStderr}`);
        }
        for (let i = 0; i < hashes.length; i++) {
            const hash = hashes[i];
            const filePath = filesToHash[i];
            res.set(filePath, hash);
        }
        return res;
    });
}
exports.getGitHashForBatch = getGitHashForBatch;
function getActualFilesToHash(potentialFilesToHash, path) {
    const filesToHash = [];
    const deleted = [];
    for (const file of potentialFilesToHash) {
        if ((0, fileutils_1.fileExists)((0, path_1.joinPathFragments)(path, file))) {
            filesToHash.push(file);
        }
        else {
            deleted.push(file);
        }
    }
    return { filesToHash, deleted };
}
function spawnProcess(command, args, cwd) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const cp = (0, child_process_1.spawn)(command, args, {
            windowsHide: true,
            shell: false,
            cwd,
        });
        let stdout = '';
        let stderr = '';
        cp.stdout.on('data', (data) => {
            stdout += data;
        });
        cp.stderr.on('data', (data) => {
            stderr += data;
        });
        return new Promise((resolve) => {
            cp.on('close', (code) => {
                resolve({ code, stdout, stderr });
            });
        });
    });
}
function getStagedFiles(path) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { stdout: staged } = yield spawnProcess('git', ['ls-files', '-s', '-z', '--exclude-standard', '.'], path);
        const res = new Map();
        for (const line of staged.split('\0')) {
            if (!line) {
                continue;
            }
            const [_, hash, __, ...fileParts] = line.split(/\s/);
            const fileName = fileParts.join(' ');
            res.set(fileName, hash);
        }
        return res;
    });
}
function getUnstagedFiles(path) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { stdout: unstaged } = yield spawnProcess('git', ['ls-files', '-m', '-z', '--exclude-standard', '.'], path);
        const lines = unstaged.split('\0').filter((f) => !!f);
        return getGitHashForFiles(lines, path);
    });
}
function getUntrackedFiles(path) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { stdout: untracked } = yield spawnProcess('git', ['ls-files', '--other', '-z', '--exclude-standard', '.'], path);
        const lines = untracked.split('\0').filter((f) => !!f);
        return getGitHashForFiles(lines, path);
    });
}
function getFileHashes(path) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const [staged, unstaged, untracked] = yield Promise.all([
            getStagedFiles(path),
            getUnstagedFiles(path),
            getUntrackedFiles(path),
        ]);
        unstaged.hashes.forEach((hash, filename) => {
            staged.set(filename, hash);
        });
        unstaged.deleted.forEach((filename) => {
            staged.delete(filename);
        });
        untracked.hashes.forEach((hash, filename) => {
            staged.set(filename, hash);
        });
        return { allFiles: staged };
    });
}
exports.getFileHashes = getFileHashes;
//# sourceMappingURL=git-hasher.js.map