"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskOrchestrator = void 0;
const tslib_1 = require("tslib");
const workspaces_1 = require("../config/workspaces");
const perf_hooks_1 = require("perf_hooks");
const forked_process_task_runner_1 = require("./forked-process-task-runner");
const workspace_root_1 = require("../utils/workspace-root");
const cache_1 = require("./cache");
const utils_1 = require("./utils");
const tasks_schedule_1 = require("./tasks-schedule");
class TaskOrchestrator {
    // endregion internal state
    constructor(hasher, initiatingProject, projectGraph, taskGraph, options, bail, daemon) {
        this.hasher = hasher;
        this.initiatingProject = initiatingProject;
        this.projectGraph = projectGraph;
        this.taskGraph = taskGraph;
        this.options = options;
        this.bail = bail;
        this.daemon = daemon;
        this.cache = new cache_1.Cache(this.options);
        this.workspace = new workspaces_1.Workspaces(workspace_root_1.workspaceRoot);
        this.forkedProcessTaskRunner = new forked_process_task_runner_1.ForkedProcessTaskRunner(this.options);
        this.nxJson = this.workspace.readNxJson();
        this.tasksSchedule = new tasks_schedule_1.TasksSchedule(this.hasher, this.nxJson, this.projectGraph, this.taskGraph, this.workspace, this.options);
        // region internal state
        this.reverseTaskDeps = (0, utils_1.calculateReverseDeps)(this.taskGraph);
        this.completedTasks = {};
        this.waitingForTasks = [];
        this.groups = [];
        this.bailed = false;
    }
    run() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // initial scheduling
            yield this.tasksSchedule.scheduleNextTasks();
            perf_hooks_1.performance.mark('task-execution-begins');
            const threads = [];
            // initial seeding of the queue
            for (let i = 0; i < this.options.parallel; ++i) {
                threads.push(this.executeNextBatchOfTasksUsingTaskSchedule());
            }
            yield Promise.all(threads);
            perf_hooks_1.performance.mark('task-execution-ends');
            perf_hooks_1.performance.measure('command-execution', 'task-execution-begins', 'task-execution-ends');
            this.cache.removeOldCacheRecords();
            return this.completedTasks;
        });
    }
    executeNextBatchOfTasksUsingTaskSchedule() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // completed all the tasks
            if (!this.tasksSchedule.hasTasks() || this.bailed) {
                return null;
            }
            const doNotSkipCache = this.options.skipNxCache === false ||
                this.options.skipNxCache === undefined;
            const batch = this.tasksSchedule.nextBatch();
            if (batch) {
                const groupId = this.closeGroup();
                yield this.applyFromCacheOrRunBatch(doNotSkipCache, batch, groupId);
                this.openGroup(groupId);
                return this.executeNextBatchOfTasksUsingTaskSchedule();
            }
            const task = this.tasksSchedule.nextTask();
            if (task) {
                const groupId = this.closeGroup();
                yield this.applyFromCacheOrRunTask(doNotSkipCache, task, groupId);
                this.openGroup(groupId);
                return this.executeNextBatchOfTasksUsingTaskSchedule();
            }
            // block until some other task completes, then try again
            return new Promise((res) => this.waitingForTasks.push(res)).then(() => this.executeNextBatchOfTasksUsingTaskSchedule());
        });
    }
    // region Applying Cache
    applyCachedResults(tasks) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const cacheableTasks = tasks.filter((t) => (0, utils_1.isCacheableTask)(t, this.options));
            const res = yield Promise.all(cacheableTasks.map((t) => this.applyCachedResult(t)));
            return res.filter((r) => r !== null);
        });
    }
    applyCachedResult(task) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const cachedResult = yield this.cache.get(task);
            if (!cachedResult || cachedResult.code !== 0)
                return null;
            const outputs = (0, utils_1.getOutputs)(this.projectGraph.nodes, task);
            const shouldCopyOutputsFromCache = !!outputs.length &&
                (yield this.shouldCopyOutputsFromCache(outputs, task.hash));
            if (shouldCopyOutputsFromCache) {
                yield this.cache.copyFilesFromCache(task.hash, cachedResult, outputs);
            }
            const status = cachedResult.remote
                ? 'remote-cache'
                : shouldCopyOutputsFromCache
                    ? 'local-cache'
                    : 'local-cache-kept-existing';
            this.options.lifeCycle.printTaskTerminalOutput(task, status, cachedResult.terminalOutput);
            return {
                task,
                status,
            };
        });
    }
    // endregion Applying Cache
    // region Batch
    applyFromCacheOrRunBatch(doNotSkipCache, batch, groupId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const taskEntries = Object.entries(batch.taskGraph.tasks);
            const tasks = taskEntries.map(([, task]) => task);
            yield this.preRunSteps(tasks, { groupId });
            let results = doNotSkipCache ? yield this.applyCachedResults(tasks) : [];
            // Run tasks that were not cached
            if (results.length !== taskEntries.length) {
                const unrunTaskGraph = (0, utils_1.removeTasksFromTaskGraph)(batch.taskGraph, results.map(({ task }) => task.id));
                const batchResults = yield this.runBatch({
                    executorName: batch.executorName,
                    taskGraph: unrunTaskGraph,
                });
                results.push(...batchResults);
            }
            yield this.postRunSteps(tasks, results, { groupId });
            const tasksCompleted = taskEntries.filter(([taskId]) => this.completedTasks[taskId]);
            // Batch is still not done, run it again
            if (tasksCompleted.length !== taskEntries.length) {
                yield this.applyFromCacheOrRunBatch(doNotSkipCache, {
                    executorName: batch.executorName,
                    taskGraph: (0, utils_1.removeTasksFromTaskGraph)(batch.taskGraph, tasksCompleted.map(([taskId]) => taskId)),
                }, groupId);
            }
        });
    }
    runBatch(batch) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield this.forkedProcessTaskRunner.forkProcessForBatch(batch);
                const batchResultEntries = Object.entries(results);
                return batchResultEntries.map(([taskId, result]) => ({
                    task: this.taskGraph.tasks[taskId],
                    status: (result.success ? 'success' : 'failure'),
                    terminalOutput: result.terminalOutput,
                }));
            }
            catch (e) {
                return batch.taskGraph.roots.map((rootTaskId) => ({
                    task: this.taskGraph.tasks[rootTaskId],
                    status: 'failure',
                }));
            }
        });
    }
    // endregion Batch
    // region Single Task
    applyFromCacheOrRunTask(doNotSkipCache, task, groupId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.preRunSteps([task], { groupId });
            // hash the task here
            let results = doNotSkipCache ? yield this.applyCachedResults([task]) : [];
            // the task wasn't cached
            if (results.length === 0) {
                // cache prep
                const { code, terminalOutput } = yield this.runTaskInForkedProcess(task);
                results.push({
                    task,
                    status: code === 0 ? 'success' : 'failure',
                    terminalOutput,
                });
            }
            yield this.postRunSteps([task], results, { groupId });
        });
    }
    runTaskInForkedProcess(task) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                // obtain metadata
                const temporaryOutputPath = this.cache.temporaryOutputPath(task);
                const streamOutput = (0, utils_1.shouldStreamOutput)(task, this.initiatingProject, this.options);
                const pipeOutput = this.pipeOutputCapture(task);
                // execution
                const { code, terminalOutput } = pipeOutput
                    ? yield this.forkedProcessTaskRunner.forkProcessPipeOutputCapture(task, {
                        temporaryOutputPath,
                        streamOutput,
                    })
                    : yield this.forkedProcessTaskRunner.forkProcessDirectOutputCapture(task, {
                        temporaryOutputPath,
                        streamOutput,
                    });
                return {
                    code,
                    terminalOutput,
                };
            }
            catch (e) {
                return {
                    code: 1,
                };
            }
        });
    }
    // endregion Single Task
    // region Lifecycle
    preRunSteps(tasks, metadata) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.options.lifeCycle.startTasks(tasks, metadata);
        });
    }
    postRunSteps(tasks, results, { groupId }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const task of tasks) {
                yield this.recordOutputsHash(task);
            }
            // cache the results
            yield Promise.all(results
                .filter(({ status }) => status !== 'local-cache' &&
                status !== 'local-cache-kept-existing' &&
                status !== 'remote-cache' &&
                status !== 'skipped')
                .map((result) => (Object.assign(Object.assign({}, result), { code: result.status === 'local-cache' ||
                    result.status === 'local-cache-kept-existing' ||
                    result.status === 'remote-cache' ||
                    result.status === 'success'
                    ? 0
                    : 1, outputs: (0, utils_1.getOutputs)(this.projectGraph.nodes, result.task) })))
                .filter(({ task, code }) => this.shouldCacheTaskResult(task, code))
                .filter(({ terminalOutput, outputs }) => terminalOutput || outputs)
                .map(({ task, code, terminalOutput, outputs }) => tslib_1.__awaiter(this, void 0, void 0, function* () { return this.cache.put(task, terminalOutput, outputs, code); })));
            this.options.lifeCycle.endTasks(results.map((result) => {
                const code = result.status === 'success' ||
                    result.status === 'local-cache' ||
                    result.status === 'local-cache-kept-existing' ||
                    result.status === 'remote-cache'
                    ? 0
                    : 1;
                return {
                    task: result.task,
                    status: result.status,
                    code,
                };
            }), { groupId });
            this.complete(results.map(({ task, status }) => {
                return {
                    taskId: task.id,
                    status,
                };
            }));
            yield this.tasksSchedule.scheduleNextTasks();
            // release blocked threads
            this.waitingForTasks.forEach((f) => f(null));
            this.waitingForTasks.length = 0;
        });
    }
    complete(taskResults) {
        this.tasksSchedule.complete(taskResults.map(({ taskId }) => taskId));
        for (const { taskId, status } of taskResults) {
            if (this.completedTasks[taskId] === undefined) {
                this.completedTasks[taskId] = status;
                if (status === 'failure' || status === 'skipped') {
                    if (this.bail) {
                        // mark the execution as bailed which will stop all further execution
                        // only the tasks that are currently running will finish
                        this.bailed = true;
                    }
                    else {
                        // only mark the packages that depend on the current task as skipped
                        // other tasks will continue to execute
                        this.complete(this.reverseTaskDeps[taskId].map((depTaskId) => ({
                            taskId: depTaskId,
                            status: 'skipped',
                        })));
                    }
                }
            }
        }
    }
    //endregion Lifecycle
    // region utils
    pipeOutputCapture(task) {
        try {
            const { schema } = (0, utils_1.getExecutorForTask)(task, this.workspace, this.projectGraph, this.nxJson);
            return (schema.outputCapture === 'pipe' ||
                process.env.NX_STREAM_OUTPUT === 'true');
        }
        catch (e) {
            return false;
        }
    }
    shouldCacheTaskResult(task, code) {
        return ((0, utils_1.isCacheableTask)(task, this.options) &&
            (process.env.NX_CACHE_FAILURES == 'true' ? true : code === 0));
    }
    closeGroup() {
        for (let i = 0; i < this.options.parallel; i++) {
            if (!this.groups[i]) {
                this.groups[i] = true;
                return i;
            }
        }
    }
    openGroup(id) {
        this.groups[id] = false;
    }
    shouldCopyOutputsFromCache(outputs, hash) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if ((_a = this.daemon) === null || _a === void 0 ? void 0 : _a.enabled()) {
                return !(yield this.daemon.outputsHashesMatch(outputs, hash));
            }
            else {
                return true;
            }
        });
    }
    recordOutputsHash(task) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if ((_a = this.daemon) === null || _a === void 0 ? void 0 : _a.enabled()) {
                return this.daemon.recordOutputsHash((0, utils_1.getOutputs)(this.projectGraph.nodes, task), task.hash);
            }
        });
    }
}
exports.TaskOrchestrator = TaskOrchestrator;
//# sourceMappingURL=task-orchestrator.js.map