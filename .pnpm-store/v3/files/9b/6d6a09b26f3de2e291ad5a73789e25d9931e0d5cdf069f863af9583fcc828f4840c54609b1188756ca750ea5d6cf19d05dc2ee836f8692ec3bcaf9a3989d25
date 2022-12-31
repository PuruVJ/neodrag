"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondWithErrorAndExit = exports.respondToClient = exports.resetInactivityTimeout = exports.handleServerProcessTermination = exports.storeOutputsWatcherSubscription = exports.storeSourceWatcherSubscription = exports.getOutputsWatcherSubscription = exports.getSourceWatcherSubscription = exports.SERVER_INACTIVITY_TIMEOUT_MS = void 0;
const tslib_1 = require("tslib");
const workspace_root_1 = require("../../utils/workspace-root");
const logger_1 = require("./logger");
const socket_utils_1 = require("../socket-utils");
exports.SERVER_INACTIVITY_TIMEOUT_MS = 10800000; // 10800000 ms = 3 hours
let sourceWatcherSubscription;
let outputsWatcherSubscription;
function getSourceWatcherSubscription() {
    return sourceWatcherSubscription;
}
exports.getSourceWatcherSubscription = getSourceWatcherSubscription;
function getOutputsWatcherSubscription() {
    return outputsWatcherSubscription;
}
exports.getOutputsWatcherSubscription = getOutputsWatcherSubscription;
function storeSourceWatcherSubscription(s) {
    sourceWatcherSubscription = s;
}
exports.storeSourceWatcherSubscription = storeSourceWatcherSubscription;
function storeOutputsWatcherSubscription(s) {
    outputsWatcherSubscription = s;
}
exports.storeOutputsWatcherSubscription = storeOutputsWatcherSubscription;
function handleServerProcessTermination({ server, reason, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            server.close();
            if (sourceWatcherSubscription) {
                yield sourceWatcherSubscription.unsubscribe();
                logger_1.serverLogger.watcherLog(`Unsubscribed from changes within: ${workspace_root_1.workspaceRoot} (sources)`);
            }
            if (outputsWatcherSubscription) {
                yield outputsWatcherSubscription.unsubscribe();
                logger_1.serverLogger.watcherLog(`Unsubscribed from changes within: ${workspace_root_1.workspaceRoot} (outputs)`);
            }
            logger_1.serverLogger.log(`Server stopped because: "${reason}"`);
        }
        finally {
            process.exit(0);
        }
    });
}
exports.handleServerProcessTermination = handleServerProcessTermination;
let serverInactivityTimerId;
function resetInactivityTimeout(cb) {
    if (serverInactivityTimerId) {
        clearTimeout(serverInactivityTimerId);
    }
    serverInactivityTimerId = setTimeout(cb, exports.SERVER_INACTIVITY_TIMEOUT_MS);
}
exports.resetInactivityTimeout = resetInactivityTimeout;
function respondToClient(socket, response, description) {
    return new Promise((res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (description) {
            logger_1.serverLogger.requestLog(`Responding to the client.`, description);
        }
        socket.write(`${response}${String.fromCodePoint(4)}`, (err) => {
            if (err) {
                console.error(err);
            }
            logger_1.serverLogger.log(`Done responding to the client`, description);
            res(null);
        });
    }));
}
exports.respondToClient = respondToClient;
function respondWithErrorAndExit(socket, description, error) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // print some extra stuff in the error message
        logger_1.serverLogger.requestLog(`Responding to the client with an error.`, description, error.message);
        console.error(error);
        error.message = `${error.message}\n\nBecause of the error the Nx daemon process has exited. The next Nx command is going to restart the daemon process.\nIf the error persists, please run "nx reset".`;
        yield respondToClient(socket, (0, socket_utils_1.serializeResult)(error, null), null);
        process.exit(1);
    });
}
exports.respondWithErrorAndExit = respondWithErrorAndExit;
//# sourceMappingURL=shutdown-utils.js.map