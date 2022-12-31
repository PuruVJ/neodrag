"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTouchedProjectsFromProjectGlobChanges = void 0;
const file_utils_1 = require("../../file-utils");
const minimatch = require("minimatch");
const workspaces_1 = require("../../../config/workspaces");
const workspace_root_1 = require("../../../utils/workspace-root");
const getTouchedProjectsFromProjectGlobChanges = (touchedFiles, projectGraphNodes, nxJson) => {
    const pluginGlobPatterns = (0, workspaces_1.getGlobPatternsFromPlugins)(nxJson, [workspace_root_1.workspaceRoot], workspace_root_1.workspaceRoot);
    const workspacesGlobPatterns = (0, workspaces_1.getGlobPatternsFromPackageManagerWorkspaces)(workspace_root_1.workspaceRoot) || [];
    const patterns = [
        '**/project.json',
        ...pluginGlobPatterns,
        ...workspacesGlobPatterns,
    ];
    const combinedGlobPattern = patterns.length === 1 ? '**/project.json' : '{' + patterns.join(',') + '}';
    const touchedProjects = new Set();
    for (const touchedFile of touchedFiles) {
        const isProjectFile = minimatch(touchedFile.file, combinedGlobPattern);
        if (isProjectFile) {
            if (touchedFile.getChanges().some((change) => (0, file_utils_1.isDeletedFileChange)(change))) {
                // If any project has been deleted, we must assume all projects were affected
                return Object.keys(projectGraphNodes);
            }
            // Modified project config files are under a project's root, and implicitly
            // mark it as affected. Thus, we don't need to handle it here.
        }
    }
    return Array.from(touchedProjects);
};
exports.getTouchedProjectsFromProjectGlobChanges = getTouchedProjectsFromProjectGlobChanges;
//# sourceMappingURL=project-glob-changes.js.map