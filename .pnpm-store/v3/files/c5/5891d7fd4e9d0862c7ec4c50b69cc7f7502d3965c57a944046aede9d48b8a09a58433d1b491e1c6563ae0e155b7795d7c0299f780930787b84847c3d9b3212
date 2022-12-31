"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printChanges = exports.flushChanges = exports.FsTree = void 0;
const fs_extra_1 = require("fs-extra");
const logger_1 = require("../utils/logger");
const path_1 = require("path");
const chalk = require("chalk");
class FsTree {
    constructor(root, isVerbose) {
        this.root = root;
        this.isVerbose = isVerbose;
        this.recordedChanges = {};
    }
    read(filePath, encoding) {
        filePath = this.normalize(filePath);
        try {
            let content;
            if (this.recordedChanges[this.rp(filePath)]) {
                content = this.recordedChanges[this.rp(filePath)].content;
            }
            else {
                content = this.fsReadFile(filePath);
            }
            return encoding ? content.toString(encoding) : content;
        }
        catch (e) {
            if (this.isVerbose) {
                logger_1.logger.error(e);
            }
            return null;
        }
    }
    write(filePath, content, options) {
        filePath = this.normalize(filePath);
        if (this.fsExists(this.rp(filePath)) &&
            Buffer.from(content).equals(this.fsReadFile(filePath))) {
            // Remove recorded change because the file has been restored to it's original contents
            delete this.recordedChanges[this.rp(filePath)];
            return;
        }
        try {
            this.recordedChanges[this.rp(filePath)] = {
                content: Buffer.from(content),
                isDeleted: false,
                options,
            };
        }
        catch (e) {
            if (this.isVerbose) {
                logger_1.logger.error(e);
            }
        }
    }
    overwrite(filePath, content, options) {
        filePath = this.normalize(filePath);
        this.write(filePath, content, options);
    }
    delete(filePath) {
        filePath = this.normalize(filePath);
        if (this.filesForDir(this.rp(filePath)).length > 0) {
            this.filesForDir(this.rp(filePath)).forEach((f) => (this.recordedChanges[f] = { content: null, isDeleted: true }));
        }
        this.recordedChanges[this.rp(filePath)] = {
            content: null,
            isDeleted: true,
        };
        // Delete directories when
        if (this.children((0, path_1.dirname)(this.rp(filePath))).length < 1) {
            this.delete((0, path_1.dirname)(this.rp(filePath)));
        }
    }
    exists(filePath) {
        filePath = this.normalize(filePath);
        try {
            if (this.recordedChanges[this.rp(filePath)]) {
                return !this.recordedChanges[this.rp(filePath)].isDeleted;
            }
            else if (this.filesForDir(this.rp(filePath)).length > 0) {
                return true;
            }
            else {
                return this.fsExists(filePath);
            }
        }
        catch (_a) {
            return false;
        }
    }
    rename(from, to) {
        from = this.normalize(from);
        to = this.normalize(to);
        const content = this.read(this.rp(from));
        this.delete(this.rp(from));
        this.write(this.rp(to), content);
    }
    isFile(filePath) {
        filePath = this.normalize(filePath);
        try {
            if (this.recordedChanges[this.rp(filePath)]) {
                return !this.recordedChanges[this.rp(filePath)].isDeleted;
            }
            else {
                return this.fsIsFile(filePath);
            }
        }
        catch (_a) {
            return false;
        }
    }
    children(dirPath) {
        dirPath = this.normalize(dirPath);
        let res = this.fsReadDir(dirPath);
        res = [...res, ...this.directChildrenOfDir(this.rp(dirPath))];
        res = res.filter((q) => {
            const r = this.recordedChanges[(0, path_1.join)(this.rp(dirPath), q)];
            return !(r === null || r === void 0 ? void 0 : r.isDeleted);
        });
        // Dedupe
        return Array.from(new Set(res));
    }
    listChanges() {
        const res = [];
        Object.keys(this.recordedChanges).forEach((f) => {
            if (this.recordedChanges[f].isDeleted) {
                if (this.fsExists(f)) {
                    res.push({ path: f, type: 'DELETE', content: null });
                }
            }
            else {
                if (this.fsExists(f)) {
                    res.push({
                        path: f,
                        type: 'UPDATE',
                        content: this.recordedChanges[f].content,
                        options: this.recordedChanges[f].options,
                    });
                }
                else {
                    res.push({
                        path: f,
                        type: 'CREATE',
                        content: this.recordedChanges[f].content,
                        options: this.recordedChanges[f].options,
                    });
                }
            }
        });
        return res;
    }
    changePermissions(filePath, mode) {
        filePath = this.normalize(filePath);
        const filePathChangeKey = this.rp(filePath);
        if (this.recordedChanges[filePathChangeKey]) {
            if (this.recordedChanges[filePathChangeKey].isDeleted) {
                throw new Error(`Cannot change permissions of deleted file ${filePath}.`);
            }
            this.recordedChanges[filePathChangeKey].options = { mode };
        }
        else if (!this.fsExists(filePath)) {
            throw new Error(`Cannot change permissions of non-existing file ${filePath}.`);
        }
        else if (!this.fsIsFile(filePath)) {
            // To fully support directories we'd need to change how we store
            // changes to keep a record of directories so we can associate
            // permissions to them.
            throw new Error(`Cannot change permissions of non-file ${filePath}.`);
        }
        else {
            this.recordedChanges[filePathChangeKey] = {
                content: this.fsReadFile(filePath),
                isDeleted: false,
                options: { mode },
            };
        }
    }
    normalize(path) {
        return (0, path_1.relative)(this.root, (0, path_1.join)(this.root, path)).split(path_1.sep).join('/');
    }
    fsReadDir(dirPath) {
        try {
            return (0, fs_extra_1.readdirSync)((0, path_1.join)(this.root, dirPath));
        }
        catch (_a) {
            return [];
        }
    }
    fsIsFile(filePath) {
        const stat = (0, fs_extra_1.statSync)((0, path_1.join)(this.root, filePath));
        return stat.isFile();
    }
    fsReadFile(filePath) {
        return (0, fs_extra_1.readFileSync)((0, path_1.join)(this.root, filePath));
    }
    fsExists(filePath) {
        try {
            const stat = (0, fs_extra_1.statSync)((0, path_1.join)(this.root, filePath));
            return stat.isFile() || stat.isDirectory();
        }
        catch (_a) {
            return false;
        }
    }
    filesForDir(path) {
        return Object.keys(this.recordedChanges).filter((f) => f.startsWith(`${path}/`) && !this.recordedChanges[f].isDeleted);
    }
    directChildrenOfDir(path) {
        const res = {};
        if (path === '') {
            return Object.keys(this.recordedChanges).map((file) => file.split('/')[0]);
        }
        Object.keys(this.recordedChanges).forEach((f) => {
            if (f.startsWith(`${path}/`)) {
                const [_, file] = f.split(`${path}/`);
                res[file.split('/')[0]] = true;
            }
        });
        return Object.keys(res);
    }
    rp(pp) {
        return pp.startsWith('/') ? pp.substring(1) : pp;
    }
}
exports.FsTree = FsTree;
function flushChanges(root, fileChanges) {
    fileChanges.forEach((f) => {
        var _a, _b;
        const fpath = (0, path_1.join)(root, f.path);
        if (f.type === 'CREATE') {
            (0, fs_extra_1.ensureDirSync)((0, path_1.dirname)(fpath));
            (0, fs_extra_1.writeFileSync)(fpath, f.content);
            if ((_a = f.options) === null || _a === void 0 ? void 0 : _a.mode)
                (0, fs_extra_1.chmodSync)(fpath, f.options.mode);
        }
        else if (f.type === 'UPDATE') {
            (0, fs_extra_1.writeFileSync)(fpath, f.content);
            if ((_b = f.options) === null || _b === void 0 ? void 0 : _b.mode)
                (0, fs_extra_1.chmodSync)(fpath, f.options.mode);
        }
        else if (f.type === 'DELETE') {
            (0, fs_extra_1.removeSync)(fpath);
        }
    });
}
exports.flushChanges = flushChanges;
function printChanges(fileChanges, indent = '') {
    fileChanges.forEach((f) => {
        if (f.type === 'CREATE') {
            console.log(`${indent}${chalk.green('CREATE')} ${f.path}`);
        }
        else if (f.type === 'UPDATE') {
            console.log(`${indent}${chalk.white('UPDATE')} ${f.path}`);
        }
        else if (f.type === 'DELETE') {
            console.log(`${indent}${chalk.yellow('DELETE')} ${f.path}`);
        }
    });
}
exports.printChanges = printChanges;
//# sourceMappingURL=tree.js.map