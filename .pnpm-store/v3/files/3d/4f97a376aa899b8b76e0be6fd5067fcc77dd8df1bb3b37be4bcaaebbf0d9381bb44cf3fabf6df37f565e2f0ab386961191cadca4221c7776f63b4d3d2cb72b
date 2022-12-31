"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUpdatedAndDeletedFiles = exports.getCachedSerializedProjectGraphPromise = exports.currentProjectGraphCache = exports.projectFileMapWithFiles = void 0;
const tslib_1 = require("tslib");
const perf_hooks_1 = require("perf_hooks");
const configuration_1 = require("../../config/configuration");
const file_hasher_1 = require("../../hasher/file-hasher");
const hashing_impl_1 = require("../../hasher/hashing-impl");
const build_project_graph_1 = require("../../project-graph/build-project-graph");
const file_map_utils_1 = require("../../project-graph/file-map-utils");
const nx_deps_cache_1 = require("../../project-graph/nx-deps-cache");
const fileutils_1 = require("../../utils/fileutils");
const file_watcher_sockets_1 = require("./file-watching/file-watcher-sockets");
const logger_1 = require("./logger");
let cachedSerializedProjectGraphPromise;
const collectedUpdatedFiles = new Set();
const collectedDeletedFiles = new Set();
let storedWorkspaceConfigHash;
let waitPeriod = 100;
let scheduledTimeoutId;
function getCachedSerializedProjectGraphPromise() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            // recomputing it now on demand. we can ignore the scheduled timeout
            if (scheduledTimeoutId) {
                clearTimeout(scheduledTimeoutId);
                scheduledTimeoutId = undefined;
            }
            // reset the wait time
            waitPeriod = 100;
            yield resetInternalStateIfNxDepsMissing();
            if (collectedUpdatedFiles.size == 0 && collectedDeletedFiles.size == 0) {
                if (!cachedSerializedProjectGraphPromise) {
                    cachedSerializedProjectGraphPromise =
                        processFilesAndCreateAndSerializeProjectGraph();
                }
            }
            else {
                cachedSerializedProjectGraphPromise =
                    processFilesAndCreateAndSerializeProjectGraph();
            }
            return yield cachedSerializedProjectGraphPromise;
        }
        catch (e) {
            return { error: e, serializedProjectGraph: null };
        }
    });
}
exports.getCachedSerializedProjectGraphPromise = getCachedSerializedProjectGraphPromise;
function addUpdatedAndDeletedFiles(createdFiles, updatedFiles, deletedFiles) {
    for (let f of [...createdFiles, ...updatedFiles]) {
        collectedDeletedFiles.delete(f);
        collectedUpdatedFiles.add(f);
    }
    for (let f of deletedFiles) {
        collectedUpdatedFiles.delete(f);
        collectedDeletedFiles.add(f);
    }
    if (updatedFiles.length > 0 || deletedFiles.length > 0) {
        (0, file_watcher_sockets_1.notifyFileWatcherSockets)(null, updatedFiles, deletedFiles);
    }
    if (createdFiles.length > 0) {
        waitPeriod = 100; // reset it to process the graph faster
    }
    if (!scheduledTimeoutId) {
        scheduledTimeoutId = setTimeout(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            scheduledTimeoutId = undefined;
            if (waitPeriod < 4000) {
                waitPeriod = waitPeriod * 2;
            }
            cachedSerializedProjectGraphPromise =
                processFilesAndCreateAndSerializeProjectGraph();
            yield cachedSerializedProjectGraphPromise;
            if (createdFiles.length > 0) {
                (0, file_watcher_sockets_1.notifyFileWatcherSockets)(createdFiles, null, null);
            }
        }), waitPeriod);
    }
}
exports.addUpdatedAndDeletedFiles = addUpdatedAndDeletedFiles;
function computeWorkspaceConfigHash(workspaceJson) {
    return new hashing_impl_1.HashingImpl().hashArray([JSON.stringify(workspaceJson)]);
}
function processCollectedUpdatedAndDeletedFiles() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            perf_hooks_1.performance.mark('hash-watched-changes-start');
            const updatedFiles = yield file_hasher_1.defaultFileHasher.hashFiles([
                ...collectedUpdatedFiles.values(),
            ]);
            const deletedFiles = [...collectedDeletedFiles.values()];
            perf_hooks_1.performance.mark('hash-watched-changes-end');
            perf_hooks_1.performance.measure('hash changed files from watcher', 'hash-watched-changes-start', 'hash-watched-changes-end');
            file_hasher_1.defaultFileHasher.incrementalUpdate(updatedFiles, deletedFiles);
            const workspaceJson = (0, configuration_1.readAllWorkspaceConfiguration)();
            const workspaceConfigHash = computeWorkspaceConfigHash(workspaceJson);
            logger_1.serverLogger.requestLog(`Updated file-hasher based on watched changes, recomputing project graph...`);
            // when workspace config changes we cannot incrementally update project file map
            if (workspaceConfigHash !== storedWorkspaceConfigHash) {
                storedWorkspaceConfigHash = workspaceConfigHash;
                exports.projectFileMapWithFiles = (0, file_map_utils_1.createProjectFileMap)(workspaceJson, file_hasher_1.defaultFileHasher.allFileData());
            }
            else {
                exports.projectFileMapWithFiles = exports.projectFileMapWithFiles
                    ? (0, file_map_utils_1.updateProjectFileMap)(workspaceJson, exports.projectFileMapWithFiles.projectFileMap, exports.projectFileMapWithFiles.allWorkspaceFiles, updatedFiles, deletedFiles)
                    : (0, file_map_utils_1.createProjectFileMap)(workspaceJson, file_hasher_1.defaultFileHasher.allFileData());
            }
            collectedUpdatedFiles.clear();
            collectedDeletedFiles.clear();
        }
        catch (e) {
            // this is expected
            // for instance, workspace.json can be incorrect or a file we are trying to has
            // has been deleted
            // we are resetting internal state to start from scratch next time a file changes
            // given the user the opportunity to fix the error
            // if Nx requests the project graph prior to the error being fixed,
            // the error will be propagated
            logger_1.serverLogger.log(`Error detected when recomputing project file map: ${e.message}`);
            resetInternalState();
            return e;
        }
    });
}
function processFilesAndCreateAndSerializeProjectGraph() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const err = yield processCollectedUpdatedAndDeletedFiles();
        if (err) {
            return Promise.resolve({
                error: err,
                serializedProjectGraph: null,
            });
        }
        else {
            return createAndSerializeProjectGraph();
        }
    });
}
function copyFileData(d) {
    return d.map((t) => (Object.assign({}, t)));
}
function copyFileMap(m) {
    const c = {};
    for (let p of Object.keys(m)) {
        c[p] = copyFileData(m[p]);
    }
    return c;
}
function createAndSerializeProjectGraph() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            perf_hooks_1.performance.mark('create-project-graph-start');
            const workspaceJson = (0, configuration_1.readAllWorkspaceConfiguration)();
            const { projectGraph, projectGraphCache } = yield (0, build_project_graph_1.buildProjectGraphUsingProjectFileMap)(workspaceJson, copyFileMap(exports.projectFileMapWithFiles.projectFileMap), copyFileData(exports.projectFileMapWithFiles.allWorkspaceFiles), exports.currentProjectGraphCache || (0, nx_deps_cache_1.readCache)(), true);
            exports.currentProjectGraphCache = projectGraphCache;
            perf_hooks_1.performance.mark('create-project-graph-end');
            perf_hooks_1.performance.measure('total execution time for createProjectGraph()', 'create-project-graph-start', 'create-project-graph-end');
            perf_hooks_1.performance.mark('json-stringify-start');
            const serializedProjectGraph = JSON.stringify(projectGraph);
            perf_hooks_1.performance.mark('json-stringify-end');
            perf_hooks_1.performance.measure('serialize graph', 'json-stringify-start', 'json-stringify-end');
            return {
                error: null,
                serializedProjectGraph,
            };
        }
        catch (e) {
            logger_1.serverLogger.log(`Error detected when creating a project graph: ${e.message}`);
            return {
                error: e,
                serializedProjectGraph: null,
            };
        }
    });
}
function resetInternalState() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        cachedSerializedProjectGraphPromise = undefined;
        exports.projectFileMapWithFiles = undefined;
        exports.currentProjectGraphCache = undefined;
        collectedUpdatedFiles.clear();
        collectedDeletedFiles.clear();
        file_hasher_1.defaultFileHasher.clear();
        yield file_hasher_1.defaultFileHasher.ensureInitialized();
        waitPeriod = 100;
    });
}
function resetInternalStateIfNxDepsMissing() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            if (!(0, fileutils_1.fileExists)(nx_deps_cache_1.nxDepsPath) && cachedSerializedProjectGraphPromise) {
                yield resetInternalState();
            }
        }
        catch (e) {
            yield resetInternalState();
        }
    });
}
//# sourceMappingURL=project-graph-incremental-recomputation.js.map