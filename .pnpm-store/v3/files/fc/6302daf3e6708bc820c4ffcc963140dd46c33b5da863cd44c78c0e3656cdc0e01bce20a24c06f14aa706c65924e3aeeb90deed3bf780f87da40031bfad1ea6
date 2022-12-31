"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const output_1 = require("../../utils/output");
const cache_1 = require("../cache");
const server_1 = require("./server");
(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, server_1.stopServer)();
        yield (0, cache_1.safelyCleanUpExistingProcess)();
    }
    catch (err) {
        output_1.output.error({
            title: (err === null || err === void 0 ? void 0 : err.message) ||
                'Something unexpected went wrong when stopping the server',
        });
    }
}))();
//# sourceMappingURL=stop.js.map