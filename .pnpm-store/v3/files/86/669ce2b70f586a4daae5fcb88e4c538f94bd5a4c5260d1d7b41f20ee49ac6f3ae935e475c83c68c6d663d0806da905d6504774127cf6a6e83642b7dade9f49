"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskTimingsLifeCycle = void 0;
class TaskTimingsLifeCycle {
    constructor() {
        this.timings = {};
    }
    startTasks(tasks) {
        for (let t of tasks) {
            this.timings[`${t.target.project}:${t.target.target}`] = {
                start: new Date().getTime(),
                end: undefined,
            };
        }
    }
    endTasks(taskResults) {
        for (let tr of taskResults) {
            this.timings[`${tr.task.target.project}:${tr.task.target.target}`].end =
                new Date().getTime();
        }
    }
    endCommand() {
        console.log('Task Execution Timings:');
        const timings = {};
        Object.keys(this.timings).forEach((p) => {
            const t = this.timings[p];
            timings[p] = t.end ? t.end - t.start : null;
        });
        console.log(JSON.stringify(timings, null, 2));
    }
}
exports.TaskTimingsLifeCycle = TaskTimingsLifeCycle;
//# sourceMappingURL=task-timings-life-cycle.js.map