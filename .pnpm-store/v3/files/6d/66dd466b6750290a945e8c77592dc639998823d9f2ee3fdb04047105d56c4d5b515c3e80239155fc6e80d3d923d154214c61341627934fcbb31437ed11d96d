"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNxCloudUsed = void 0;
const configuration_1 = require("../config/configuration");
function isNxCloudUsed() {
    const nxJson = (0, configuration_1.readNxJson)();
    return Object.values(nxJson.tasksRunnerOptions).find((r) => r.runner == '@nrwl/nx-cloud');
}
exports.isNxCloudUsed = isNxCloudUsed;
//# sourceMappingURL=nx-cloud-utils.js.map