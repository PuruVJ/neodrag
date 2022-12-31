"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unparse = exports.isCacheableTask = exports.shouldStreamOutput = exports.getSerializedArgsForTask = exports.getPrintableCommandArgsForTask = exports.getCliPath = exports.calculateReverseDeps = exports.removeTasksFromTaskGraph = exports.getCustomHasher = exports.getExecutorForTask = exports.getExecutorNameForTask = exports.interpolate = exports.getOutputsForTargetAndConfiguration = exports.transformLegacyOutputs = exports.validateOutputs = exports.getOutputs = exports.getDependencyConfigs = exports.getCommandAsString = void 0;
const output_1 = require("../utils/output");
const project_graph_utils_1 = require("../utils/project-graph-utils");
const fs_1 = require("fs");
const path_1 = require("path");
const nx_plugin_1 = require("../utils/nx-plugin");
const workspace_root_1 = require("../utils/workspace-root");
const path_2 = require("../utils/path");
const fileutils_1 = require("../utils/fileutils");
const serialize_overrides_into_command_line_1 = require("../utils/serialize-overrides-into-command-line");
function getCommandAsString(execCommand, task) {
    const args = getPrintableCommandArgsForTask(task);
    return [execCommand, 'nx', ...args].join(' ').trim();
}
exports.getCommandAsString = getCommandAsString;
function getDependencyConfigs({ project, target }, defaultDependencyConfigs, projectGraph) {
    var _a, _b, _c, _d;
    // DependencyConfigs configured in workspace.json override configurations at the root.
    const dependencyConfigs = expandDependencyConfigSyntaxSugar((_d = (_c = (_b = (_a = projectGraph.nodes[project].data) === null || _a === void 0 ? void 0 : _a.targets[target]) === null || _b === void 0 ? void 0 : _b.dependsOn) !== null && _c !== void 0 ? _c : defaultDependencyConfigs[target]) !== null && _d !== void 0 ? _d : []);
    for (const dependencyConfig of dependencyConfigs) {
        if (dependencyConfig.projects !== 'dependencies' &&
            dependencyConfig.projects !== 'self') {
            output_1.output.error({
                title: `dependsOn is improperly configured for ${project}:${target}`,
                bodyLines: [
                    `dependsOn.projects is "${dependencyConfig.projects}" but should be "self" or "dependencies"`,
                ],
            });
            process.exit(1);
        }
    }
    return dependencyConfigs;
}
exports.getDependencyConfigs = getDependencyConfigs;
function expandDependencyConfigSyntaxSugar(deps) {
    return deps.map((d) => {
        if (typeof d === 'string') {
            if (d.startsWith('^')) {
                return { projects: 'dependencies', target: d.substring(1) };
            }
            else {
                return { projects: 'self', target: d };
            }
        }
        else {
            return d;
        }
    });
}
function getOutputs(p, task) {
    return getOutputsForTargetAndConfiguration(task, p[task.target.project]);
}
exports.getOutputs = getOutputs;
class InvalidOutputsError extends Error {
    constructor(outputs, invalidOutputs) {
        super(InvalidOutputsError.createMessage(invalidOutputs));
        this.outputs = outputs;
        this.invalidOutputs = invalidOutputs;
    }
    static createMessage(invalidOutputs) {
        const invalidOutputsList = '\n - ' + Array.from(invalidOutputs).join('\n - ');
        return `The following outputs are invalid:${invalidOutputsList}\nPlease run "nx repair" to repair your configuration`;
    }
}
function validateOutputs(outputs) {
    const invalidOutputs = new Set();
    for (const output of outputs) {
        if (!/^{[\s\S]+}/.test(output)) {
            invalidOutputs.add(output);
        }
    }
    if (invalidOutputs.size > 0) {
        throw new InvalidOutputsError(outputs, invalidOutputs);
    }
}
exports.validateOutputs = validateOutputs;
function transformLegacyOutputs(projectRoot, error) {
    return error.outputs.map((output) => {
        if (!error.invalidOutputs.has(output)) {
            return output;
        }
        const relativePath = (0, fileutils_1.isRelativePath)(output)
            ? output
            : (0, path_1.relative)(projectRoot, output);
        const isWithinProject = !relativePath.startsWith('..');
        return (0, path_2.joinPathFragments)(isWithinProject ? '{projectRoot}' : '{workspaceRoot}', isWithinProject ? relativePath : output);
    });
}
exports.transformLegacyOutputs = transformLegacyOutputs;
/**
 * Returns the list of outputs that will be cached.
 * @param task target + overrides
 * @param node ProjectGraphProjectNode object that the task runs against
 */
function getOutputsForTargetAndConfiguration(task, node) {
    var _a;
    const { target, configuration } = task.target;
    const targetConfiguration = node.data.targets[target];
    const options = Object.assign(Object.assign(Object.assign({}, targetConfiguration.options), (_a = targetConfiguration === null || targetConfiguration === void 0 ? void 0 : targetConfiguration.configurations) === null || _a === void 0 ? void 0 : _a[configuration]), task.overrides);
    if (targetConfiguration === null || targetConfiguration === void 0 ? void 0 : targetConfiguration.outputs) {
        try {
            validateOutputs(targetConfiguration.outputs);
        }
        catch (error) {
            if (error instanceof InvalidOutputsError) {
                // TODO(v16): start warning for invalid outputs
                targetConfiguration.outputs = transformLegacyOutputs(node.data.root, error);
            }
            else {
                throw error;
            }
        }
        return targetConfiguration.outputs
            .map((output) => {
            return interpolate(output, {
                projectRoot: node.data.root,
                projectName: node.name,
                project: Object.assign(Object.assign({}, node.data), { name: node.name }),
                options,
            });
        })
            .filter((output) => !!output && !output.match(/{.*}/));
    }
    // Keep backwards compatibility in case `outputs` doesn't exist
    if (options.outputPath) {
        return Array.isArray(options.outputPath)
            ? options.outputPath
            : [options.outputPath];
    }
    else if (target === 'build' || target === 'prepare') {
        return [
            `dist/${node.data.root}`,
            `${node.data.root}/dist`,
            `${node.data.root}/build`,
            `${node.data.root}/public`,
        ];
    }
    else {
        return [];
    }
}
exports.getOutputsForTargetAndConfiguration = getOutputsForTargetAndConfiguration;
function interpolate(template, data) {
    if (template.includes('{workspaceRoot}', 1)) {
        throw new Error(`Output '${template}' is invalid. {workspaceRoot} can only be used at the beginning of the expression.`);
    }
    if (data.projectRoot == '.' && template.includes('{projectRoot}', 1)) {
        throw new Error(`Output '${template}' is invalid. When {projectRoot} is '.', it can only be used at the beginning of the expression.`);
    }
    let res = template.replace('{workspaceRoot}/', '');
    if (data.projectRoot == '.') {
        res = res.replace('{projectRoot}/', '');
    }
    return res.replace(/{([\s\S]+?)}/g, (match) => {
        let value = data;
        let path = match.slice(1, -1).trim().split('.');
        for (let idx = 0; idx < path.length; idx++) {
            if (!value[path[idx]]) {
                return match;
            }
            value = value[path[idx]];
        }
        return value;
    });
}
exports.interpolate = interpolate;
function getExecutorNameForTask(task, nxJson, projectGraph) {
    const project = projectGraph.nodes[task.target.project].data;
    const projectRoot = (0, path_1.join)(workspace_root_1.workspaceRoot, project.root);
    if ((0, fs_1.existsSync)((0, path_1.join)(projectRoot, 'package.json'))) {
        project.targets = (0, project_graph_utils_1.mergeNpmScriptsWithTargets)(projectRoot, project.targets);
    }
    project.targets = (0, nx_plugin_1.mergePluginTargetsWithNxTargets)(project.root, project.targets, (0, nx_plugin_1.loadNxPlugins)(nxJson.plugins));
    return project.targets[task.target.target].executor;
}
exports.getExecutorNameForTask = getExecutorNameForTask;
function getExecutorForTask(task, workspace, projectGraph, nxJson) {
    const executor = getExecutorNameForTask(task, nxJson, projectGraph);
    const [nodeModule, executorName] = executor.split(':');
    return workspace.readExecutor(nodeModule, executorName);
}
exports.getExecutorForTask = getExecutorForTask;
function getCustomHasher(task, workspace, nxJson, projectGraph) {
    const factory = getExecutorForTask(task, workspace, projectGraph, nxJson).hasherFactory;
    return factory ? factory() : null;
}
exports.getCustomHasher = getCustomHasher;
function removeTasksFromTaskGraph(graph, ids) {
    const tasks = {};
    const dependencies = {};
    const removedSet = new Set(ids);
    for (let taskId of Object.keys(graph.tasks)) {
        if (!removedSet.has(taskId)) {
            tasks[taskId] = graph.tasks[taskId];
            dependencies[taskId] = graph.dependencies[taskId].filter((depTaskId) => !removedSet.has(depTaskId));
        }
    }
    return {
        tasks,
        dependencies: dependencies,
        roots: Object.keys(dependencies).filter((k) => dependencies[k].length === 0),
    };
}
exports.removeTasksFromTaskGraph = removeTasksFromTaskGraph;
function calculateReverseDeps(taskGraph) {
    const reverseTaskDeps = {};
    Object.keys(taskGraph.tasks).forEach((t) => {
        reverseTaskDeps[t] = [];
    });
    Object.keys(taskGraph.dependencies).forEach((taskId) => {
        taskGraph.dependencies[taskId].forEach((d) => {
            reverseTaskDeps[d].push(taskId);
        });
    });
    return reverseTaskDeps;
}
exports.calculateReverseDeps = calculateReverseDeps;
function getCliPath() {
    return require.resolve(`../../bin/run-executor.js`);
}
exports.getCliPath = getCliPath;
function getPrintableCommandArgsForTask(task) {
    const args = task.overrides['__overrides_unparsed__'];
    const target = task.target.target.includes(':')
        ? `"${task.target.target}"`
        : task.target.target;
    const config = task.target.configuration
        ? `:${task.target.configuration}`
        : '';
    return ['run', `${task.target.project}:${target}${config}`, ...args];
}
exports.getPrintableCommandArgsForTask = getPrintableCommandArgsForTask;
function getSerializedArgsForTask(task, isVerbose) {
    return [
        JSON.stringify({
            targetDescription: task.target,
            overrides: task.overrides,
            isVerbose: isVerbose,
        }),
    ];
}
exports.getSerializedArgsForTask = getSerializedArgsForTask;
function shouldStreamOutput(task, initiatingProject, options) {
    if (process.env.NX_STREAM_OUTPUT === 'true')
        return true;
    if (longRunningTask(task))
        return true;
    if (task.target.project === initiatingProject)
        return true;
    return false;
}
exports.shouldStreamOutput = shouldStreamOutput;
function isCacheableTask(task, options) {
    const cacheable = options.cacheableOperations || options.cacheableTargets;
    return (cacheable &&
        cacheable.indexOf(task.target.target) > -1 &&
        !longRunningTask(task));
}
exports.isCacheableTask = isCacheableTask;
function longRunningTask(task) {
    const t = task.target.target;
    return ((!!task.overrides['watch'] && task.overrides['watch'] !== 'false') ||
        t.endsWith(':watch') ||
        t.endsWith('-watch') ||
        t === 'serve' ||
        t === 'dev' ||
        t === 'start');
}
// TODO: vsavkin remove when nx-cloud doesn't depend on it
function unparse(options) {
    return (0, serialize_overrides_into_command_line_1.serializeOverridesIntoCommandLine)(options);
}
exports.unparse = unparse;
//# sourceMappingURL=utils.js.map