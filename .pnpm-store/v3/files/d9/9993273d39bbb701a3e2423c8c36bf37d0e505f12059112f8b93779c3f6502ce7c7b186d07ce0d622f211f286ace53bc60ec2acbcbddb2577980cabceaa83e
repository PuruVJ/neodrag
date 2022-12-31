"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToNxCloudCommand = exports.connectToNxCloudIfExplicitlyAsked = void 0;
const tslib_1 = require("tslib");
const output_1 = require("../utils/output");
const package_manager_1 = require("../utils/package-manager");
const child_process_1 = require("child_process");
const configuration_1 = require("../config/configuration");
const nx_cloud_utils_1 = require("../utils/nx-cloud-utils");
function connectToNxCloudIfExplicitlyAsked(opts) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (opts['cloud'] === true) {
            const nxJson = (0, configuration_1.readNxJson)();
            const runners = Object.values(nxJson.tasksRunnerOptions);
            const onlyDefaultRunnerIsUsed = runners.length === 1 && runners[0].runner === 'nx/tasks-runners/default';
            if (!onlyDefaultRunnerIsUsed)
                return;
            output_1.output.log({
                title: '--cloud requires the workspace to be connected to Nx Cloud.',
            });
            const pmc = (0, package_manager_1.getPackageManagerCommand)();
            (0, child_process_1.execSync)(`${pmc.exec} nx connect-to-nx-cloud`, {
                stdio: [0, 1, 2],
            });
            output_1.output.success({
                title: 'Your workspace has been successfully connected to Nx Cloud.',
            });
            process.exit(0);
        }
    });
}
exports.connectToNxCloudIfExplicitlyAsked = connectToNxCloudIfExplicitlyAsked;
function connectToNxCloudCommand(promptOverride) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if ((0, nx_cloud_utils_1.isNxCloudUsed)()) {
            output_1.output.log({
                title: 'This workspace is already connected to Nx Cloud.',
            });
            return false;
        }
        const res = yield connectToNxCloudPrompt(promptOverride);
        if (!res)
            return false;
        const pmc = (0, package_manager_1.getPackageManagerCommand)();
        (0, child_process_1.execSync)(`${pmc.addDev} @nrwl/nx-cloud@latest`);
        (0, child_process_1.execSync)(`${pmc.exec} nx g @nrwl/nx-cloud:init`, {
            stdio: [0, 1, 2],
        });
        return true;
    });
}
exports.connectToNxCloudCommand = connectToNxCloudCommand;
function connectToNxCloudPrompt(prompt) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return yield (yield Promise.resolve().then(() => require('enquirer')))
            .prompt([
            {
                name: 'NxCloud',
                message: prompt !== null && prompt !== void 0 ? prompt : `Enable distributed caching to make your CI faster`,
                type: 'autocomplete',
                choices: [
                    {
                        name: 'Yes',
                        hint: 'I want faster builds',
                    },
                    {
                        name: 'No',
                    },
                ],
                initial: 'Yes',
            },
        ])
            .then((a) => a.NxCloud === 'Yes');
    });
}
//# sourceMappingURL=connect.js.map