"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDaemonProcessId = exports.safelyCleanUpExistingProcess = exports.writeDaemonJsonProcessCache = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const tmp_dir_1 = require("./tmp-dir");
const serverProcessJsonPath = (0, path_1.join)(tmp_dir_1.DAEMON_DIR_FOR_CURRENT_WORKSPACE, 'server-process.json');
function readDaemonProcessJsonCache() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!(0, fs_extra_1.existsSync)(serverProcessJsonPath)) {
            return null;
        }
        return yield (0, fs_extra_1.readJson)(serverProcessJsonPath);
    });
}
function deleteDaemonJsonProcessCache() {
    try {
        (0, fs_extra_1.unlinkSync)(serverProcessJsonPath);
    }
    catch (_a) { }
}
function writeDaemonJsonProcessCache(daemonJson) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield (0, fs_extra_1.writeJson)(serverProcessJsonPath, daemonJson);
    });
}
exports.writeDaemonJsonProcessCache = writeDaemonJsonProcessCache;
function safelyCleanUpExistingProcess() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const daemonProcessJson = yield readDaemonProcessJsonCache();
        if (daemonProcessJson && daemonProcessJson.processId) {
            try {
                process.kill(daemonProcessJson.processId);
            }
            catch (_a) { }
        }
        deleteDaemonJsonProcessCache();
    });
}
exports.safelyCleanUpExistingProcess = safelyCleanUpExistingProcess;
// Must be sync for the help output use case
function getDaemonProcessId() {
    if (!(0, fs_extra_1.existsSync)(serverProcessJsonPath)) {
        return null;
    }
    try {
        const daemonProcessJson = require(serverProcessJsonPath);
        return daemonProcessJson.processId;
    }
    catch (_a) {
        return null;
    }
}
exports.getDaemonProcessId = getDaemonProcessId;
//# sourceMappingURL=cache.js.map