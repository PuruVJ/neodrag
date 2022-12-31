"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nxExecCommand = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const path_1 = require("path");
const process_1 = require("process");
const yargs = require("yargs-parser");
const configuration_1 = require("../config/configuration");
const project_graph_1 = require("../project-graph/project-graph");
const command_line_utils_1 = require("../utils/command-line-utils");
const fileutils_1 = require("../utils/fileutils");
const output_1 = require("../utils/output");
const package_manager_1 = require("../utils/package-manager");
const workspace_root_1 = require("../utils/workspace-root");
const run_one_1 = require("./run-one");
function nxExecCommand(args) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const scriptArgV = readScriptArgV(args);
        // NX is already running
        if (process.env.NX_TASK_TARGET_PROJECT) {
            const command = scriptArgV
                .reduce((cmd, arg) => cmd + `"${arg}" `, '')
                .trim();
            (0, child_process_1.execSync)(command, { stdio: 'inherit' });
        }
        else {
            // nx exec is being ran inside of Nx's context
            return runScriptAsNxTarget(scriptArgV);
        }
    });
}
exports.nxExecCommand = nxExecCommand;
function runScriptAsNxTarget(argv) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const projectGraph = yield (0, project_graph_1.createProjectGraphAsync)();
        const { projectName, project } = getProject(projectGraph);
        // NPM, Yarn, and PNPM set this to the name of the currently executing script. Lets use it if we can.
        const targetName = process.env.npm_lifecycle_event;
        const scriptDefinition = getScriptDefinition(project, targetName);
        ensureNxTarget(project, targetName);
        // Get ArgV that is provided in npm script definition
        const providedArgs = yargs(scriptDefinition)._.slice(2);
        const extraArgs = providedArgs.length === argv.length ? [] : argv.slice(providedArgs.length);
        const pm = (0, package_manager_1.getPackageManagerCommand)();
        // `targetName` might be an npm script with `:` like: `start:dev`, `start:debug`.
        let command = `${pm.exec} nx run ${projectName}:\\\"${targetName}\\\" ${extraArgs.join(' ')}`;
        return (0, child_process_1.execSync)(command, { stdio: 'inherit' });
    });
}
function readScriptArgV(args) {
    const { overrides } = (0, command_line_utils_1.splitArgsIntoNxArgsAndOverrides)(args, 'run-one', { printWarnings: false }, (0, configuration_1.readNxJson)());
    const scriptSeparatorIdx = process.argv.findIndex((el) => el === '--');
    if (scriptSeparatorIdx === -1) {
        output_1.output.error({
            title: '`nx exec` requires passing in a command after `--`',
        });
        process.exit(1);
    }
    return overrides.__overrides_unparsed__;
}
function getScriptDefinition(project, targetName) {
    const scriptDefinition = (0, fileutils_1.readJsonFile)((0, path_1.join)(workspace_root_1.workspaceRoot, project.data.root, 'package.json')).scripts[targetName];
    if (!scriptDefinition) {
        output_1.output.error({
            title: "`nx exec` is meant to be used in a project's package.json scripts",
            bodyLines: [
                `Nx was unable to find a npm script matching ${targetName} for ${project.name}`,
            ],
        });
        process.exit(1);
    }
    return scriptDefinition;
}
function ensureNxTarget(project, targetName) {
    if (!project.data.targets[targetName]) {
        output_1.output.error({
            title: `Nx cannot find a target called "${targetName}" for ${project.name}`,
            bodyLines: [
                `Is ${targetName} missing from ${project.data.root}/package.json's nx.includedScripts field?`,
            ],
        });
        (0, process_1.exit)(1);
    }
}
function getProject(projectGraph) {
    const projectName = (0, run_one_1.calculateDefaultProjectName)(process.cwd(), workspace_root_1.workspaceRoot, (0, project_graph_1.readProjectsConfigurationFromProjectGraph)(projectGraph));
    if (!projectName) {
        output_1.output.error({
            title: 'Unable to determine project name for `nx exec`',
            bodyLines: [
                "`nx exec` should be ran from within an Nx project's root directory.",
                'Does this package.json belong to an Nx project?',
            ],
        });
        process.exit(1);
    }
    const project = projectGraph.nodes[projectName];
    return { projectName, project };
}
//# sourceMappingURL=exec.js.map