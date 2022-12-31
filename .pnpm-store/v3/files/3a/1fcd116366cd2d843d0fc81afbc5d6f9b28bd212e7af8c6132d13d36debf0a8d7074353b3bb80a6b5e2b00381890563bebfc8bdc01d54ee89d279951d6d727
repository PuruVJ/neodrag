"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopServer = exports.startServer = exports.handleResult = void 0;
const tslib_1 = require("tslib");
const workspace_root_1 = require("../../utils/workspace-root");
const net_1 = require("net");
const path_1 = require("path");
const perf_hooks_1 = require("perf_hooks");
const socket_utils_1 = require("../socket-utils");
const logger_1 = require("./logger");
const shutdown_utils_1 = require("./shutdown-utils");
const watcher_1 = require("./watcher");
const project_graph_incremental_recomputation_1 = require("./project-graph-incremental-recomputation");
const fs_1 = require("fs");
const hashing_impl_1 = require("../../hasher/hashing-impl");
const file_hasher_1 = require("../../hasher/file-hasher");
const handle_request_project_graph_1 = require("./handle-request-project-graph");
const handle_process_in_background_1 = require("./handle-process-in-background");
const handle_outputs_tracking_1 = require("./handle-outputs-tracking");
const consume_messages_from_socket_1 = require("../../utils/consume-messages-from-socket");
const outputs_tracking_1 = require("./outputs-tracking");
const handle_request_shutdown_1 = require("./handle-request-shutdown");
const file_watcher_sockets_1 = require("./file-watching/file-watcher-sockets");
let performanceObserver;
let workspaceWatcherError;
let outputsWatcherError;
let numberOfOpenConnections = 0;
const server = (0, net_1.createServer)((socket) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    numberOfOpenConnections += 1;
    logger_1.serverLogger.log(`Established a connection. Number of open connections: ${numberOfOpenConnections}`);
    (0, shutdown_utils_1.resetInactivityTimeout)(handleInactivityTimeout);
    if (!performanceObserver) {
        performanceObserver = new perf_hooks_1.PerformanceObserver((list) => {
            const entry = list.getEntries()[0];
            logger_1.serverLogger.log(`Time taken for '${entry.name}'`, `${entry.duration}ms`);
        });
        performanceObserver.observe({ entryTypes: ['measure'] });
    }
    socket.on('data', (0, consume_messages_from_socket_1.consumeMessagesFromSocket)((message) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        yield handleMessage(socket, message);
    })));
    socket.on('error', (e) => {
        logger_1.serverLogger.log('Socket error');
        console.error(e);
    });
    socket.on('close', () => {
        numberOfOpenConnections -= 1;
        logger_1.serverLogger.log(`Closed a connection. Number of open connections: ${numberOfOpenConnections}`);
        (0, file_watcher_sockets_1.removeRegisteredFileWatcherSocket)(socket);
    });
}));
function handleMessage(socket, data) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (workspaceWatcherError) {
            yield (0, shutdown_utils_1.respondWithErrorAndExit)(socket, `File watcher error in the workspace '${workspace_root_1.workspaceRoot}'.`, workspaceWatcherError);
        }
        if (lockFileChanged()) {
            yield (0, shutdown_utils_1.respondWithErrorAndExit)(socket, `Lock files changed`, {
                name: '',
                message: 'LOCK-FILES-CHANGED',
            });
        }
        (0, shutdown_utils_1.resetInactivityTimeout)(handleInactivityTimeout);
        const unparsedPayload = data;
        let payload;
        try {
            payload = JSON.parse(unparsedPayload);
        }
        catch (e) {
            yield (0, shutdown_utils_1.respondWithErrorAndExit)(socket, `Invalid payload from the client`, new Error(`Unsupported payload sent to daemon server: ${unparsedPayload}`));
        }
        if (payload.type === 'PING') {
            yield handleResult(socket, {
                response: JSON.stringify(true),
                description: 'ping',
            });
        }
        else if (payload.type === 'REQUEST_PROJECT_GRAPH') {
            yield handleResult(socket, yield (0, handle_request_project_graph_1.handleRequestProjectGraph)());
        }
        else if (payload.type === 'PROCESS_IN_BACKGROUND') {
            yield handleResult(socket, yield (0, handle_process_in_background_1.handleProcessInBackground)(payload));
        }
        else if (payload.type === 'RECORD_OUTPUTS_HASH') {
            yield handleResult(socket, yield (0, handle_outputs_tracking_1.handleRecordOutputsHash)(payload));
        }
        else if (payload.type === 'OUTPUTS_HASHES_MATCH') {
            yield handleResult(socket, yield (0, handle_outputs_tracking_1.handleOutputsHashesMatch)(payload));
        }
        else if (payload.type === 'REQUEST_SHUTDOWN') {
            yield handleResult(socket, yield (0, handle_request_shutdown_1.handleRequestShutdown)(server, numberOfOpenConnections));
        }
        else if (payload.type === 'REGISTER_FILE_WATCHER') {
            file_watcher_sockets_1.registeredFileWatcherSockets.push({ socket, config: payload.config });
        }
        else {
            yield (0, shutdown_utils_1.respondWithErrorAndExit)(socket, `Invalid payload from the client`, new Error(`Unsupported payload sent to daemon server: ${unparsedPayload}`));
        }
    });
}
function handleResult(socket, hr) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (hr.error) {
            yield (0, shutdown_utils_1.respondWithErrorAndExit)(socket, hr.description, hr.error);
        }
        else {
            yield (0, shutdown_utils_1.respondToClient)(socket, hr.response, hr.description);
        }
    });
}
exports.handleResult = handleResult;
function handleInactivityTimeout() {
    if (numberOfOpenConnections > 0) {
        logger_1.serverLogger.log(`There are ${numberOfOpenConnections} open connections. Reset inactivity timer.`);
        (0, shutdown_utils_1.resetInactivityTimeout)(handleInactivityTimeout);
    }
    else {
        (0, shutdown_utils_1.handleServerProcessTermination)({
            server,
            reason: `${shutdown_utils_1.SERVER_INACTIVITY_TIMEOUT_MS}ms of inactivity`,
        });
    }
}
process
    .on('SIGINT', () => (0, shutdown_utils_1.handleServerProcessTermination)({
    server,
    reason: 'received process SIGINT',
}))
    .on('SIGTERM', () => (0, shutdown_utils_1.handleServerProcessTermination)({
    server,
    reason: 'received process SIGTERM',
}))
    .on('SIGHUP', () => (0, shutdown_utils_1.handleServerProcessTermination)({
    server,
    reason: 'received process SIGHUP',
}));
let existingLockHash;
function lockFileChanged() {
    const hash = new hashing_impl_1.HashingImpl();
    const lockHashes = [
        (0, path_1.join)(workspace_root_1.workspaceRoot, 'package-lock.json'),
        (0, path_1.join)(workspace_root_1.workspaceRoot, 'yarn.lock'),
        (0, path_1.join)(workspace_root_1.workspaceRoot, 'pnpm-lock.yaml'),
    ]
        .filter((file) => (0, fs_1.existsSync)(file))
        .map((file) => hash.hashFile(file));
    const newHash = hash.hashArray(lockHashes);
    if (existingLockHash && newHash != existingLockHash) {
        existingLockHash = newHash;
        return true;
    }
    else {
        existingLockHash = newHash;
        return false;
    }
}
/**
 * When applicable files in the workspaces are changed (created, updated, deleted),
 * we need to recompute the cached serialized project graph so that it is readily
 * available for the next client request to the server.
 */
const handleWorkspaceChanges = (err, changeEvents) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (workspaceWatcherError) {
        logger_1.serverLogger.watcherLog('Skipping handleWorkspaceChanges because of a previously recorded watcher error.');
        return;
    }
    try {
        (0, shutdown_utils_1.resetInactivityTimeout)(handleInactivityTimeout);
        if (lockFileChanged()) {
            yield (0, shutdown_utils_1.handleServerProcessTermination)({
                server,
                reason: 'Lock file changed',
            });
            return;
        }
        if (err || !changeEvents || !changeEvents.length) {
            logger_1.serverLogger.watcherLog('Unexpected workspace watcher error', err.message);
            console.error(err);
            workspaceWatcherError = err;
            return;
        }
        logger_1.serverLogger.watcherLog((0, watcher_1.convertChangeEventsToLogMessage)(changeEvents));
        const updatedFilesToHash = [];
        const createdFilesToHash = [];
        const deletedFiles = [];
        for (const event of changeEvents) {
            if (event.type === 'delete') {
                deletedFiles.push(event.path);
            }
            else {
                try {
                    const s = (0, fs_1.statSync)((0, path_1.join)(workspace_root_1.workspaceRoot, event.path));
                    if (s.isFile()) {
                        if (event.type === 'update') {
                            updatedFilesToHash.push(event.path);
                        }
                        else {
                            createdFilesToHash.push(event.path);
                        }
                    }
                }
                catch (e) {
                    // this can happen when the update file was deleted right after
                }
            }
        }
        (0, project_graph_incremental_recomputation_1.addUpdatedAndDeletedFiles)(createdFilesToHash, updatedFilesToHash, deletedFiles);
    }
    catch (err) {
        logger_1.serverLogger.watcherLog(`Unexpected workspace error`, err.message);
        console.error(err);
        workspaceWatcherError = err;
    }
});
const handleOutputsChanges = (err, changeEvents) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        if (err || !changeEvents || !changeEvents.length) {
            logger_1.serverLogger.watcherLog('Unexpected outputs watcher error', err.message);
            console.error(err);
            outputsWatcherError = err;
            (0, outputs_tracking_1.disableOutputsTracking)();
            return;
        }
        if (outputsWatcherError) {
            return;
        }
        (0, outputs_tracking_1.processFileChangesInOutputs)(changeEvents);
    }
    catch (err) {
        logger_1.serverLogger.watcherLog(`Unexpected outputs watcher error`, err.message);
        console.error(err);
        outputsWatcherError = err;
        (0, outputs_tracking_1.disableOutputsTracking)();
    }
});
function startServer() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // See notes in socket-command-line-utils.ts on OS differences regarding clean up of existings connections.
        if (!socket_utils_1.isWindows) {
            (0, socket_utils_1.killSocketOrPath)();
        }
        yield file_hasher_1.defaultFileHasher.ensureInitialized();
        return new Promise((resolve, reject) => {
            try {
                server.listen(socket_utils_1.FULL_OS_SOCKET_PATH, () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    try {
                        logger_1.serverLogger.log(`Started listening on: ${socket_utils_1.FULL_OS_SOCKET_PATH}`);
                        // this triggers the storage of the lock file hash
                        lockFileChanged();
                        if (!(0, shutdown_utils_1.getSourceWatcherSubscription)()) {
                            (0, shutdown_utils_1.storeSourceWatcherSubscription)(yield (0, watcher_1.subscribeToWorkspaceChanges)(server, handleWorkspaceChanges));
                            logger_1.serverLogger.watcherLog(`Subscribed to changes within: ${workspace_root_1.workspaceRoot}`);
                        }
                        // temporary disable outputs tracking on linux
                        const outputsTrackingIsEnabled = process.platform != 'linux';
                        if (outputsTrackingIsEnabled) {
                            if (!(0, shutdown_utils_1.getOutputsWatcherSubscription)()) {
                                (0, shutdown_utils_1.storeOutputsWatcherSubscription)(yield (0, watcher_1.subscribeToOutputsChanges)(handleOutputsChanges));
                            }
                        }
                        else {
                            (0, outputs_tracking_1.disableOutputsTracking)();
                        }
                        return resolve(server);
                    }
                    catch (err) {
                        yield handleWorkspaceChanges(err, []);
                    }
                }));
            }
            catch (err) {
                reject(err);
            }
        });
    });
}
exports.startServer = startServer;
function stopServer() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            server.close((err) => {
                if (err) {
                    /**
                     * If the server is running in a detached background process then server.close()
                     * will throw this error even if server is actually alive. We therefore only reject
                     * in case of any other unexpected errors.
                     */
                    if (!err.message.startsWith('Server is not running')) {
                        return reject(err);
                    }
                }
                (0, socket_utils_1.killSocketOrPath)();
                return resolve();
            });
        });
    });
}
exports.stopServer = stopServer;
//# sourceMappingURL=server.js.map