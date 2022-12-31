"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const logger_1 = require("../utils/logger");
const workspaces_1 = require("../config/workspaces");
const workspace_root_1 = require("../utils/workspace-root");
const project_graph_1 = require("../project-graph/project-graph");
const configuration_1 = require("../config/configuration");
/* eslint-disable */
const Module = require('module');
const originalRequire = Module.prototype.require;
let patched = false;
let loggedWriteWorkspaceWarning = false;
const allowedProjectExtensions = [
    'tags',
    'implicitDependencies',
    'configFilePath',
    '$schema',
    'generators',
    'namedInputs',
    'name',
];
const allowedWorkspaceExtensions = [
    'implicitDependencies',
    'affected',
    'npmScope',
    'tasksRunnerOptions',
    'workspaceLayout',
    'plugins',
    'targetDefaults',
    'files',
    'generators',
    'namedInputs',
];
if (!patched) {
    Module.prototype.require = function () {
        const result = originalRequire.apply(this, arguments);
        if (arguments[0].startsWith('@angular-devkit/core')) {
            // Register `workspace.json` as a nonstandard workspace config file
            const ngCoreWorkspace = originalRequire.apply(this, [
                `@angular-devkit/core/src/workspace/core`,
            ]);
            ngCoreWorkspace._test_addWorkspaceFile('workspace.json', ngCoreWorkspace.WorkspaceFormat.JSON);
            mockReadWorkspace(ngCoreWorkspace);
            mockWriteWorkspace(ngCoreWorkspace);
            const readJsonUtils = originalRequire.apply(this, [
                `@angular-devkit/core/src/workspace/json/reader`,
            ]);
            mockReadJsonWorkspace(readJsonUtils);
        }
        return result;
    };
    try {
        require('@angular-devkit/build-angular/src/utils/version').Version.assertCompatibleAngularVersion =
            () => { };
    }
    catch (e) { }
    try {
        require('@angular-devkit/build-angular/src/utils/version').assertCompatibleAngularVersion =
            () => { };
    }
    catch (e) { }
    patched = true;
}
function mockReadWorkspace(ngCoreWorkspace) {
    mockMember(ngCoreWorkspace, 'readWorkspace', (originalReadWorkspace) => (path, ...rest) => {
        const configFile = (0, workspaces_1.workspaceConfigName)(workspace_root_1.workspaceRoot);
        if (!configFile) {
            path = 'workspace.json';
        }
        return originalReadWorkspace.apply(this, [path, ...rest]);
    });
}
function mockWriteWorkspace(ngCoreWorkspace) {
    mockMember(ngCoreWorkspace, 'writeWorkspace', (originalWriteWorkspace) => (...args) => {
        const configFile = (0, workspaces_1.workspaceConfigName)(workspace_root_1.workspaceRoot);
        if (!loggedWriteWorkspaceWarning) {
            if (configFile) {
                logger_1.logger.warn(`[NX] Angular devkit called \`writeWorkspace\`, this may have had unintended consequences in ${configFile}`);
                logger_1.logger.warn(`[NX] Double check ${configFile} before proceeding`);
            }
            else {
                logger_1.logger.warn(`[NX] Angular devkit called \`writeWorkspace\`, this may have created 'workspace.json' or 'angular.json`);
                logger_1.logger.warn(`[NX] Double check workspace configuration before proceeding`);
            }
            loggedWriteWorkspaceWarning = true;
        }
        return originalWriteWorkspace.apply(this, args);
    });
}
/**
 * Patch readJsonWorkspace to inline project configurations
 * as well as work in workspaces without a central workspace file.
 *
 * NOTE: We hide warnings that would be logged during this process.
 */
function mockReadJsonWorkspace(readJsonUtils) {
    mockMember(readJsonUtils, 'readJsonWorkspace', (originalReadJsonWorkspace) => (path, host, options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const modifiedOptions = Object.assign(Object.assign({}, options), { allowedProjectExtensions,
            allowedWorkspaceExtensions });
        try {
            // Attempt angular CLI default behaviour
            return yield originalReadJsonWorkspace(path, host, modifiedOptions);
        }
        catch (_a) {
            // This failed. Its most likely due to a lack of a workspace definition file,
            // or other things that are different between NgCLI and Nx config files.
            logger_1.logger.debug('[NX] Angular devkit readJsonWorkspace fell back to Nx workspaces logic');
            const projectGraph = yield (0, project_graph_1.createProjectGraphAsync)();
            const nxJson = (0, configuration_1.readNxJson)();
            // Construct old workspace.json format from project graph
            const w = Object.assign(Object.assign({}, nxJson), (0, project_graph_1.readProjectsConfigurationFromProjectGraph)(projectGraph));
            // Read our v1 workspace schema
            const workspaceConfiguration = (0, workspaces_1.resolveOldFormatWithInlineProjects)(w);
            // readJsonWorkspace actually has AST parsing + more, so we
            // still need to call it rather than just return our file
            return originalReadJsonWorkspace.apply(this, [
                'workspace.json',
                {
                    // second arg is a host, only method used is readFile
                    readFile: () => JSON.stringify(workspaceConfiguration),
                },
                modifiedOptions,
            ]);
        }
    }));
}
function mockMember(obj, method, factory) {
    obj[method] = factory(obj[method]);
}
//# sourceMappingURL=compat.js.map