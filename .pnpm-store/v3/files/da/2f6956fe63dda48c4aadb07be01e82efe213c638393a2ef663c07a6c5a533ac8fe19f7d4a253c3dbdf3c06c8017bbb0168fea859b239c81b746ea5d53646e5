"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const batch_messages_1 = require("./batch-messages");
const workspaces_1 = require("../../config/workspaces");
const workspace_root_1 = require("../../utils/workspace-root");
const params_1 = require("../../utils/params");
const project_graph_1 = require("../../project-graph/project-graph");
function getBatchExecutor(executorName) {
    const workspace = new workspaces_1.Workspaces(workspace_root_1.workspaceRoot);
    const [nodeModule, exportName] = executorName.split(':');
    return workspace.readExecutor(nodeModule, exportName);
}
function runTasks(executorName, taskGraph) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const input = {};
        const projectGraph = yield (0, project_graph_1.createProjectGraphAsync)();
        const workspaceConfig = (0, project_graph_1.readProjectsConfigurationFromProjectGraph)(projectGraph);
        const batchExecutor = getBatchExecutor(executorName);
        const tasks = Object.values(taskGraph.tasks);
        const context = {
            root: workspace_root_1.workspaceRoot,
            cwd: process.cwd(),
            workspace: workspaceConfig,
            isVerbose: false,
            projectGraph,
        };
        for (const task of tasks) {
            const projectConfiguration = workspaceConfig.projects[task.target.project];
            const targetConfiguration = projectConfiguration.targets[task.target.target];
            input[task.id] = (0, params_1.combineOptionsForExecutor)(task.overrides, task.target.configuration, targetConfiguration, batchExecutor.schema, null, process.cwd());
        }
        try {
            const results = yield batchExecutor.batchImplementationFactory()(taskGraph, input, tasks[0].overrides, context);
            if (typeof results !== 'object') {
                throw new Error(`"${executorName} returned invalid results: ${results}`);
            }
            return results;
        }
        catch (e) {
            const isVerbose = tasks[0].overrides.verbose;
            console.error(isVerbose ? e : e.message);
            process.exit(1);
        }
    });
}
process.on('message', (message) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    switch (message.type) {
        case batch_messages_1.BatchMessageType.Tasks: {
            const results = yield runTasks(message.executorName, message.taskGraph);
            process.send({
                type: batch_messages_1.BatchMessageType.Complete,
                results,
            });
            process.exit(0);
        }
    }
}));
//# sourceMappingURL=run-batch.js.map