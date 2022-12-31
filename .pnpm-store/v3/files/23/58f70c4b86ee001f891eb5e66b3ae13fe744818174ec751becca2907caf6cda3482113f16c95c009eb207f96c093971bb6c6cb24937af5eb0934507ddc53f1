"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleProcessInBackground = void 0;
const tslib_1 = require("tslib");
const workspace_root_1 = require("../../utils/workspace-root");
const logger_1 = require("./logger");
function handleProcessInBackground(payload) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let fn;
        try {
            fn = require(require.resolve(payload.requirePath, {
                paths: [workspace_root_1.workspaceRoot],
            })).default;
        }
        catch (e) {
            return {
                description: `Unable to require ${payload.requirePath}`,
                error: new Error(`Unable to require ${payload.requirePath}`),
            };
        }
        try {
            const response = yield fn(payload.data, logger_1.serverLogger);
            return {
                response,
                description: payload.type,
            };
        }
        catch (e) {
            return {
                description: `Error when processing ${payload.type}.`,
                error: e,
            };
        }
    });
}
exports.handleProcessInBackground = handleProcessInBackground;
//# sourceMappingURL=handle-process-in-background.js.map