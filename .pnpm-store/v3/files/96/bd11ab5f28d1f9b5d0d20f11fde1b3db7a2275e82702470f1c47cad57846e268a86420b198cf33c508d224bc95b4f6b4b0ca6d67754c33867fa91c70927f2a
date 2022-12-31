"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractGlobalFilesFromInputs = exports.getImplicitlyTouchedProjects = exports.getTouchedProjects = void 0;
const minimatch = require("minimatch");
const find_project_for_path_1 = require("../../utils/find-project-for-path");
const getTouchedProjects = (touchedFiles, projectGraphNodes) => {
    const projectRootMap = (0, find_project_for_path_1.createProjectRootMappings)(projectGraphNodes);
    return touchedFiles.reduce((affected, f) => {
        const matchingProject = (0, find_project_for_path_1.findProjectForPath)(f.file, projectRootMap);
        if (matchingProject) {
            affected.push(matchingProject);
        }
        return affected;
    }, []);
};
exports.getTouchedProjects = getTouchedProjects;
const getImplicitlyTouchedProjects = (fileChanges, projectGraphNodes, nxJson) => {
    const implicits = Object.assign({}, nxJson.implicitDependencies);
    const globalFiles = [
        ...extractGlobalFilesFromInputs(nxJson, projectGraphNodes),
        'nx.json',
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
        'pnpm-lock.yml',
    ];
    globalFiles.forEach((file) => {
        implicits[file] = '*';
    });
    const touched = new Set();
    for (const [pattern, projects] of Object.entries(implicits)) {
        const implicitDependencyWasChanged = fileChanges.some((f) => minimatch(f.file, pattern));
        if (!implicitDependencyWasChanged) {
            continue;
        }
        // File change affects all projects, just return all projects.
        if (projects === '*') {
            return Object.keys(projectGraphNodes);
        }
        else if (Array.isArray(projects)) {
            projects.forEach((project) => touched.add(project));
        }
    }
    return Array.from(touched);
};
exports.getImplicitlyTouchedProjects = getImplicitlyTouchedProjects;
function extractGlobalFilesFromInputs(nxJson, projectGraphNodes) {
    const globalFiles = [];
    globalFiles.push(...extractGlobalFilesFromNamedInputs(nxJson.namedInputs));
    globalFiles.push(...extractGlobalFilesFromTargets(nxJson.targetDefaults));
    Object.values(projectGraphNodes || {}).forEach((node) => {
        globalFiles.push(...extractGlobalFilesFromNamedInputs(node.data.namedInputs));
        globalFiles.push(...extractGlobalFilesFromTargets(node.data.targets));
    });
    return globalFiles;
}
exports.extractGlobalFilesFromInputs = extractGlobalFilesFromInputs;
function extractGlobalFilesFromNamedInputs(namedInputs) {
    const globalFiles = [];
    for (const inputs of Object.values(namedInputs || {})) {
        globalFiles.push(...extractGlobalFiles(inputs));
    }
    return globalFiles;
}
function extractGlobalFilesFromTargets(targets) {
    const globalFiles = [];
    for (const target of Object.values(targets || {})) {
        if (target.inputs) {
            globalFiles.push(...extractGlobalFiles(target.inputs));
        }
    }
    return globalFiles;
}
function extractGlobalFiles(inputs) {
    const globalFiles = [];
    for (const input of inputs) {
        if (typeof input === 'string' && input.startsWith('{workspaceRoot}/')) {
            globalFiles.push(input.substring('{workspaceRoot}/'.length));
        }
        else if (input.fileset && input.fileset.startsWith('{workspaceRoot}/')) {
            globalFiles.push(input.fileset.substring('{workspaceRoot}/'.length));
        }
    }
    return globalFiles;
}
//# sourceMappingURL=workspace-projects.js.map