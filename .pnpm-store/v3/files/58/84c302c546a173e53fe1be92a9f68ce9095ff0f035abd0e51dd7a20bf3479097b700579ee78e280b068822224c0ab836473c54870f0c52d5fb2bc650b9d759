"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectPrintAffected = exports.printAffected = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("../tasks-runner/utils");
const create_task_graph_1 = require("../tasks-runner/create-task-graph");
const workspaces_1 = require("../config/workspaces");
const hasher_1 = require("../hasher/hasher");
const hash_task_1 = require("../hasher/hash-task");
const workspace_root_1 = require("../utils/workspace-root");
const package_manager_1 = require("../utils/package-manager");
function printAffected(affectedProjects, projectGraph, { nxJson }, nxArgs, overrides) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const projectsForType = affectedProjects.filter((p) => nxArgs.type ? p.type === nxArgs.type : true);
        const projectNames = projectsForType.map((p) => p.name);
        const tasksJson = nxArgs.targets && nxArgs.targets.length > 0
            ? yield createTasks(projectsForType, projectGraph, nxArgs, nxJson, overrides)
            : [];
        const result = {
            tasks: tasksJson,
            projects: projectNames,
            projectGraph: serializeProjectGraph(projectGraph),
        };
        if (nxArgs.select) {
            console.log(selectPrintAffected(result, nxArgs.select));
        }
        else {
            console.log(JSON.stringify(selectPrintAffected(result, null), null, 2));
        }
    });
}
exports.printAffected = printAffected;
function createTasks(affectedProjectsWithTargetAndConfig, projectGraph, nxArgs, nxJson, overrides) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const workspaces = new workspaces_1.Workspaces(workspace_root_1.workspaceRoot);
        const hasher = new hasher_1.Hasher(projectGraph, nxJson, {});
        const execCommand = (0, package_manager_1.getPackageManagerCommand)().exec;
        const p = new create_task_graph_1.ProcessTasks({}, projectGraph);
        const tasks = [];
        for (let target of nxArgs.targets) {
            for (const affectedProject of affectedProjectsWithTargetAndConfig) {
                const resolvedConfiguration = p.resolveConfiguration(affectedProject, target, nxArgs.configuration);
                try {
                    tasks.push(p.createTask(p.getId(affectedProject.name, target, resolvedConfiguration), affectedProject, target, resolvedConfiguration, overrides));
                }
                catch (e) { }
            }
        }
        yield Promise.all(tasks.map((t) => (0, hash_task_1.hashTask)(workspaces, hasher, projectGraph, {}, t)));
        return tasks.map((task, index) => ({
            id: task.id,
            overrides,
            target: task.target,
            hash: task.hash,
            command: (0, utils_1.getCommandAsString)(execCommand, task),
            outputs: (0, utils_1.getOutputs)(projectGraph.nodes, task),
        }));
    });
}
function serializeProjectGraph(projectGraph) {
    const nodes = Object.values(projectGraph.nodes).map((n) => n.name);
    const dependencies = {};
    // we don't need external dependencies' dependencies for print-affected
    // having them included makes the output unreadable
    Object.keys(projectGraph.dependencies).forEach((key) => {
        if (!key.startsWith('npm:')) {
            dependencies[key] = projectGraph.dependencies[key];
        }
    });
    return { nodes, dependencies };
}
function selectPrintAffected(wholeJson, wholeSelect) {
    if (!wholeSelect)
        return wholeJson;
    return _select(wholeJson, wholeSelect);
    function _select(json, select) {
        if (select.indexOf('.') > -1) {
            const [firstKey, ...restKeys] = select.split('.');
            const first = json[firstKey];
            throwIfEmpty(wholeSelect, first);
            const rest = restKeys.join('.');
            if (Array.isArray(first)) {
                return first.map((q) => _select(q, rest)).join(', ');
            }
            else {
                return _select(first, rest);
            }
        }
        else {
            const res = json[select];
            throwIfEmpty(wholeSelect, res);
            if (Array.isArray(res)) {
                return res.join(', ');
            }
            else {
                return res;
            }
        }
    }
}
exports.selectPrintAffected = selectPrintAffected;
function throwIfEmpty(select, value) {
    if (value === undefined) {
        throw new Error(`Cannot select '${select}' in the results of print-affected.`);
    }
}
//# sourceMappingURL=print-affected.js.map