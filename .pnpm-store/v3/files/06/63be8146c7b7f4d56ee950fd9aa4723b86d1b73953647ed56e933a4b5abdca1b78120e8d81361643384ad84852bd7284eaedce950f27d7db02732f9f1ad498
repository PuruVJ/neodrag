"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeResult = exports.killSocketOrPath = exports.FULL_OS_SOCKET_PATH = exports.isWindows = void 0;
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
const tmp_dir_1 = require("./tmp-dir");
exports.isWindows = (0, os_1.platform)() === 'win32';
/**
 * For IPC with the daemon server we use unix sockets or windows named pipes, depending on the user's operating system.
 *
 * See https://nodejs.org/dist/latest-v14.x/docs/api/net.html#net_identifying_paths_for_ipc_connections for a full breakdown
 * of OS differences between Unix domain sockets and named pipes.
 */
exports.FULL_OS_SOCKET_PATH = exports.isWindows
    ? '\\\\.\\pipe\\nx\\' + (0, path_1.resolve)(tmp_dir_1.DAEMON_SOCKET_PATH)
    : (0, path_1.resolve)(tmp_dir_1.DAEMON_SOCKET_PATH);
function killSocketOrPath() {
    try {
        (0, fs_1.unlinkSync)(exports.FULL_OS_SOCKET_PATH);
    }
    catch (_a) { }
}
exports.killSocketOrPath = killSocketOrPath;
// Include the original stack trace within the serialized error so that the client can show it to the user.
function serializeError(error) {
    if (!error) {
        return null;
    }
    return JSON.stringify(error, Object.getOwnPropertyNames(error));
}
// Prepare a serialized project graph result for sending over IPC from the server to the client
function serializeResult(error, serializedProjectGraph) {
    // We do not want to repeat work `JSON.stringify`ing an object containing the potentially large project graph so merge as strings
    return `{ "error": ${serializeError(error)}, "projectGraph": ${serializedProjectGraph} }`;
}
exports.serializeResult = serializeResult;
//# sourceMappingURL=socket-utils.js.map