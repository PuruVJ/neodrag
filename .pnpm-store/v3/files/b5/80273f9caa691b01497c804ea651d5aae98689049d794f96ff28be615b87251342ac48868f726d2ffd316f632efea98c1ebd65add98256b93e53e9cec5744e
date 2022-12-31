"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectsToRun = exports.runMany = void 0;
const tslib_1 = require("tslib");
const run_command_1 = require("../tasks-runner/run-command");
const command_line_utils_1 = require("../utils/command-line-utils");
const project_graph_utils_1 = require("../utils/project-graph-utils");
const connect_1 = require("./connect");
const perf_hooks_1 = require("perf_hooks");
const minimatch = require("minimatch");
const project_graph_1 = require("../project-graph/project-graph");
const configuration_1 = require("../config/configuration");
const output_1 = require("../utils/output");
function runMany(args, extraTargetDependencies = {}, extraOptions = { excludeTaskDependencies: false, loadDotEnvFiles: true }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        perf_hooks_1.performance.mark('command-execution-begins');
        const nxJson = (0, configuration_1.readNxJson)();
        const { nxArgs, overrides } = (0, command_line_utils_1.splitArgsIntoNxArgsAndOverrides)(args, 'run-many', { printWarnings: true }, nxJson);
        if (nxArgs.verbose) {
            process.env.NX_VERBOSE_LOGGING = 'true';
        }
        yield (0, connect_1.connectToNxCloudIfExplicitlyAsked)(nxArgs);
        const projectGraph = yield (0, project_graph_1.createProjectGraphAsync)({ exitOnError: true });
        const projects = projectsToRun(nxArgs, projectGraph);
        yield (0, run_command_1.runCommand)(projects, projectGraph, { nxJson }, nxArgs, overrides, null, extraTargetDependencies, extraOptions);
    });
}
exports.runMany = runMany;
function projectsToRun(nxArgs, projectGraph) {
    var _a;
    const selectedProjects = new Map();
    const validProjects = runnableForTarget(projectGraph.nodes, nxArgs.targets);
    const validProjectNames = Array.from(validProjects.keys());
    const invalidProjects = [];
    // --all is default now, if --projects is provided, it'll override the --all
    if (nxArgs.all && nxArgs.projects.length === 0) {
        for (const projectName of validProjects) {
            selectedProjects.set(projectName, projectGraph.nodes[projectName]);
        }
    }
    else {
        for (const nameOrGlob of nxArgs.projects) {
            if (validProjects.has(nameOrGlob)) {
                selectedProjects.set(nameOrGlob, projectGraph.nodes[nameOrGlob]);
                continue;
            }
            else if (projectGraph.nodes[nameOrGlob]) {
                invalidProjects.push(nameOrGlob);
                continue;
            }
            const matchedProjectNames = minimatch.match(validProjectNames, nameOrGlob);
            if (matchedProjectNames.length === 0) {
                throw new Error(`No projects matching: ${nameOrGlob}`);
            }
            matchedProjectNames.forEach((matchedProjectName) => {
                selectedProjects.set(matchedProjectName, projectGraph.nodes[matchedProjectName]);
            });
        }
        if (invalidProjects.length > 0) {
            output_1.output.warn({
                title: `the following do not have configuration for "${nxArgs.target}"`,
                bodyLines: invalidProjects.map((name) => `- ${name}`),
            });
        }
    }
    for (const nameOrGlob of (_a = nxArgs.exclude) !== null && _a !== void 0 ? _a : []) {
        const project = selectedProjects.has(nameOrGlob);
        if (project) {
            selectedProjects.delete(nameOrGlob);
            continue;
        }
        const matchedProjects = minimatch.match(Array.from(selectedProjects.keys()), nameOrGlob);
        matchedProjects.forEach((matchedProjectName) => {
            selectedProjects.delete(matchedProjectName);
        });
    }
    return Array.from(selectedProjects.values());
}
exports.projectsToRun = projectsToRun;
function runnableForTarget(projects, targets) {
    const runnable = new Set();
    for (let projectName in projects) {
        const project = projects[projectName];
        if (targets.find((target) => (0, project_graph_utils_1.projectHasTarget)(project, target))) {
            runnable.add(projectName);
        }
    }
    return runnable;
}
//# sourceMappingURL=run-many.js.map