"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRunner = exports.runCommand = void 0;
const tslib_1 = require("tslib");
const path_1 = require("path");
const workspace_root_1 = require("../utils/workspace-root");
const fileutils_1 = require("../utils/fileutils");
const output_1 = require("../utils/output");
const utils_1 = require("./utils");
const life_cycle_1 = require("./life-cycle");
const static_run_many_terminal_output_life_cycle_1 = require("./life-cycles/static-run-many-terminal-output-life-cycle");
const static_run_one_terminal_output_life_cycle_1 = require("./life-cycles/static-run-one-terminal-output-life-cycle");
const task_timings_life_cycle_1 = require("./life-cycles/task-timings-life-cycle");
const dynamic_run_many_terminal_output_life_cycle_1 = require("./life-cycles/dynamic-run-many-terminal-output-life-cycle");
const task_profiling_life_cycle_1 = require("./life-cycles/task-profiling-life-cycle");
const is_ci_1 = require("../utils/is-ci");
const dynamic_run_one_terminal_output_life_cycle_1 = require("./life-cycles/dynamic-run-one-terminal-output-life-cycle");
const create_task_graph_1 = require("./create-task-graph");
const task_graph_utils_1 = require("./task-graph-utils");
const params_1 = require("../utils/params");
const workspaces_1 = require("../config/workspaces");
const hasher_1 = require("../hasher/hasher");
const hash_task_1 = require("../hasher/hash-task");
const client_1 = require("../daemon/client/client");
const store_run_information_life_cycle_1 = require("./life-cycles/store-run-information-life-cycle");
function getTerminalOutputLifeCycle(initiatingProject, projectNames, tasks, nxArgs, overrides, runnerOptions) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const isRunOne = initiatingProject != null;
        const useDynamicOutput = shouldUseDynamicLifeCycle(tasks, runnerOptions, nxArgs.outputStyle) &&
            process.env.NX_VERBOSE_LOGGING !== 'true' &&
            process.env.NX_TASKS_RUNNER_DYNAMIC_OUTPUT !== 'false';
        const overridesWithoutHidden = Object.assign({}, overrides);
        delete overridesWithoutHidden['__overrides_unparsed__'];
        if (isRunOne) {
            if (useDynamicOutput) {
                return yield (0, dynamic_run_one_terminal_output_life_cycle_1.createRunOneDynamicOutputRenderer)({
                    initiatingProject,
                    tasks,
                    args: nxArgs,
                    overrides: overridesWithoutHidden,
                });
            }
            return {
                lifeCycle: new static_run_one_terminal_output_life_cycle_1.StaticRunOneTerminalOutputLifeCycle(initiatingProject, projectNames, tasks, nxArgs),
                renderIsDone: Promise.resolve(),
            };
        }
        else {
            if (useDynamicOutput) {
                return yield (0, dynamic_run_many_terminal_output_life_cycle_1.createRunManyDynamicOutputRenderer)({
                    projectNames,
                    tasks,
                    args: nxArgs,
                    overrides: overridesWithoutHidden,
                });
            }
            else {
                return {
                    lifeCycle: new static_run_many_terminal_output_life_cycle_1.StaticRunManyTerminalOutputLifeCycle(projectNames, tasks, nxArgs, overridesWithoutHidden),
                    renderIsDone: Promise.resolve(),
                };
            }
        }
    });
}
function hashTasksThatDontDependOnOtherTasks(workspaces, hasher, projectGraph, taskGraph) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const res = [];
        for (let t of Object.values(taskGraph.tasks)) {
            if (!(0, hash_task_1.hashDependsOnOtherTasks)(workspaces, hasher, projectGraph, taskGraph, t)) {
                res.push((0, hash_task_1.hashTask)(workspaces, hasher, projectGraph, taskGraph, t));
            }
        }
        return Promise.all(res);
    });
}
function runCommand(projectsToRun, projectGraph, { nxJson }, nxArgs, overrides, initiatingProject, extraTargetDependencies, extraOptions) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const status = yield (0, params_1.handleErrors)(process.env.NX_VERBOSE_LOGGING === 'true', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { tasksRunner, runnerOptions } = getRunner(nxArgs, nxJson);
            const defaultDependencyConfigs = mergeTargetDependencies(nxJson.targetDefaults, extraTargetDependencies);
            const projectNames = projectsToRun.map((t) => t.name);
            const taskGraph = (0, create_task_graph_1.createTaskGraph)(projectGraph, defaultDependencyConfigs, projectNames, nxArgs.targets, nxArgs.configuration, overrides, extraOptions.excludeTaskDependencies);
            const hasher = new hasher_1.Hasher(projectGraph, nxJson, runnerOptions);
            yield hashTasksThatDontDependOnOtherTasks(new workspaces_1.Workspaces(workspace_root_1.workspaceRoot), hasher, projectGraph, taskGraph);
            const cycle = (0, task_graph_utils_1.findCycle)(taskGraph);
            if (cycle) {
                if (nxArgs.nxIgnoreCycles) {
                    output_1.output.warn({
                        title: `The task graph has a circular dependency`,
                        bodyLines: [`${cycle.join(' --> ')}`],
                    });
                    (0, task_graph_utils_1.makeAcyclic)(taskGraph);
                }
                else {
                    output_1.output.error({
                        title: `Could not execute command because the task graph has a circular dependency`,
                        bodyLines: [`${cycle.join(' --> ')}`],
                    });
                    process.exit(1);
                }
            }
            const tasks = Object.values(taskGraph.tasks);
            if (nxArgs.outputStyle == 'stream') {
                process.env.NX_STREAM_OUTPUT = 'true';
                process.env.NX_PREFIX_OUTPUT = 'true';
            }
            if (nxArgs.outputStyle == 'stream-without-prefixes') {
                process.env.NX_STREAM_OUTPUT = 'true';
            }
            const { lifeCycle, renderIsDone } = yield getTerminalOutputLifeCycle(initiatingProject, projectNames, tasks, nxArgs, overrides, runnerOptions);
            const lifeCycles = [];
            lifeCycles.push(new store_run_information_life_cycle_1.StoreRunInformationLifeCycle());
            lifeCycles.push(lifeCycle);
            if (process.env.NX_PERF_LOGGING) {
                lifeCycles.push(new task_timings_life_cycle_1.TaskTimingsLifeCycle());
            }
            if (process.env.NX_PROFILE) {
                lifeCycles.push(new task_profiling_life_cycle_1.TaskProfilingLifeCycle(process.env.NX_PROFILE));
            }
            if (extraOptions.loadDotEnvFiles) {
                process.env.NX_LOAD_DOT_ENV_FILES = 'true';
            }
            const promiseOrObservable = tasksRunner(tasks, Object.assign(Object.assign({}, runnerOptions), { lifeCycle: new life_cycle_1.CompositeLifeCycle(lifeCycles) }), {
                initiatingProject: nxArgs.outputStyle === 'compact' ? null : initiatingProject,
                projectGraph,
                nxJson,
                nxArgs,
                taskGraph,
                hasher,
                daemon: client_1.daemonClient,
            });
            let anyFailures;
            if (promiseOrObservable.subscribe) {
                anyFailures = yield anyFailuresInObservable(promiseOrObservable);
            }
            else {
                // simply await the promise
                anyFailures = yield anyFailuresInPromise(promiseOrObservable);
            }
            yield renderIsDone;
            return anyFailures ? 1 : 0;
        }));
        // fix for https://github.com/nrwl/nx/issues/1666
        if (process.stdin['unref'])
            process.stdin.unref();
        process.exit(status);
    });
}
exports.runCommand = runCommand;
function mergeTargetDependencies(defaults, deps) {
    const res = {};
    Object.keys(defaults).forEach((k) => {
        res[k] = defaults[k].dependsOn;
    });
    if (deps) {
        Object.keys(deps).forEach((k) => {
            if (res[k]) {
                res[k] = [...res[k], deps[k]];
            }
            else {
                res[k] = deps[k];
            }
        });
        return res;
    }
}
function anyFailuresInPromise(promise) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return Object.values(yield promise).some((v) => v === 'failure' || v === 'skipped');
    });
}
function anyFailuresInObservable(obs) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return yield new Promise((res) => {
            let anyFailures = false;
            obs.subscribe((t) => {
                if (!t.success) {
                    anyFailures = true;
                }
            }, (error) => {
                output_1.output.error({
                    title: 'Unhandled error in task executor',
                });
                console.error(error);
                res(true);
            }, () => {
                res(anyFailures);
            });
        });
    });
}
function shouldUseDynamicLifeCycle(tasks, options, outputStyle) {
    if (!process.stdout.isTTY)
        return false;
    if ((0, is_ci_1.isCI)())
        return false;
    if (outputStyle === 'static' || outputStyle === 'stream')
        return false;
    const noForwarding = !tasks.find((t) => (0, utils_1.shouldStreamOutput)(t, null, options));
    return noForwarding;
}
function getRunner(nxArgs, nxJson) {
    let runner = nxArgs.runner;
    runner = runner || 'default';
    if (!nxJson.tasksRunnerOptions) {
        throw new Error(`Could not find any runner configurations in nx.json`);
    }
    if (nxJson.tasksRunnerOptions[runner]) {
        let modulePath = nxJson.tasksRunnerOptions[runner].runner;
        let tasksRunner;
        if (modulePath) {
            if ((0, fileutils_1.isRelativePath)(modulePath)) {
                modulePath = (0, path_1.join)(workspace_root_1.workspaceRoot, modulePath);
            }
            tasksRunner = require(modulePath);
            // to support both babel and ts formats
            if (tasksRunner.default) {
                tasksRunner = tasksRunner.default;
            }
        }
        else {
            tasksRunner = require('./default-tasks-runner').defaultTasksRunner;
        }
        return {
            tasksRunner,
            runnerOptions: Object.assign(Object.assign({}, nxJson.tasksRunnerOptions[runner].options), nxArgs),
        };
    }
    else {
        throw new Error(`Could not find runner configuration for ${runner}`);
    }
}
exports.getRunner = getRunner;
//# sourceMappingURL=run-command.js.map