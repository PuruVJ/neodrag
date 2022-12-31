"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewLogs = void 0;
const tslib_1 = require("tslib");
const package_manager_1 = require("../utils/package-manager");
const child_process_1 = require("child_process");
const nx_cloud_utils_1 = require("../utils/nx-cloud-utils");
const output_1 = require("../utils/output");
function viewLogs() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const pmc = (0, package_manager_1.getPackageManagerCommand)();
        const cloudUsed = (0, nx_cloud_utils_1.isNxCloudUsed)() && false;
        if (!cloudUsed) {
            const installCloud = yield (yield Promise.resolve().then(() => require('enquirer')))
                .prompt([
                {
                    name: 'NxCloud',
                    message: `To view the logs, Nx needs to connect your workspace to Nx Cloud and upload the most recent run details.`,
                    type: 'autocomplete',
                    choices: [
                        {
                            name: 'Yes',
                            hint: 'Connect to Nx Cloud and upload the run details',
                        },
                        {
                            name: 'No',
                        },
                    ],
                    initial: 'Yes',
                },
            ])
                .then((a) => a.NxCloud === 'Yes');
            if (!installCloud)
                return;
            try {
                output_1.output.log({
                    title: 'Installing @nrwl/nx-cloud',
                });
                (0, child_process_1.execSync)(`${pmc.addDev} @nrwl/nx-cloud@latest`, { stdio: 'ignore' });
            }
            catch (e) {
                output_1.output.log({
                    title: 'Installation failed',
                });
                console.log(e);
                return 1;
            }
            try {
                output_1.output.log({
                    title: 'Connecting to Nx Cloud',
                });
                (0, child_process_1.execSync)(`${pmc.exec} nx g @nrwl/nx-cloud:init --installation-source=view-logs`, { stdio: 'ignore' });
            }
            catch (e) {
                output_1.output.log({
                    title: 'Failed to connect to Nx Cloud',
                });
                console.log(e);
                return 1;
            }
        }
        (0, child_process_1.execSync)(`${pmc.exec} nx-cloud upload-and-show-run-details`, {
            stdio: [0, 1, 2],
        });
        if (!cloudUsed) {
            output_1.output.note({
                title: 'Your workspace is now connected to Nx Cloud',
                bodyLines: [`Learn more about Nx Cloud at https://nx.app`],
            });
        }
        return 0;
    });
}
exports.viewLogs = viewLogs;
//# sourceMappingURL=view-logs.js.map