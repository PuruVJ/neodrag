"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspacePath = exports.shouldDefaultToUsingStandaloneConfigs = exports.readWorkspace = exports.getRelativeProjectJsonSchemaPath = exports.isStandaloneProject = exports.readNxJson = exports.readProjectConfiguration = exports.updateWorkspaceConfiguration = exports.readWorkspaceConfiguration = exports.getProjects = exports.removeProjectConfiguration = exports.updateProjectConfiguration = exports.addProjectConfiguration = void 0;
const tslib_1 = require("tslib");
const path_1 = require("path");
const workspaces_1 = require("../../config/workspaces");
const path_2 = require("../../utils/path");
const json_1 = require("./json");
/**
 * Adds project configuration to the Nx workspace.
 *
 * The project configuration is stored in workspace.json or the associated project.json file.
 * The utility will update either files.
 *
 * @param tree - the file system tree
 * @param projectName - unique name. Often directories are part of the name (e.g., mydir-mylib)
 * @param projectConfiguration - project configuration
 * @param standalone - should the project use package.json? If false, the project config is inside workspace.json
 */
function addProjectConfiguration(tree, projectName, projectConfiguration, standalone) {
    standalone = standalone !== null && standalone !== void 0 ? standalone : shouldDefaultToUsingStandaloneConfigs(tree);
    setProjectConfiguration(tree, projectName, projectConfiguration, 'create', standalone);
}
exports.addProjectConfiguration = addProjectConfiguration;
/**
 * Updates the configuration of an existing project.
 *
 * The project configuration is stored in workspace.json or the associated project.json file.
 * The utility will update either files.
 *
 * @param tree - the file system tree
 * @param projectName - unique name. Often directories are part of the name (e.g., mydir-mylib)
 * @param projectConfiguration - project configuration
 */
function updateProjectConfiguration(tree, projectName, projectConfiguration) {
    setProjectConfiguration(tree, projectName, projectConfiguration, 'update');
}
exports.updateProjectConfiguration = updateProjectConfiguration;
/**
 * Removes the configuration of an existing project.
 *
 * The project configuration is stored in workspace.json or the associated project.json file.
 * The utility will update either file.
 */
function removeProjectConfiguration(tree, projectName) {
    setProjectConfiguration(tree, projectName, undefined, 'delete');
}
exports.removeProjectConfiguration = removeProjectConfiguration;
/**
 * Get a map of all projects in a workspace.
 *
 * Use {@link readProjectConfiguration} if only one project is needed.
 */
function getProjects(tree) {
    const workspace = readWorkspace(tree);
    return new Map(Object.keys(workspace.projects || {}).map((projectName) => {
        return [projectName, getProjectConfiguration(projectName, workspace)];
    }));
}
exports.getProjects = getProjects;
/**
 * Read general workspace configuration such as the default project or cli settings
 *
 * This does _not_ provide projects configuration, use {@link readProjectConfiguration} instead.
 */
function readWorkspaceConfiguration(tree) {
    const _a = readRawWorkspaceJson(tree), { projects } = _a, workspace = tslib_1.__rest(_a, ["projects"]); // Create a new object, without projects
    let nxJson = readNxJson(tree);
    if (nxJson === null) {
        return workspace;
    }
    return Object.assign(Object.assign({}, workspace), nxJson);
}
exports.readWorkspaceConfiguration = readWorkspaceConfiguration;
/**
 * Update general workspace configuration such as the default project or cli settings.
 *
 * This does _not_ update projects configuration, use {@link updateProjectConfiguration} or {@link addProjectConfiguration} instead.
 */
function updateWorkspaceConfiguration(tree, workspaceConfig) {
    const { 
    // Nx Json Properties
    cli, defaultProject, generators, implicitDependencies, plugins, pluginsConfig, npmScope, namedInputs, targetDefaults, targetDependencies, workspaceLayout, tasksRunnerOptions, affected, extends: ext, } = workspaceConfig;
    const nxJson = {
        implicitDependencies,
        plugins,
        pluginsConfig,
        npmScope,
        namedInputs,
        targetDefaults,
        targetDependencies,
        workspaceLayout,
        tasksRunnerOptions,
        affected,
        cli,
        generators,
        defaultProject,
        extends: ext,
    };
    if (tree.exists('nx.json')) {
        (0, json_1.updateJson)(tree, 'nx.json', (json) => {
            if (json.extends) {
                const nxJsonExtends = readNxJsonExtends(tree, json.extends);
                const changedPropsOfNxJson = {};
                Object.keys(nxJson).forEach((prop) => {
                    if (JSON.stringify(nxJson[prop], null, 2) !=
                        JSON.stringify(nxJsonExtends[prop], null, 2)) {
                        changedPropsOfNxJson[prop] = nxJson[prop];
                    }
                });
                return Object.assign(Object.assign({}, json), changedPropsOfNxJson);
            }
            else {
                return Object.assign(Object.assign({}, json), nxJson);
            }
        });
    }
    // Only prop in workspace.json is version. If there is no
    // workspace.json file, this f(x) doesn't update anything
    // in project config.
    const workspacePath = getWorkspacePath(tree);
    if (workspacePath) {
        (0, json_1.updateJson)(tree, workspacePath, (json) => {
            const config = Object.assign(Object.assign({}, json), { version: workspaceConfig.version });
            if (!workspaceConfig.newProjectRoot) {
                delete config.newProjectRoot;
            }
            return config;
        });
    }
}
exports.updateWorkspaceConfiguration = updateWorkspaceConfiguration;
function readNxJsonExtends(tree, extendsPath) {
    try {
        return (0, json_1.readJson)(tree, (0, path_1.relative)(tree.root, require.resolve(extendsPath, {
            paths: [tree.root],
        })));
    }
    catch (e) {
        throw new Error(`Unable to resolve nx.json extends. Error: ${e.message}`);
    }
}
/**
 * Reads a project configuration.
 *
 * The project configuration is stored in workspace.json or the associated project.json file.
 * The utility will read from either file.
 *
 * @param tree - the file system tree
 * @param projectName - unique name. Often directories are part of the name (e.g., mydir-mylib)
 * @throws If supplied projectName cannot be found
 */
function readProjectConfiguration(tree, projectName) {
    const workspace = readWorkspace(tree);
    if (!workspace.projects[projectName]) {
        throw new Error(getWorkspacePath(tree)
            ? `Cannot find configuration for '${projectName}' in ${getWorkspacePath(tree)}.`
            : `Cannot find configuration for '${projectName}'`);
    }
    return getProjectConfiguration(projectName, workspace);
}
exports.readProjectConfiguration = readProjectConfiguration;
function readNxJson(tree) {
    if (!tree.exists('nx.json')) {
        return null;
    }
    let nxJson = (0, json_1.readJson)(tree, 'nx.json');
    if (nxJson.extends) {
        nxJson = Object.assign(Object.assign({}, readNxJsonExtends(tree, nxJson.extends)), nxJson);
    }
    return nxJson;
}
exports.readNxJson = readNxJson;
/**
 * Returns if a project has a standalone configuration (project.json).
 *
 * @param tree - the file system tree
 * @param project - the project name
 */
function isStandaloneProject(tree, project) {
    var _a;
    const path = getWorkspacePath(tree);
    const rawWorkspace = path && tree.exists(path)
        ? (0, json_1.readJson)(tree, path)
        : null;
    if (rawWorkspace) {
        const projectConfig = (_a = rawWorkspace.projects) === null || _a === void 0 ? void 0 : _a[project];
        return typeof projectConfig === 'string';
    }
    return true;
}
exports.isStandaloneProject = isStandaloneProject;
function getProjectConfiguration(projectName, workspace) {
    return Object.assign({}, readWorkspaceSection(workspace, projectName));
}
function readWorkspaceSection(workspace, projectName) {
    return workspace.projects[projectName];
}
function setProjectConfiguration(tree, projectName, projectConfiguration, mode, standalone = false) {
    if (mode === 'delete') {
        addProjectToWorkspaceJson(tree, projectName, readProjectConfiguration(tree, projectName), mode);
        return;
    }
    if (!projectConfiguration) {
        throw new Error(`Cannot ${mode} "${projectName}" with value ${projectConfiguration}`);
    }
    addProjectToWorkspaceJson(tree, projectName, projectConfiguration, mode, standalone);
}
function getRelativeProjectJsonSchemaPath(tree, project) {
    return (0, path_2.normalizePath)((0, path_1.relative)((0, path_1.join)(tree.root, project.root), (0, path_1.join)(tree.root, 'node_modules/nx/schemas/project-schema.json')));
}
exports.getRelativeProjectJsonSchemaPath = getRelativeProjectJsonSchemaPath;
function addProjectToWorkspaceJson(tree, projectName, project, mode, standalone = false) {
    var _a, _b;
    const workspaceConfigPath = getWorkspacePath(tree);
    const workspaceJson = readRawWorkspaceJson(tree);
    if (workspaceConfigPath) {
        validateProjectConfigurationOperationsGivenWorkspaceJson(mode, workspaceJson, projectName);
    }
    else {
        validateProjectConfigurationOperationsWithoutWorkspaceJson(mode, projectName, project.root, tree);
    }
    const projectConfigFile = (mode === 'create' && standalone) || !workspaceConfigPath
        ? (0, path_2.joinPathFragments)(project.root, 'project.json')
        : getProjectFileLocation(tree, projectName);
    const jsonSchema = projectConfigFile && mode === 'create'
        ? { $schema: getRelativeProjectJsonSchemaPath(tree, project) }
        : {};
    if (projectConfigFile) {
        if (mode === 'delete') {
            tree.delete(projectConfigFile);
            delete workspaceJson.projects[projectName];
        }
        else {
            // keep real workspace up to date
            if (workspaceConfigPath && mode === 'create') {
                workspaceJson.projects[projectName] = project.root;
            }
            // update the project.json file
            (0, json_1.writeJson)(tree, projectConfigFile, Object.assign(Object.assign(Object.assign({ name: mode === 'create' ? projectName : (_a = project.name) !== null && _a !== void 0 ? _a : projectName }, jsonSchema), project), { root: undefined }));
        }
    }
    else if (mode === 'delete') {
        delete workspaceJson.projects[projectName];
    }
    else {
        workspaceJson.projects[projectName] = project;
    }
    if (workspaceConfigPath && tree.exists(workspaceConfigPath)) {
        (0, json_1.writeJson)(tree, workspaceConfigPath, (_b = (0, workspaces_1.reformattedWorkspaceJsonOrNull)(workspaceJson)) !== null && _b !== void 0 ? _b : workspaceJson);
    }
}
/**
 * Read the workspace configuration, including projects.
 */
function readWorkspace(tree) {
    const workspaceJson = inlineProjectConfigurationsWithTree(tree);
    const originalVersion = workspaceJson.version;
    return Object.assign(Object.assign({}, (0, workspaces_1.toNewFormat)(workspaceJson)), { version: originalVersion });
}
exports.readWorkspace = readWorkspace;
/**
 * This has to be separate from the inline functionality inside nx,
 * as the functionality in nx does not use a Tree. Changes made during
 * a generator would not be present during runtime execution.
 * @returns
 */
function inlineProjectConfigurationsWithTree(tree) {
    const workspaceJson = readRawWorkspaceJson(tree);
    Object.entries(workspaceJson.projects || {}).forEach(([project, config]) => {
        if (typeof config === 'string') {
            const configFileLocation = (0, path_2.joinPathFragments)(config, 'project.json');
            workspaceJson.projects[project] = Object.assign({ root: config }, (0, json_1.readJson)(tree, configFileLocation));
        }
    });
    return workspaceJson;
}
/**
 * Used to ensure that projects created during
 * the same devkit generator run show up when
 * there is no workspace.json file, as `glob`
 * cannot find them.
 *
 * We exclude the root `package.json` from this list unless
 * considered a project during workspace generation
 */
function findCreatedProjects(tree) {
    const createdProjectFiles = [];
    for (const change of tree.listChanges()) {
        if (change.type === 'CREATE') {
            const fileName = (0, path_1.basename)(change.path);
            // all created project json files are created projects
            if (fileName === 'project.json') {
                createdProjectFiles.push(change.path);
            }
            else if (fileName === 'package.json') {
                // created package.json files are projects by default *unless* they are at the root
                const includedByDefault = change.path === 'package.json' ? false : true;
                // If the file should be included by default
                if (includedByDefault) {
                    createdProjectFiles.push(change.path);
                }
                else {
                    const contents = JSON.parse(change.content.toString());
                    // if the file should be included by the Nx property
                    if (contents.nx) {
                        createdProjectFiles.push(change.path);
                    }
                }
            }
        }
    }
    return (0, workspaces_1.deduplicateProjectFiles)(createdProjectFiles);
}
/**
 * Used to ensure that projects created during
 * the same devkit generator run show up when
 * there is no workspace.json file, as `glob`
 * cannot find them.
 */
function findDeletedProjects(tree) {
    return tree.listChanges().filter((f) => {
        const fileName = (0, path_1.basename)(f.path);
        return (f.type === 'DELETE' &&
            (fileName === 'project.json' || fileName === 'package.json'));
    });
}
let staticFSWorkspace;
let cachedTree;
function readRawWorkspaceJson(tree) {
    const path = getWorkspacePath(tree);
    if (path && tree.exists(path)) {
        // `workspace.json` exists, use it.
        return (0, json_1.readJson)(tree, path);
    }
    else {
        const nxJson = readNxJson(tree);
        const createdProjects = (0, workspaces_1.buildWorkspaceConfigurationFromGlobs)(nxJson, findCreatedProjects(tree), (file) => (0, json_1.readJson)(tree, file)).projects;
        // We already have built a cache but need to confirm it's the same tree
        if (!staticFSWorkspace || tree !== cachedTree) {
            staticFSWorkspace = (0, workspaces_1.buildWorkspaceConfigurationFromGlobs)(nxJson, [...(0, workspaces_1.globForProjectFiles)(tree.root, nxJson)], (file) => (0, json_1.readJson)(tree, file));
            cachedTree = tree;
        }
        const projects = Object.assign(Object.assign({}, staticFSWorkspace.projects), createdProjects);
        findDeletedProjects(tree).forEach((file) => {
            const matchingStaticProject = Object.entries(projects).find(([, config]) => typeof config === 'string'
                ? config === (0, path_1.dirname)(file.path)
                : config.root === (0, path_1.dirname)(file.path));
            if (matchingStaticProject) {
                delete projects[matchingStaticProject[0]];
            }
        });
        staticFSWorkspace = Object.assign(Object.assign({}, staticFSWorkspace), { projects });
        return staticFSWorkspace;
    }
}
/**
 * @description Determine where a project's configuration is located.
 * @returns file path if separate from root config, null otherwise.
 */
function getProjectFileLocation(tree, project) {
    var _a;
    const rawWorkspace = readRawWorkspaceJson(tree);
    const projectConfig = (_a = rawWorkspace.projects) === null || _a === void 0 ? void 0 : _a[project];
    return typeof projectConfig === 'string'
        ? (0, path_2.joinPathFragments)(projectConfig, 'project.json')
        : null;
}
function validateProjectConfigurationOperationsGivenWorkspaceJson(mode, workspaceJson, projectName) {
    if (mode == 'create' && workspaceJson.projects[projectName]) {
        throw new Error(`Cannot create Project '${projectName}'. It already exists.`);
    }
    if (mode == 'update' && !workspaceJson.projects[projectName]) {
        throw new Error(`Cannot update Project '${projectName}'. It does not exist.`);
    }
    if (mode == 'delete' && !workspaceJson.projects[projectName]) {
        throw new Error(`Cannot delete Project '${projectName}'. It does not exist.`);
    }
}
function validateProjectConfigurationOperationsWithoutWorkspaceJson(mode, projectName, projectRoot, tree) {
    if (mode == 'create' &&
        tree.exists((0, path_2.joinPathFragments)(projectRoot, 'project.json'))) {
        throw new Error(`Cannot create a new project at ${projectRoot}. It already exists.`);
    }
    if (mode == 'update' &&
        !tree.exists((0, path_2.joinPathFragments)(projectRoot, 'project.json'))) {
        throw new Error(`Cannot update Project ${projectName} at ${projectRoot}. It doesn't exist or uses package.json configuration.`);
    }
    if (mode == 'delete' && !tree.exists((0, path_2.joinPathFragments)(projectRoot))) {
        throw new Error(`Cannot delete Project ${projectName}. It doesn't exist or uses package.json configuration.`);
    }
}
function shouldDefaultToUsingStandaloneConfigs(tree) {
    const workspacePath = getWorkspacePath(tree);
    const rawWorkspace = workspacePath && tree.exists(workspacePath)
        ? (0, json_1.readJson)(tree, workspacePath)
        : null;
    return !rawWorkspace
        ? true // if workspace.json doesn't exist, all projects **must** be standalone
        : Object.values(rawWorkspace.projects).reduce(
        // default for second, third... projects should be based on all projects being defined as a path
        // for configuration read from ng schematics, this is determined by configFilePath's presence
        (allStandalone, next) => allStandalone &&
            (typeof next === 'string' || 'configFilePath' in next), 
        // default for first project should be true if using Nx Schema
        rawWorkspace.version > 1);
}
exports.shouldDefaultToUsingStandaloneConfigs = shouldDefaultToUsingStandaloneConfigs;
function getWorkspacePath(tree) {
    const possibleFiles = [
        '/angular.json',
        '/workspace.json',
    ];
    return possibleFiles.filter((path) => tree.exists(path))[0];
}
exports.getWorkspacePath = getWorkspacePath;
//# sourceMappingURL=project-configuration.js.map