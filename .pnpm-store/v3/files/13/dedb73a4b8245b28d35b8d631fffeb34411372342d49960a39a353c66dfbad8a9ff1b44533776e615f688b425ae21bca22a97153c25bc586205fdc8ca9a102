"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.daemonHandler = void 0;
const tslib_1 = require("tslib");
const tmp_dir_1 = require("../daemon/tmp-dir");
const output_1 = require("../utils/output");
const generate_help_output_1 = require("../daemon/client/generate-help-output");
function daemonHandler(args) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (args.start) {
            const { daemonClient } = yield Promise.resolve().then(() => require('../daemon/client/client'));
            const pid = yield daemonClient.startInBackground();
            output_1.output.log({
                title: `Daemon Server - Started in a background process...`,
                bodyLines: [
                    `${output_1.output.dim('Logs from the Daemon process (')}ID: ${pid}${output_1.output.dim(') can be found here:')} ${tmp_dir_1.DAEMON_OUTPUT_LOG_FILE}\n`,
                ],
            });
        }
        else if (args.stop) {
            const { daemonClient } = yield Promise.resolve().then(() => require('../daemon/client/client'));
            daemonClient.stop();
        }
        else {
            console.log((0, generate_help_output_1.generateDaemonHelpOutput)());
        }
    });
}
exports.daemonHandler = daemonHandler;
//# sourceMappingURL=daemon.js.map