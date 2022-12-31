"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initHandler = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const fileutils_1 = require("../utils/fileutils");
const add_nx_to_npm_repo_1 = require("../nx-init/add-nx-to-npm-repo");
function initHandler() {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const args = process.argv.slice(2).join(' ');
        const version = (_a = process.env.NX_VERSION) !== null && _a !== void 0 ? _a : 'latest';
        if (process.env.NX_VERSION) {
            console.log(`Using version ${process.env.NX_VERSION}`);
        }
        if ((0, fs_1.existsSync)('package.json')) {
            if ((0, fs_1.existsSync)('angular.json')) {
                // TODO(leo): remove make-angular-cli-faster
                (0, child_process_1.execSync)(`npx --yes make-angular-cli-faster@${version} ${args}`, {
                    stdio: [0, 1, 2],
                });
            }
            else if (isCRA()) {
                // TODO(jack): remove cra-to-nx
                (0, child_process_1.execSync)(`npx --yes cra-to-nx@${version} ${args}`, {
                    stdio: [0, 1, 2],
                });
            }
            else if (isMonorepo()) {
                // TODO: vsavkin remove add-nx-to-monorepo
                (0, child_process_1.execSync)(`npx --yes add-nx-to-monorepo@${version} ${args}`, {
                    stdio: [0, 1, 2],
                });
            }
            else {
                yield (0, add_nx_to_npm_repo_1.addNxToNpmRepo)();
            }
        }
        else {
            (0, child_process_1.execSync)(`npx --yes create-nx-workspace@${version} ${args}`, {
                stdio: [0, 1, 2],
            });
        }
    });
}
exports.initHandler = initHandler;
function isCRA() {
    const packageJson = (0, fileutils_1.readJsonFile)('package.json');
    const combinedDependencies = Object.assign(Object.assign({}, packageJson.dependencies), packageJson.devDependencies);
    return (
    // Required dependencies for CRA projects
    combinedDependencies['react'] &&
        combinedDependencies['react-dom'] &&
        combinedDependencies['react-scripts'] &&
        // // Don't convert customized CRA projects
        !combinedDependencies['react-app-rewired'] &&
        !combinedDependencies['@craco/craco'] &&
        (0, fileutils_1.directoryExists)('src') &&
        (0, fileutils_1.directoryExists)('public'));
}
function isMonorepo() {
    const packageJson = (0, fileutils_1.readJsonFile)('package.json');
    if (!!packageJson.workspaces)
        return true;
    if ((0, fs_1.existsSync)('pnpm-workspace.yaml') || (0, fs_1.existsSync)('pnpm-workspace.yml'))
        return true;
    if ((0, fs_1.existsSync)('lerna.json'))
        return true;
    return false;
}
//# sourceMappingURL=init.js.map