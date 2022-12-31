"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskProfilingLifeCycle = void 0;
const perf_hooks_1 = require("perf_hooks");
const path_1 = require("path");
const fileutils_1 = require("../../utils/fileutils");
class TaskProfilingLifeCycle {
    constructor(_profileFile) {
        this.timings = {};
        this.profile = [];
        this.registeredGroups = new Set();
        this.profileFile = (0, path_1.join)(process.cwd(), _profileFile);
    }
    startTasks(tasks, { groupId }) {
        if (this.profileFile && !this.registeredGroups.has(groupId)) {
            this.registerGroup(groupId);
        }
        for (let t of tasks) {
            this.timings[`${t.target.project}:${t.target.target}`] = {
                perfStart: perf_hooks_1.performance.now(),
            };
        }
    }
    endTasks(taskResults, metadata) {
        for (let tr of taskResults) {
            this.timings[`${tr.task.target.project}:${tr.task.target.target}`].perfEnd = perf_hooks_1.performance.now();
        }
        this.recordTaskCompletions(taskResults, metadata);
    }
    endCommand() {
        (0, fileutils_1.writeJsonFile)(this.profileFile, this.profile);
        console.log(`Performance Profile: ${this.profileFile}`);
    }
    recordTaskCompletions(tasks, { groupId }) {
        for (const { task, status } of tasks) {
            const { perfStart, perfEnd } = this.timings[`${task.target.project}:${task.target.target}`];
            this.profile.push({
                name: task.id,
                cat: Object.values(task.target).join(','),
                ph: 'X',
                ts: perfStart * 1000,
                dur: (perfEnd - perfStart) * 1000,
                pid: process.pid,
                tid: groupId,
                args: {
                    target: task.target,
                    status,
                },
            });
        }
    }
    registerGroup(groupId) {
        this.profile.push({
            name: 'thread_name',
            ph: 'M',
            pid: process.pid,
            tid: groupId,
            ts: 0,
            args: {
                name: 'Group #' + (groupId + 1),
            },
        });
        this.registeredGroups.add(groupId);
    }
}
exports.TaskProfilingLifeCycle = TaskProfilingLifeCycle;
//# sourceMappingURL=task-profiling-life-cycle.js.map