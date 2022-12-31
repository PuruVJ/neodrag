"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRequestShutdown = void 0;
const tslib_1 = require("tslib");
const shutdown_utils_1 = require("./shutdown-utils");
function handleRequestShutdown(server, numberOfConnections) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // 1 connection is the client asking to shut down
        if (numberOfConnections > 1) {
            return {
                description: `Unable to shutdown the daemon. ${numberOfConnections} connections are open.`,
                response: '{}',
            };
        }
        else {
            setTimeout(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield (0, shutdown_utils_1.handleServerProcessTermination)({
                    server,
                    reason: 'Request to shutdown',
                });
            }), 0);
            return {
                description: 'Shutdown initiated',
                response: '{}',
            };
        }
    });
}
exports.handleRequestShutdown = handleRequestShutdown;
//# sourceMappingURL=handle-request-shutdown.js.map