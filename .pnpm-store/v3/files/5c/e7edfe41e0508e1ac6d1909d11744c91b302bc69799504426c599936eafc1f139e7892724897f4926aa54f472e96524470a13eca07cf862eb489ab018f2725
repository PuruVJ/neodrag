"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksSchedule = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("./utils");
const hash_task_1 = require("../hasher/hash-task");
const project_graph_utils_1 = require("../utils/project-graph-utils");
const operators_1 = require("../project-graph/operators");
class TasksSchedule {
    constructor(hasher, nxJson, projectGraph, taskGraph, workspaces, options) {
        this.hasher = hasher;
        this.nxJson = nxJson;
        this.projectGraph = projectGraph;
        this.taskGraph = taskGraph;
        this.workspaces = workspaces;
        this.options = options;
        this.notScheduledTaskGraph = this.taskGraph;
        this.reverseTaskDeps = (0, utils_1.calculateReverseDeps)(this.taskGraph);
        this.reverseProjectGraph = (0, operators_1.reverse)(this.projectGraph);
        this.scheduledBatches = [];
        this.scheduledTasks = [];
        this.completedTasks = new Set();
    }
    scheduleNextTasks() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (process.env.NX_BATCH_MODE === 'true') {
                this.scheduleBatches();
            }
            for (let root of this.notScheduledTaskGraph.roots) {
                if (this.canBeScheduled(root)) {
                    yield this.scheduleTask(root);
                }
            }
        });
    }
    hasTasks() {
        return (this.scheduledBatches.length +
            this.scheduledTasks.length +
            Object.keys(this.notScheduledTaskGraph.tasks).length !==
            0);
    }
    complete(taskIds) {
        for (const taskId of taskIds) {
            this.completedTasks.add(taskId);
        }
        this.notScheduledTaskGraph = (0, utils_1.removeTasksFromTaskGraph)(this.notScheduledTaskGraph, taskIds);
    }
    nextTask() {
        if (this.scheduledTasks.length > 0) {
            return this.taskGraph.tasks[this.scheduledTasks.shift()];
        }
        else {
            return null;
        }
    }
    nextBatch() {
        return this.scheduledBatches.length > 0
            ? this.scheduledBatches.shift()
            : null;
    }
    scheduleTask(taskId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const task = this.taskGraph.tasks[taskId];
            if (!task.hash) {
                yield (0, hash_task_1.hashTask)(this.workspaces, this.hasher, this.projectGraph, this.taskGraph, task);
            }
            this.notScheduledTaskGraph = (0, utils_1.removeTasksFromTaskGraph)(this.notScheduledTaskGraph, [taskId]);
            this.options.lifeCycle.scheduleTask(task);
            this.scheduledTasks = this.scheduledTasks
                .concat(taskId)
                // NOTE: sort task by most dependent on first
                .sort((taskId1, taskId2) => {
                // First compare the length of task dependencies.
                const taskDifference = this.reverseTaskDeps[taskId2].length -
                    this.reverseTaskDeps[taskId1].length;
                if (taskDifference !== 0) {
                    return taskDifference;
                }
                // Tie-breaker for tasks with equal number of task dependencies.
                // Most likely tasks with no dependencies such as test
                const project1 = this.taskGraph.tasks[taskId1].target.project;
                const project2 = this.taskGraph.tasks[taskId2].target.project;
                return ((0, project_graph_utils_1.findAllProjectNodeDependencies)(project2, this.reverseProjectGraph)
                    .length -
                    (0, project_graph_utils_1.findAllProjectNodeDependencies)(project1, this.reverseProjectGraph)
                        .length);
            });
        });
    }
    scheduleBatches() {
        const batchMap = {};
        for (const root of this.notScheduledTaskGraph.roots) {
            const rootTask = this.notScheduledTaskGraph.tasks[root];
            const executorName = (0, utils_1.getExecutorNameForTask)(rootTask, this.nxJson, this.projectGraph);
            this.processTaskForBatches(batchMap, rootTask, executorName, true);
        }
        for (const [executorName, taskGraph] of Object.entries(batchMap)) {
            this.scheduleBatch({ executorName, taskGraph });
        }
    }
    scheduleBatch({ executorName, taskGraph }) {
        // Create a new task graph without the tasks that are being scheduled as part of this batch
        this.notScheduledTaskGraph = (0, utils_1.removeTasksFromTaskGraph)(this.notScheduledTaskGraph, Object.keys(taskGraph.tasks));
        this.scheduledBatches.push({ executorName, taskGraph });
    }
    processTaskForBatches(batches, task, rootExecutorName, isRoot) {
        var _a;
        const { batchImplementationFactory } = (0, utils_1.getExecutorForTask)(task, this.workspaces, this.projectGraph, this.nxJson);
        const executorName = (0, utils_1.getExecutorNameForTask)(task, this.nxJson, this.projectGraph);
        if (rootExecutorName !== executorName) {
            return;
        }
        if (!batchImplementationFactory) {
            return;
        }
        const batch = (batches[rootExecutorName] =
            (_a = batches[rootExecutorName]) !== null && _a !== void 0 ? _a : {
                tasks: {},
                dependencies: {},
                roots: [],
            });
        batch.tasks[task.id] = task;
        batch.dependencies[task.id] = this.taskGraph.dependencies[task.id];
        if (isRoot) {
            batch.roots.push(task.id);
        }
        for (const dep of this.reverseTaskDeps[task.id]) {
            const depTask = this.taskGraph.tasks[dep];
            this.processTaskForBatches(batches, depTask, rootExecutorName, false);
        }
    }
    canBeScheduled(taskId) {
        return this.taskGraph.dependencies[taskId].every((id) => this.completedTasks.has(id));
    }
}
exports.TasksSchedule = TasksSchedule;
//# sourceMappingURL=tasks-schedule.js.map