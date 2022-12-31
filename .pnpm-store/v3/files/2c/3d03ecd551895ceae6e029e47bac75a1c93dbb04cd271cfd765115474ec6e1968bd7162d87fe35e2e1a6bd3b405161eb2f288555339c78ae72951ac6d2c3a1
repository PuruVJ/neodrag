"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.runExecutor = exports.validateProject = exports.printRunHelp = void 0;
const tslib_1 = require("tslib");
const params_1 = require("../utils/params");
const print_help_1 = require("../utils/print-help");
const workspaces_1 = require("../config/workspaces");
const fileutils_1 = require("../utils/fileutils");
const package_json_1 = require("../utils/package-json");
const path_1 = require("path");
const fs_1 = require("fs");
const nx_plugin_1 = require("../utils/nx-plugin");
const serialize_overrides_into_command_line_1 = require("../utils/serialize-overrides-into-command-line");
const project_graph_1 = require("../project-graph/project-graph");
function printRunHelp(opts, schema, plugin) {
    (0, print_help_1.printHelp)(`run ${opts.project}:${opts.target}`, schema, Object.assign({ mode: 'run' }, plugin));
}
exports.printRunHelp = printRunHelp;
function validateProject(workspace, projectName) {
    const project = workspace.projects[projectName];
    if (!project) {
        throw new Error(`Could not find project "${projectName}"`);
    }
}
exports.validateProject = validateProject;
function isPromise(v) {
    return typeof (v === null || v === void 0 ? void 0 : v.then) === 'function';
}
function isAsyncIterator(v) {
    return typeof (v === null || v === void 0 ? void 0 : v[Symbol.asyncIterator]) === 'function';
}
function promiseToIterator(v) {
    return tslib_1.__asyncGenerator(this, arguments, function* promiseToIterator_1() {
        yield yield tslib_1.__await(yield tslib_1.__await(v));
    });
}
function iteratorToProcessStatusCode(i) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let success;
        // This is a workaround to fix an issue that only happens with
        // the @angular-devkit/build-angular:browser builder. Starting
        // on version 12.0.1, a SASS compilation implementation was
        // introduced making use of workers and it's unref()-ing the worker
        // too early, causing the process to exit early in environments
        // like CI or when running Docker builds.
        const keepProcessAliveInterval = setInterval(() => { }, 1000);
        try {
            let prev;
            let current;
            do {
                prev = current;
                current = yield i.next();
            } while (!current.done);
            success =
                current.value !== undefined || !prev
                    ? current.value.success
                    : prev.value.success;
            return success ? 0 : 1;
        }
        finally {
            clearInterval(keepProcessAliveInterval);
        }
    });
}
function createImplicitTargetConfig(root, proj, targetName) {
    const packageJsonPath = (0, path_1.join)(root, proj.root, 'package.json');
    if (!(0, fs_1.existsSync)(packageJsonPath)) {
        return null;
    }
    const { scripts, nx } = (0, fileutils_1.readJsonFile)(packageJsonPath);
    if (!(targetName in (scripts || {})) ||
        !(nx.includedScripts && nx.includedScripts.includes(targetName))) {
        return null;
    }
    return (0, package_json_1.buildTargetFromScript)(targetName, nx);
}
function runExecutorInternal({ project, target, configuration, }, overrides, root, cwd, workspace, projectGraph, isVerbose, printHelp) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        validateProject(workspace, project);
        const ws = new workspaces_1.Workspaces(root);
        const proj = workspace.projects[project];
        const targetConfig = ((_a = proj.targets) === null || _a === void 0 ? void 0 : _a[target]) ||
            createImplicitTargetConfig(root, proj, target) ||
            (0, nx_plugin_1.mergePluginTargetsWithNxTargets)(proj.root, proj.targets, (0, nx_plugin_1.loadNxPlugins)(workspace.plugins, [root], root))[target];
        if (!targetConfig) {
            throw new Error(`Cannot find target '${target}' for project '${project}'`);
        }
        configuration = configuration !== null && configuration !== void 0 ? configuration : targetConfig.defaultConfiguration;
        const [nodeModule, executor] = targetConfig.executor.split(':');
        const { schema, implementationFactory } = ws.readExecutor(nodeModule, executor);
        if (printHelp) {
            printRunHelp({ project, target }, schema, {
                plugin: nodeModule,
                entity: executor,
            });
            process.exit(0);
        }
        const combinedOptions = (0, params_1.combineOptionsForExecutor)(overrides, configuration, targetConfig, schema, project, ws.relativeCwd(cwd), isVerbose);
        if (ws.isNxExecutor(nodeModule, executor)) {
            const implementation = implementationFactory();
            const r = implementation(combinedOptions, {
                root,
                target: targetConfig,
                workspace,
                projectName: project,
                targetName: target,
                configurationName: configuration,
                projectGraph,
                cwd,
                isVerbose,
            });
            if (isPromise(r)) {
                return promiseToIterator(r);
            }
            else if (isAsyncIterator(r)) {
                return r;
            }
            else {
                throw new TypeError(`NX Executor "${targetConfig.executor}" should return either a Promise or an AsyncIterator`);
            }
        }
        else {
            require('../adapter/compat');
            const observable = yield (yield Promise.resolve().then(() => require('../adapter/ngcli-adapter'))).scheduleTarget(root, {
                project,
                target,
                configuration,
                runOptions: combinedOptions,
            }, isVerbose);
            const { eachValueFrom } = yield Promise.resolve().then(() => require('../adapter/rxjs-for-await'));
            return eachValueFrom(observable);
        }
    });
}
/**
 * Loads and invokes executor.
 *
 * This is analogous to invoking executor from the terminal, with the exception
 * that the params aren't parsed from the string, but instead provided parsed already.
 *
 * Apart from that, it works the same way:
 *
 * - it will load the workspace configuration
 * - it will resolve the target
 * - it will load the executor and the schema
 * - it will load the options for the appropriate configuration
 * - it will run the validations and will set the default
 * - and, of course, it will invoke the executor
 *
 * Example:
 *
 * ```typescript
 * for await (const s of await runExecutor({project: 'myproj', target: 'serve'}, {watch: true}, context)) {
 *   // s.success
 * }
 * ```
 *
 * Note that the return value is a promise of an iterator, so you need to await before iterating over it.
 */
function runExecutor(targetDescription, overrides, context) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return yield runExecutorInternal(targetDescription, Object.assign(Object.assign({}, overrides), { __overrides_unparsed__: (0, serialize_overrides_into_command_line_1.serializeOverridesIntoCommandLine)(overrides) }), context.root, context.cwd, context.workspace, context.projectGraph, context.isVerbose, false);
    });
}
exports.runExecutor = runExecutor;
function run(cwd, root, targetDescription, overrides, isVerbose, isHelp) {
    const projectGraph = (0, project_graph_1.readCachedProjectGraph)();
    return (0, params_1.handleErrors)(isVerbose, () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const workspace = (0, project_graph_1.readProjectsConfigurationFromProjectGraph)(projectGraph);
        return iteratorToProcessStatusCode(yield runExecutorInternal(targetDescription, overrides, root, cwd, workspace, projectGraph, isVerbose, isHelp));
    }));
}
exports.run = run;
//# sourceMappingURL=run.js.map