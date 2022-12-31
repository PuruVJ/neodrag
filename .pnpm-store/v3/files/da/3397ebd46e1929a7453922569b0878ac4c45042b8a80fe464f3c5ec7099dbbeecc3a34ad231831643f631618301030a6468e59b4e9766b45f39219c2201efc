"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksRunnerV2 = void 0;
const default_tasks_runner_1 = require("./default-tasks-runner");
/**
 * TODO: Remove after NX 15 is released
 * This tasks runner converts the new implementation of the default tasks runner
 * to the old Observable-based API.
 *
 * It is going to be removed after Nx 15 is released.
 */
const tasksRunnerV2 = (tasks, options, context) => {
    if (!options.lifeCycle.startCommand) {
        throw new Error(`If you are using Nx Cloud, update the version of @nrwl/nx-cloud to >=13.0.0`);
    }
    const { Subject } = require('rxjs/internal/Subject');
    const r = new Subject();
    (0, default_tasks_runner_1.defaultTasksRunner)(tasks, options, context)
        .then((tasks) => {
        convertCompletedTasksToOutputFormat(tasks).forEach((k) => r.next(k));
        r.complete();
    })
        .catch((e) => {
        r.error(e);
        r.complete();
    });
    return r;
};
exports.tasksRunnerV2 = tasksRunnerV2;
function convertCompletedTasksToOutputFormat(completedTasks) {
    return Object.keys(completedTasks).map((taskId) => {
        const taskStatus = completedTasks[taskId];
        return {
            success: taskStatus === 'success' ||
                taskStatus === 'cache' ||
                taskStatus === 'local-cache' ||
                taskStatus === 'local-cache-kept-existing' ||
                taskStatus === 'remote-cache',
        };
    });
}
exports.default = exports.tasksRunnerV2;
//# sourceMappingURL=tasks-runner-v2.js.map