"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectFileMap = exports.createProjectFileMap = void 0;
const find_project_for_path_1 = require("./utils/find-project-for-path");
function createProjectFileMap(workspaceJson, allWorkspaceFiles) {
    var _a;
    const projectFileMap = {};
    const projectRootMappings = (0, find_project_for_path_1.createProjectRootMappingsFromProjectConfigurations)(workspaceJson.projects);
    for (const projectName of Object.keys(workspaceJson.projects)) {
        (_a = projectFileMap[projectName]) !== null && _a !== void 0 ? _a : (projectFileMap[projectName] = []);
    }
    for (const f of allWorkspaceFiles) {
        const matchingProjectFiles = projectFileMap[(0, find_project_for_path_1.findProjectForPath)(f.file, projectRootMappings)];
        if (matchingProjectFiles) {
            matchingProjectFiles.push(f);
        }
    }
    return { projectFileMap, allWorkspaceFiles };
}
exports.createProjectFileMap = createProjectFileMap;
function updateProjectFileMap(workspaceJson, projectFileMap, allWorkspaceFiles, updatedFiles, deletedFiles) {
    var _a, _b;
    const projectRootMappings = (0, find_project_for_path_1.createProjectRootMappingsFromProjectConfigurations)(workspaceJson.projects);
    for (const f of updatedFiles.keys()) {
        const matchingProjectFiles = (_a = projectFileMap[(0, find_project_for_path_1.findProjectForPath)(f, projectRootMappings)]) !== null && _a !== void 0 ? _a : [];
        if (matchingProjectFiles) {
            const fileData = matchingProjectFiles.find((t) => t.file === f);
            if (fileData) {
                fileData.hash = updatedFiles.get(f);
            }
            else {
                matchingProjectFiles.push({
                    file: f,
                    hash: updatedFiles.get(f),
                });
            }
        }
        const fileData = allWorkspaceFiles.find((t) => t.file === f);
        if (fileData) {
            fileData.hash = updatedFiles.get(f);
        }
        else {
            allWorkspaceFiles.push({
                file: f,
                hash: updatedFiles.get(f),
            });
        }
    }
    for (const f of deletedFiles) {
        const matchingProjectFiles = (_b = projectFileMap[(0, find_project_for_path_1.findProjectForPath)(f, projectRootMappings)]) !== null && _b !== void 0 ? _b : [];
        if (matchingProjectFiles) {
            const index = matchingProjectFiles.findIndex((t) => t.file === f);
            if (index > -1) {
                matchingProjectFiles.splice(index, 1);
            }
        }
        const index = allWorkspaceFiles.findIndex((t) => t.file === f);
        if (index > -1) {
            allWorkspaceFiles.splice(index, 1);
        }
    }
    return { projectFileMap, allWorkspaceFiles };
}
exports.updateProjectFileMap = updateProjectFileMap;
//# sourceMappingURL=file-map-utils.js.map