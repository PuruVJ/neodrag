"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotManager = exports.GlobalSnapshotManager = void 0;
const events_1 = require("events");
const utils_1 = require("../../../utils");
const DocumentSnapshot_1 = require("./DocumentSnapshot");
const DocumentSnapshotUtils = __importStar(require("./utils"));
/**
 * Every snapshot corresponds to a unique file on disk.
 * A snapshot can be part of multiple projects, but for a given file path
 * there can be only one snapshot.
 */
class GlobalSnapshotManager {
    constructor(ts) {
        this.ts = ts;
        this.emitter = new events_1.EventEmitter();
        this.documents = new Map();
    }
    get(fileName) {
        fileName = (0, utils_1.normalizePath)(fileName);
        return this.documents.get(fileName);
    }
    set(fileName, document) {
        fileName = (0, utils_1.normalizePath)(fileName);
        const prev = this.get(fileName);
        if (prev) {
            prev.destroyFragment();
        }
        this.documents.set(fileName, document);
        this.emitter.emit('change', fileName, document);
    }
    delete(fileName) {
        fileName = (0, utils_1.normalizePath)(fileName);
        this.documents.delete(fileName);
        this.emitter.emit('change', fileName, undefined);
    }
    updateNonAstroFile(fileName, changes, newText) {
        fileName = (0, utils_1.normalizePath)(fileName);
        const previousSnapshot = this.get(fileName);
        const canBePartiallyUpdated = changes && previousSnapshot instanceof DocumentSnapshot_1.TypeScriptDocumentSnapshot && previousSnapshot.supportPartialUpdate;
        if (canBePartiallyUpdated) {
            previousSnapshot.update(changes);
            this.emitter.emit('change', fileName, previousSnapshot);
            return previousSnapshot;
        }
        else {
            const newSnapshot = DocumentSnapshotUtils.createFromNonAstroFilePath(fileName, this.ts, newText);
            if (previousSnapshot) {
                newSnapshot.version = previousSnapshot.version + 1;
            }
            else {
                // ensure it's greater than initial version
                // so that ts server picks up the change
                newSnapshot.version += 1;
            }
            this.set(fileName, newSnapshot);
            this.emitter.emit('change', fileName, newSnapshot);
            return newSnapshot;
        }
    }
    onChange(listener) {
        this.emitter.on('change', listener);
    }
}
exports.GlobalSnapshotManager = GlobalSnapshotManager;
/**
 * Should only be used by `language-service.ts`
 */
class SnapshotManager {
    constructor(globalSnapshotsManager, projectFiles, fileSpec, workspaceRoot, ts) {
        this.globalSnapshotsManager = globalSnapshotsManager;
        this.projectFiles = projectFiles;
        this.fileSpec = fileSpec;
        this.workspaceRoot = workspaceRoot;
        this.ts = ts;
        this.documents = new Map();
        this.lastLogged = new Date(new Date().getTime() - 60001);
        this.globalSnapshotsManager.onChange((fileName, document) => {
            // Only delete/update snapshots, don't add new ones,
            // as they could be from another TS service and this
            // snapshot manager can't reach this file.
            // For these, instead wait on a `get` method invocation
            // and set them "manually" in the set/update methods.
            if (!document) {
                this.documents.delete(fileName);
            }
            else if (this.documents.has(fileName)) {
                this.documents.set(fileName, document);
            }
        });
    }
    updateProjectFiles() {
        const { include, exclude } = this.fileSpec;
        // Since we default to not include anything,
        //  just don't waste time on this
        if (include?.length === 0) {
            return;
        }
        const projectFiles = this.ts.sys
            .readDirectory(this.workspaceRoot, [...Object.values(this.ts.Extension), '.astro', '.svelte', '.vue'], exclude, include)
            .map(utils_1.normalizePath);
        this.projectFiles = Array.from(new Set([...this.projectFiles, ...projectFiles]));
    }
    updateNonAstroFile(fileName, changes, text) {
        const snapshot = this.globalSnapshotsManager.updateNonAstroFile(fileName, changes, text);
        // This isn't duplicated logic to the listener, because this could
        // be a new snapshot which the listener wouldn't add.
        if (snapshot) {
            this.documents.set((0, utils_1.normalizePath)(fileName), snapshot);
        }
    }
    has(fileName) {
        fileName = (0, utils_1.normalizePath)(fileName);
        return this.projectFiles.includes(fileName) || this.getFileNames().includes(fileName);
    }
    set(fileName, snapshot) {
        this.globalSnapshotsManager.set(fileName, snapshot);
        // This isn't duplicated logic to the listener, because this could
        // be a new snapshot which the listener wouldn't add.
        this.documents.set((0, utils_1.normalizePath)(fileName), snapshot);
    }
    get(fileName) {
        fileName = (0, utils_1.normalizePath)(fileName);
        let snapshot = this.documents.get(fileName);
        if (!snapshot) {
            snapshot = this.globalSnapshotsManager.get(fileName);
            if (snapshot) {
                this.documents.set(fileName, snapshot);
            }
        }
        return snapshot;
    }
    delete(fileName) {
        fileName = (0, utils_1.normalizePath)(fileName);
        this.projectFiles = this.projectFiles.filter((s) => s !== fileName);
        this.globalSnapshotsManager.delete(fileName);
    }
    getFileNames() {
        return Array.from(this.documents.keys());
    }
    getProjectFileNames() {
        return [...this.projectFiles];
    }
    logStatistics() {
        const date = new Date();
        // Don't use setInterval because that will keep tests running forever
        if (date.getTime() - this.lastLogged.getTime() > 60000) {
            this.lastLogged = date;
            const projectFiles = this.getProjectFileNames();
            const allFiles = Array.from(new Set([...projectFiles, ...this.getFileNames()]));
            // eslint-disable-next-line no-console
            console.log('SnapshotManager File Statistics:\n' +
                `Project files: ${projectFiles.length}\n` +
                `Astro files: ${allFiles.filter((name) => name.endsWith('.astro')).length}\n` +
                `From node_modules: ${allFiles.filter((name) => name.includes('node_modules')).length}\n` +
                `Total: ${allFiles.length}`);
        }
    }
}
exports.SnapshotManager = SnapshotManager;
