"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.daemonClient = exports.DaemonClient = void 0;
const tslib_1 = require("tslib");
const workspace_root_1 = require("../../utils/workspace-root");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const net_1 = require("net");
const path_1 = require("path");
const perf_hooks_1 = require("perf_hooks");
const output_1 = require("../../utils/output");
const cache_1 = require("../cache");
const socket_utils_1 = require("../socket-utils");
const tmp_dir_1 = require("../tmp-dir");
const is_ci_1 = require("../../utils/is-ci");
const configuration_1 = require("../../config/configuration");
const promised_based_queue_1 = require("../../utils/promised-based-queue");
const workspaces_1 = require("../../config/workspaces");
const socket_messenger_1 = require("./socket-messenger");
const DAEMON_ENV_SETTINGS = Object.assign(Object.assign({}, process.env), { NX_PROJECT_GLOB_CACHE: 'false', NX_CACHE_WORKSPACE_CONFIG: 'false' });
class DaemonClient {
    constructor(nxJson) {
        this.nxJson = nxJson;
        this.reset();
    }
    enabled() {
        var _a, _b, _c;
        if (this._enabled === undefined) {
            const useDaemonProcessOption = (_c = (_b = (_a = this.nxJson.tasksRunnerOptions) === null || _a === void 0 ? void 0 : _a['default']) === null || _b === void 0 ? void 0 : _b.options) === null || _c === void 0 ? void 0 : _c.useDaemonProcess;
            const env = process.env.NX_DAEMON;
            // env takes precedence
            // option=true,env=false => no daemon
            // option=false,env=undefined => no daemon
            // option=false,env=false => no daemon
            // option=undefined,env=undefined => daemon
            // option=true,env=true => daemon
            // option=false,env=true => daemon
            // CI=true,env=undefined => no daemon
            // CI=true,env=false => no daemon
            // CI=true,env=true => daemon
            if (((0, is_ci_1.isCI)() && env !== 'true') ||
                isDocker() ||
                (0, tmp_dir_1.isDaemonDisabled)() ||
                nxJsonIsNotPresent() ||
                (useDaemonProcessOption === undefined && env === 'false') ||
                (useDaemonProcessOption === true && env === 'false') ||
                (useDaemonProcessOption === false && env === undefined) ||
                (useDaemonProcessOption === false && env === 'false')) {
                this._enabled = false;
            }
            else {
                this._enabled = true;
            }
        }
        return this._enabled;
    }
    reset() {
        this.socketMessenger = null;
        this.queue = new promised_based_queue_1.PromisedBasedQueue();
        this.currentMessage = null;
        this.currentResolve = null;
        this.currentReject = null;
        this._enabled = undefined;
        this._connected = false;
    }
    requestShutdown() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.sendToDaemonViaQueue({ type: 'REQUEST_SHUTDOWN' });
        });
    }
    getProjectGraph() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (yield this.sendToDaemonViaQueue({ type: 'REQUEST_PROJECT_GRAPH' }))
                .projectGraph;
        });
    }
    registerFileWatcher(config, callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.getProjectGraph();
            const messenger = new socket_messenger_1.SocketMessenger((0, net_1.connect)(socket_utils_1.FULL_OS_SOCKET_PATH)).listen((message) => {
                try {
                    const parsedMessage = JSON.parse(message);
                    callback(null, parsedMessage);
                }
                catch (e) {
                    callback(e, null);
                }
            }, () => {
                callback('closed', null);
            }, (err) => callback(err, null));
            yield this.queue.sendToQueue(() => messenger.sendMessage({ type: 'REGISTER_FILE_WATCHER', config }));
            return () => {
                messenger.close();
            };
        });
    }
    processInBackground(requirePath, data) {
        return this.sendToDaemonViaQueue({
            type: 'PROCESS_IN_BACKGROUND',
            requirePath,
            data,
        });
    }
    recordOutputsHash(outputs, hash) {
        return this.sendToDaemonViaQueue({
            type: 'RECORD_OUTPUTS_HASH',
            data: {
                outputs,
                hash,
            },
        });
    }
    outputsHashesMatch(outputs, hash) {
        return this.sendToDaemonViaQueue({
            type: 'OUTPUTS_HASHES_MATCH',
            data: {
                outputs,
                hash,
            },
        });
    }
    isServerAvailable() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                try {
                    const socket = (0, net_1.connect)(socket_utils_1.FULL_OS_SOCKET_PATH, () => {
                        socket.destroy();
                        resolve(true);
                    });
                    socket.once('error', () => {
                        resolve(false);
                    });
                }
                catch (err) {
                    resolve(false);
                }
            });
        });
    }
    sendToDaemonViaQueue(messageToDaemon) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.queue.sendToQueue(() => this.sendMessageToDaemon(messageToDaemon));
        });
    }
    setUpConnection() {
        this.socketMessenger = new socket_messenger_1.SocketMessenger((0, net_1.connect)(socket_utils_1.FULL_OS_SOCKET_PATH)).listen((message) => this.handleMessage(message), () => {
            // it's ok for the daemon to terminate if the client doesn't wait on
            // any messages from the daemon
            if (this.queue.isEmpty()) {
                this._connected = false;
            }
            else {
                output_1.output.error({
                    title: 'Daemon process terminated and closed the connection',
                    bodyLines: [
                        'Please rerun the command, which will restart the daemon.',
                    ],
                });
                process.exit(1);
            }
        }, (err) => {
            if (!err.message) {
                return this.currentReject(daemonProcessException(err.toString()));
            }
            if (err.message.startsWith('LOCK-FILES-CHANGED')) {
                // retry the current message
                // we cannot send it via the queue because we are in the middle of processing
                // a message from the queue
                return this.sendMessageToDaemon(this.currentMessage).then(this.currentResolve, this.currentReject);
            }
            let error;
            if (err.message.startsWith('connect ENOENT')) {
                error = daemonProcessException('The Daemon Server is not running');
            }
            else if (err.message.startsWith('connect ECONNREFUSED')) {
                error = daemonProcessException(`A server instance had not been fully shut down. Please try running the command again.`);
                (0, socket_utils_1.killSocketOrPath)();
            }
            else if (err.message.startsWith('read ECONNRESET')) {
                error = daemonProcessException(`Unable to connect to the daemon process.`);
            }
            else {
                error = daemonProcessException(err.toString());
            }
            return this.currentReject(error);
        });
    }
    sendMessageToDaemon(message) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this._connected) {
                this._connected = true;
                if (!(yield this.isServerAvailable())) {
                    yield this.startInBackground();
                }
                this.setUpConnection();
            }
            return new Promise((resolve, reject) => {
                perf_hooks_1.performance.mark('sendMessageToDaemon-start');
                this.currentMessage = message;
                this.currentResolve = resolve;
                this.currentReject = reject;
                this.socketMessenger.sendMessage(message);
            });
        });
    }
    handleMessage(serializedResult) {
        try {
            perf_hooks_1.performance.mark('json-parse-start');
            const parsedResult = JSON.parse(serializedResult);
            perf_hooks_1.performance.mark('json-parse-end');
            perf_hooks_1.performance.measure('deserialize daemon response', 'json-parse-start', 'json-parse-end');
            if (parsedResult.error) {
                this.currentReject(parsedResult.error);
            }
            else {
                perf_hooks_1.performance.measure('total for sendMessageToDaemon()', 'sendMessageToDaemon-start', 'json-parse-end');
                return this.currentResolve(parsedResult);
            }
        }
        catch (e) {
            const endOfResponse = serializedResult.length > 300
                ? serializedResult.substring(serializedResult.length - 300)
                : serializedResult;
            this.currentReject(daemonProcessException([
                'Could not deserialize response from Nx daemon.',
                `Message: ${e.message}`,
                '\n',
                `Received:`,
                endOfResponse,
                '\n',
            ].join('\n')));
        }
    }
    startInBackground() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield (0, cache_1.safelyCleanUpExistingProcess)();
            (0, fs_extra_1.ensureDirSync)(tmp_dir_1.DAEMON_DIR_FOR_CURRENT_WORKSPACE);
            (0, fs_extra_1.ensureFileSync)(tmp_dir_1.DAEMON_OUTPUT_LOG_FILE);
            const out = (0, fs_1.openSync)(tmp_dir_1.DAEMON_OUTPUT_LOG_FILE, 'a');
            const err = (0, fs_1.openSync)(tmp_dir_1.DAEMON_OUTPUT_LOG_FILE, 'a');
            const backgroundProcess = (0, child_process_1.spawn)(process.execPath, [(0, path_1.join)(__dirname, '../server/start.js')], {
                cwd: workspace_root_1.workspaceRoot,
                stdio: ['ignore', out, err],
                detached: true,
                windowsHide: true,
                shell: false,
                env: DAEMON_ENV_SETTINGS,
            });
            backgroundProcess.unref();
            //
            // Persist metadata about the background process so that it can be cleaned up later if needed
            yield (0, cache_1.writeDaemonJsonProcessCache)({
                processId: backgroundProcess.pid,
            });
            /**
             * Ensure the server is actually available to connect to via IPC before resolving
             */
            let attempts = 0;
            return new Promise((resolve, reject) => {
                const id = setInterval(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    if (yield this.isServerAvailable()) {
                        clearInterval(id);
                        resolve(backgroundProcess.pid);
                    }
                    else if (attempts > 1000) {
                        // daemon fails to start, the process probably exited
                        // we print the logs and exit the client
                        reject(daemonProcessException('Failed to start or connect to the Nx Daemon process.'));
                    }
                    else {
                        attempts++;
                    }
                }), 10);
            });
        });
    }
    stop() {
        (0, child_process_1.spawnSync)(process.execPath, ['../server/stop.js'], {
            cwd: __dirname,
            stdio: 'inherit',
        });
        (0, tmp_dir_1.removeSocketDir)();
        output_1.output.log({ title: 'Daemon Server - Stopped' });
    }
}
exports.DaemonClient = DaemonClient;
exports.daemonClient = new DaemonClient((0, configuration_1.readNxJson)());
function isDocker() {
    try {
        (0, fs_1.statSync)('/.dockerenv');
        return true;
    }
    catch (_a) {
        return false;
    }
}
function nxJsonIsNotPresent() {
    return !new workspaces_1.Workspaces(workspace_root_1.workspaceRoot).hasNxJson();
}
function daemonProcessException(message) {
    try {
        let log = (0, fs_1.readFileSync)(tmp_dir_1.DAEMON_OUTPUT_LOG_FILE).toString().split('\n');
        if (log.length > 20) {
            log = log.slice(log.length - 20);
        }
        const error = new Error([
            message,
            '',
            'Messages from the log:',
            ...log,
            '\n',
            `More information: ${tmp_dir_1.DAEMON_OUTPUT_LOG_FILE}`,
        ].join('\n'));
        error.internalDaemonError = true;
        return error;
    }
    catch (e) {
        return new Error(message);
    }
}
//# sourceMappingURL=client.js.map