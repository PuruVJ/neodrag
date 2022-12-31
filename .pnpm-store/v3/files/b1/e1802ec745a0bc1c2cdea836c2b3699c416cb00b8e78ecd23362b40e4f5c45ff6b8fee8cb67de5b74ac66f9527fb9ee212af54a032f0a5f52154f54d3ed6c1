"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markRootPackageJsonAsNxProject = exports.addNxToNpmRepo = void 0;
const tslib_1 = require("tslib");
const output_1 = require("../utils/output");
const yargsParser = require("yargs-parser");
const enquirer = require("enquirer");
const fileutils_1 = require("../utils/fileutils");
const utils_1 = require("./utils");
const path_1 = require("nx/src/utils/path");
const parsedArgs = yargsParser(process.argv, {
    boolean: ['yes'],
    string: ['cacheable'],
    alias: {
        yes: ['y'],
    },
});
function addNxToNpmRepo() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const repoRoot = process.cwd();
        output_1.output.log({ title: `🐳 Nx initialization` });
        let cacheableOperations;
        let scriptOutputs = {};
        let useCloud;
        const packageJson = (0, fileutils_1.readJsonFile)('package.json');
        const scripts = Object.keys(packageJson.scripts).filter((s) => !s.startsWith('pre') && !s.startsWith('post'));
        if (parsedArgs.yes !== true) {
            output_1.output.log({
                title: `🧑‍🔧 Please answer the following questions about the scripts found in your package.json in order to generate task runner configuration`,
            });
            cacheableOperations = (yield enquirer.prompt([
                {
                    type: 'multiselect',
                    name: 'cacheableOperations',
                    message: 'Which of the following scripts are cacheable? (Produce the same output given the same input, e.g. build, test and lint usually are, serve and start are not)',
                    choices: scripts,
                },
            ])).cacheableOperations;
            for (const scriptName of cacheableOperations) {
                // eslint-disable-next-line no-await-in-loop
                scriptOutputs[scriptName] = (yield enquirer.prompt([
                    {
                        type: 'input',
                        name: scriptName,
                        message: `Does the "${scriptName}" script create any outputs? If not, leave blank, otherwise provide a path (e.g. dist, lib, build, coverage)`,
                    },
                ]))[scriptName];
            }
            useCloud = yield (0, utils_1.askAboutNxCloud)();
        }
        else {
            cacheableOperations = parsedArgs.cacheable
                ? parsedArgs.cacheable.split(',')
                : [];
            useCloud = false;
        }
        (0, utils_1.createNxJsonFile)(repoRoot, [], cacheableOperations, {}, packageJson.name);
        (0, utils_1.addDepsToPackageJson)(repoRoot, useCloud);
        markRootPackageJsonAsNxProject(repoRoot, cacheableOperations, scriptOutputs);
        output_1.output.log({ title: `📦 Installing dependencies` });
        (0, utils_1.runInstall)(repoRoot);
        if (useCloud) {
            (0, utils_1.initCloud)(repoRoot);
        }
        printFinalMessage();
    });
}
exports.addNxToNpmRepo = addNxToNpmRepo;
function printFinalMessage() {
    output_1.output.success({
        title: `🎉 Done!`,
        bodyLines: [
            `- Enabled computation caching!`,
            `- Learn more at https://nx.dev/recipes/adopting-nx/adding-to-monorepo`,
        ],
    });
}
function markRootPackageJsonAsNxProject(repoRoot, cacheableScripts, scriptOutputs) {
    const json = (0, fileutils_1.readJsonFile)((0, path_1.joinPathFragments)(repoRoot, `package.json`));
    json.nx = { targets: {} };
    for (let script of Object.keys(scriptOutputs)) {
        if (scriptOutputs[script]) {
            json.nx.targets[script] = {
                outputs: [`{projectRoot}/${scriptOutputs[script]}`],
            };
        }
    }
    for (let script of cacheableScripts) {
        if (json.scripts[script]) {
            json.scripts[script] = `nx exec -- ${json.scripts[script]}`;
        }
    }
    (0, fileutils_1.writeJsonFile)(`package.json`, json);
}
exports.markRootPackageJsonAsNxProject = markRootPackageJsonAsNxProject;
//# sourceMappingURL=add-nx-to-npm-repo.js.map