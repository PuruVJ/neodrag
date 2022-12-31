"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeLifeCycle = void 0;
class CompositeLifeCycle {
    constructor(lifeCycles) {
        this.lifeCycles = lifeCycles;
    }
    startCommand() {
        for (let l of this.lifeCycles) {
            if (l.startCommand) {
                l.startCommand();
            }
        }
    }
    endCommand() {
        for (let l of this.lifeCycles) {
            if (l.endCommand) {
                l.endCommand();
            }
        }
    }
    scheduleTask(task) {
        for (let l of this.lifeCycles) {
            if (l.scheduleTask) {
                l.scheduleTask(task);
            }
        }
    }
    startTask(task) {
        for (let l of this.lifeCycles) {
            if (l.startTask) {
                l.startTask(task);
            }
        }
    }
    endTask(task, code) {
        for (let l of this.lifeCycles) {
            if (l.endTask) {
                l.endTask(task, code);
            }
        }
    }
    startTasks(tasks, metadata) {
        for (let l of this.lifeCycles) {
            if (l.startTasks) {
                l.startTasks(tasks, metadata);
            }
            else if (l.startTask) {
                tasks.forEach((t) => l.startTask(t));
            }
        }
    }
    endTasks(taskResults, metadata) {
        for (let l of this.lifeCycles) {
            if (l.endTasks) {
                l.endTasks(taskResults, metadata);
            }
            else if (l.endTask) {
                taskResults.forEach((t) => l.endTask(t.task, t.code));
            }
        }
    }
    printTaskTerminalOutput(task, status, output) {
        for (let l of this.lifeCycles) {
            if (l.printTaskTerminalOutput) {
                l.printTaskTerminalOutput(task, status, output);
            }
        }
    }
}
exports.CompositeLifeCycle = CompositeLifeCycle;
//# sourceMappingURL=life-cycle.js.map