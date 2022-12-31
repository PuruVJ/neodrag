"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOutputsHashesMatch = exports.handleRecordOutputsHash = void 0;
const tslib_1 = require("tslib");
const outputs_tracking_1 = require("./outputs-tracking");
function handleRecordOutputsHash(payload) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, outputs_tracking_1.recordOutputsHash)(payload.data.outputs, payload.data.hash);
            return {
                description: 'recordOutputsHash',
                response: '{}',
            };
        }
        catch (e) {
            return {
                description: 'recordOutputsHash failed',
                error: new Error(`Critical error when recording metadata about outputs: '${e.message}'.`),
            };
        }
    });
}
exports.handleRecordOutputsHash = handleRecordOutputsHash;
function handleOutputsHashesMatch(payload) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield (0, outputs_tracking_1.outputsHashesMatch)(payload.data.outputs, payload.data.hash);
            return {
                response: JSON.stringify(res),
                description: 'outputsHashesMatch',
            };
        }
        catch (e) {
            return {
                description: 'outputsHashesMatch failed',
                error: new Error(`Critical error when verifying the contents of the outputs haven't changed: '${e.message}'.`),
            };
        }
    });
}
exports.handleOutputsHashesMatch = handleOutputsHashesMatch;
//# sourceMappingURL=handle-outputs-tracking.js.map