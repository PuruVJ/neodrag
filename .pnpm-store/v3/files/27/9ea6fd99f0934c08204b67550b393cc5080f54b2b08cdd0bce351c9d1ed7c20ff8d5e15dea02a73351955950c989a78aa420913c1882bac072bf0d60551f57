"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAcyclic = exports.findCycle = void 0;
function _findCycle(taskGraph, taskId, visited, path) {
    if (visited[taskId])
        return null;
    visited[taskId] = true;
    for (const d of taskGraph.dependencies[taskId]) {
        if (path.includes(d))
            return [...path, d];
        const cycle = _findCycle(taskGraph, d, visited, [...path, d]);
        if (cycle)
            return cycle;
    }
    return null;
}
function findCycle(taskGraph) {
    const visited = {};
    for (const t of Object.keys(taskGraph.dependencies)) {
        visited[t] = false;
    }
    for (const t of Object.keys(taskGraph.dependencies)) {
        const cycle = _findCycle(taskGraph, t, visited, [t]);
        if (cycle)
            return cycle;
    }
    return null;
}
exports.findCycle = findCycle;
function _makeAcyclic(taskGraph, taskId, visited, path) {
    if (visited[taskId])
        return;
    visited[taskId] = true;
    const deps = taskGraph.dependencies[taskId];
    for (const d of [...deps]) {
        if (path.includes(d)) {
            deps.splice(deps.indexOf(d), 1);
        }
        else {
            _makeAcyclic(taskGraph, d, visited, [...path, d]);
        }
    }
    return null;
}
function makeAcyclic(taskGraph) {
    const visited = {};
    for (const t of Object.keys(taskGraph.dependencies)) {
        visited[t] = false;
    }
    for (const t of Object.keys(taskGraph.dependencies)) {
        _makeAcyclic(taskGraph, t, visited, [t]);
    }
    taskGraph.roots = Object.keys(taskGraph.dependencies).filter((t) => taskGraph.dependencies[t].length === 0);
}
exports.makeAcyclic = makeAcyclic;
//# sourceMappingURL=task-graph-utils.js.map