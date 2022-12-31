"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewLogsFooterRows = void 0;
const nx_cloud_utils_1 = require("../../utils/nx-cloud-utils");
const output_1 = require("../../utils/output");
const VIEW_LOGS_MESSAGE = `Hint: Try "nx view-logs" to get structured, searchable errors logs in your browser.`;
function viewLogsFooterRows(failedTasks) {
    if (failedTasks >= 2 && !(0, nx_cloud_utils_1.isNxCloudUsed)()) {
        return [``, output_1.output.dim(`${output_1.output.X_PADDING} ${VIEW_LOGS_MESSAGE}`)];
    }
    else {
        return [];
    }
}
exports.viewLogsFooterRows = viewLogsFooterRows;
//# sourceMappingURL=view-logs-utils.js.map