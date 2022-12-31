"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetHandler = void 0;
const fs_extra_1 = require("fs-extra");
const client_1 = require("../daemon/client/client");
const cache_directory_1 = require("../utils/cache-directory");
const output_1 = require("../utils/output");
function resetHandler() {
    output_1.output.note({
        title: 'Resetting the Nx workspace cache and stopping the Nx Daemon.',
        bodyLines: [`This might take a few minutes.`],
    });
    client_1.daemonClient.stop();
    (0, fs_extra_1.removeSync)(cache_directory_1.cacheDir);
    if (cache_directory_1.projectGraphCacheDirectory !== cache_directory_1.cacheDir) {
        (0, fs_extra_1.removeSync)(cache_directory_1.projectGraphCacheDirectory);
    }
    output_1.output.success({
        title: 'Successfully reset the Nx workspace.',
    });
}
exports.resetHandler = resetHandler;
//# sourceMappingURL=reset.js.map