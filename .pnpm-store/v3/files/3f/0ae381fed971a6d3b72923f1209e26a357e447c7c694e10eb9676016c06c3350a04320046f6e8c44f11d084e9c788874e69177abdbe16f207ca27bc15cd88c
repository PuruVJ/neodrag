"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const output_1 = require("../../utils/output");
const server_1 = require("./server");
const process = require("process");
(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, server_1.startServer)();
    }
    catch (err) {
        output_1.output.error({
            title: (err === null || err === void 0 ? void 0 : err.message) ||
                'Something unexpected went wrong when starting the server',
        });
        process.exit(1);
    }
}))();
//# sourceMappingURL=start.js.map