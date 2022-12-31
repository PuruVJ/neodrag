"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findProjectForPath = exports.createProjectRootMappings = exports.createProjectRootMappingsFromProjectConfigurations = void 0;
const path_1 = require("path");
/**
 * This creates a map of project roots to project names to easily look up the project of a file
 * @param projects This is the map of project configurations commonly found in "workspace.json"
 */
function createProjectRootMappingsFromProjectConfigurations(projects) {
    const projectRootMappings = new Map();
    for (const projectName of Object.keys(projects)) {
        const root = projects[projectName].root;
        projectRootMappings.set(normalizeProjectRoot(root), projectName);
    }
    return projectRootMappings;
}
exports.createProjectRootMappingsFromProjectConfigurations = createProjectRootMappingsFromProjectConfigurations;
/**
 * This creates a map of project roots to project names to easily look up the project of a file
 * @param nodes This is the nodes from the project graph
 */
function createProjectRootMappings(nodes) {
    const projectRootMappings = new Map();
    for (const projectName of Object.keys(nodes)) {
        let root = nodes[projectName].data.root;
        projectRootMappings.set(normalizeProjectRoot(root), projectName);
    }
    return projectRootMappings;
}
exports.createProjectRootMappings = createProjectRootMappings;
/**
 * Locates a project in projectRootMap based on a file within it
 * @param filePath path that is inside of projectName. This should be relative from the workspace root
 * @param projectRootMap Map<projectRoot, projectName> Use {@link createProjectRootMappings} to create this
 */
function findProjectForPath(filePath, projectRootMap) {
    let currentPath = filePath;
    for (; currentPath != (0, path_1.dirname)(currentPath); currentPath = (0, path_1.dirname)(currentPath)) {
        const p = projectRootMap.get(currentPath);
        if (p) {
            return p;
        }
    }
    return projectRootMap.get(currentPath);
}
exports.findProjectForPath = findProjectForPath;
function normalizeProjectRoot(root) {
    root = root === '' ? '.' : root;
    return root && root.endsWith('/') ? root.substring(0, root.length - 1) : root;
}
//# sourceMappingURL=find-project-for-path.js.map