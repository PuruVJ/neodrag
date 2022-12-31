"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectsAndGlobalChanges = void 0;
const perf_hooks_1 = require("perf_hooks");
const project_graph_incremental_recomputation_1 = require("../project-graph-incremental-recomputation");
function getProjectsAndGlobalChanges(createdFiles, updatedFiles, deletedFiles) {
    var _a, _b;
    var _c;
    const projectAndGlobalChanges = {
        projects: {},
        globalFiles: [],
    };
    perf_hooks_1.performance.mark('changed-projects:start');
    const allChangedFiles = [
        ...(createdFiles !== null && createdFiles !== void 0 ? createdFiles : []).map((c) => ({
            path: c,
            type: 'create',
        })),
        ...(updatedFiles !== null && updatedFiles !== void 0 ? updatedFiles : []).map((c) => ({
            path: c,
            type: 'update',
        })),
        ...(deletedFiles !== null && deletedFiles !== void 0 ? deletedFiles : []).map((c) => ({
            path: c,
            type: 'delete',
        })),
    ];
    const fileToProjectMap = {};
    for (const [projectName, projectFiles] of Object.entries((_a = project_graph_incremental_recomputation_1.projectFileMapWithFiles === null || project_graph_incremental_recomputation_1.projectFileMapWithFiles === void 0 ? void 0 : project_graph_incremental_recomputation_1.projectFileMapWithFiles.projectFileMap) !== null && _a !== void 0 ? _a : {})) {
        for (const projectFile of projectFiles) {
            fileToProjectMap[projectFile.file] = projectName;
        }
    }
    for (const changedFile of allChangedFiles) {
        const project = fileToProjectMap[changedFile.path];
        if (project) {
            ((_b = (_c = projectAndGlobalChanges.projects)[project]) !== null && _b !== void 0 ? _b : (_c[project] = [])).push(changedFile);
        }
        else {
            projectAndGlobalChanges.globalFiles.push(changedFile);
        }
    }
    perf_hooks_1.performance.mark('changed-projects:end');
    perf_hooks_1.performance.measure('changed-projects', 'changed-projects:start', 'changed-projects:end');
    return projectAndGlobalChanges;
}
exports.getProjectsAndGlobalChanges = getProjectsAndGlobalChanges;
//# sourceMappingURL=changed-projects.js.map