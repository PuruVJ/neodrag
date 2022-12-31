"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashTask = exports.hashDependsOnOtherTasks = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("../tasks-runner/utils");
const project_graph_1 = require("../project-graph/project-graph");
function hashDependsOnOtherTasks(workspaces, hasher, projectGraph, taskGraph, task) {
    try {
        const customHasher = (0, utils_1.getCustomHasher)(task, workspaces, workspaces.readNxJson(), projectGraph);
        if (customHasher)
            return true;
    }
    catch (_a) {
        return true;
    }
    return hasher.hashDependsOnOtherTasks(task);
}
exports.hashDependsOnOtherTasks = hashDependsOnOtherTasks;
function hashTask(workspaces, hasher, projectGraph, taskGraph, task) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const customHasher = (0, utils_1.getCustomHasher)(task, workspaces, workspaces.readNxJson(), projectGraph);
        const { value, details } = yield (customHasher
            ? customHasher(task, {
                hasher,
                projectGraph,
                taskGraph,
                workspaceConfig: (0, project_graph_1.readProjectsConfigurationFromProjectGraph)(projectGraph),
            })
            : hasher.hashTask(task));
        task.hash = value;
        task.hashDetails = details;
    });
}
exports.hashTask = hashTask;
//# sourceMappingURL=hash-task.js.map