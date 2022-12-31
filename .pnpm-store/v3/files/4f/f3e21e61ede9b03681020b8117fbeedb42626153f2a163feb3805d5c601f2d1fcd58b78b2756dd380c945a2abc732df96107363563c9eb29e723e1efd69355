"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCloud = exports.runInstall = exports.addDepsToPackageJson = exports.createNxJsonFile = exports.askAboutNxCloud = void 0;
const path_1 = require("../utils/path");
const fileutils_1 = require("../utils/fileutils");
const enquirer = require("enquirer");
const child_process_1 = require("child_process");
const package_manager_1 = require("../utils/package-manager");
function askAboutNxCloud() {
    return enquirer
        .prompt([
        {
            name: 'NxCloud',
            message: `Enable distributed caching to make your CI faster`,
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
}
exports.askAboutNxCloud = askAboutNxCloud;
function createNxJsonFile(repoRoot, targetDefaults, cacheableOperations, scriptOutputs, defaultProject) {
    var _a, _b, _c, _d, _e;
    const nxJsonPath = (0, path_1.joinPathFragments)(repoRoot, 'nx.json');
    let nxJson = {};
    try {
        nxJson = (0, fileutils_1.readJsonFile)(nxJsonPath);
        // eslint-disable-next-line no-empty
    }
    catch (_f) { }
    nxJson.tasksRunnerOptions || (nxJson.tasksRunnerOptions = {});
    (_a = nxJson.tasksRunnerOptions).default || (_a.default = {});
    (_b = nxJson.tasksRunnerOptions.default).runner || (_b.runner = 'nx/tasks-runners/default');
    (_c = nxJson.tasksRunnerOptions.default).options || (_c.options = {});
    nxJson.tasksRunnerOptions.default.options.cacheableOperations =
        cacheableOperations;
    if (targetDefaults.length > 0) {
        nxJson.targetDefaults || (nxJson.targetDefaults = {});
        for (const scriptName of targetDefaults) {
            (_d = nxJson.targetDefaults)[scriptName] || (_d[scriptName] = {});
            nxJson.targetDefaults[scriptName] = { dependsOn: [`^${scriptName}`] };
        }
        for (const [scriptName, output] of Object.entries(scriptOutputs)) {
            if (!output) {
                // eslint-disable-next-line no-continue
                continue;
            }
            (_e = nxJson.targetDefaults)[scriptName] || (_e[scriptName] = {});
            nxJson.targetDefaults[scriptName].outputs = [`{projectRoot}/${output}`];
        }
    }
    nxJson.defaultBase = deduceDefaultBase();
    (0, fileutils_1.writeJsonFile)(nxJsonPath, nxJson);
}
exports.createNxJsonFile = createNxJsonFile;
function deduceDefaultBase() {
    try {
        (0, child_process_1.execSync)(`git rev-parse --verify main`, {
            stdio: ['ignore', 'ignore', 'ignore'],
        });
        return 'main';
    }
    catch (_a) {
        try {
            (0, child_process_1.execSync)(`git rev-parse --verify dev`, {
                stdio: ['ignore', 'ignore', 'ignore'],
            });
            return 'dev';
        }
        catch (_b) {
            try {
                (0, child_process_1.execSync)(`git rev-parse --verify develop`, {
                    stdio: ['ignore', 'ignore', 'ignore'],
                });
                return 'develop';
            }
            catch (_c) {
                try {
                    (0, child_process_1.execSync)(`git rev-parse --verify next`, {
                        stdio: ['ignore', 'ignore', 'ignore'],
                    });
                    return 'next';
                }
                catch (_d) {
                    return 'master';
                }
            }
        }
    }
}
function addDepsToPackageJson(repoRoot, useCloud) {
    const path = (0, path_1.joinPathFragments)(repoRoot, `package.json`);
    const json = (0, fileutils_1.readJsonFile)(path);
    if (!json.devDependencies)
        json.devDependencies = {};
    json.devDependencies['nx'] = require('../../package.json').version;
    if (useCloud) {
        json.devDependencies['@nrwl/nx-cloud'] = 'latest';
    }
    (0, fileutils_1.writeJsonFile)(path, json);
}
exports.addDepsToPackageJson = addDepsToPackageJson;
function runInstall(repoRoot) {
    const pmc = (0, package_manager_1.getPackageManagerCommand)();
    (0, child_process_1.execSync)(pmc.install, { stdio: [0, 1, 2], cwd: repoRoot });
}
exports.runInstall = runInstall;
function initCloud(repoRoot) {
    const pmc = (0, package_manager_1.getPackageManagerCommand)();
    (0, child_process_1.execSync)(`${pmc.exec} nx g @nrwl/nx-cloud:init --installationSource=add-nx-to-monorepo`, {
        stdio: [0, 1, 2],
        cwd: repoRoot,
    });
}
exports.initCloud = initCloud;
//# sourceMappingURL=utils.js.map