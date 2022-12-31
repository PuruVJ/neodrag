"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceLayout = exports.readAllWorkspaceConfiguration = exports.readNxJson = void 0;
const workspaces_1 = require("./workspaces");
const workspace_root_1 = require("../utils/workspace-root");
function readNxJson() {
    return new workspaces_1.Workspaces(workspace_root_1.workspaceRoot).readNxJson();
}
exports.readNxJson = readNxJson;
// TODO(v16): Remove this
/**
 * @deprecated Use readProjectsConfigurationFromProjectGraph(await createProjectGraphAsync())
 */
function readAllWorkspaceConfiguration() {
    return new workspaces_1.Workspaces(workspace_root_1.workspaceRoot).readWorkspaceConfiguration();
}
exports.readAllWorkspaceConfiguration = readAllWorkspaceConfiguration;
/**
 * Returns information about where apps and libs will be created.
 */
function workspaceLayout() {
    var _a, _b, _c, _d;
    const nxJson = readNxJson();
    return {
        appsDir: (_b = (_a = nxJson.workspaceLayout) === null || _a === void 0 ? void 0 : _a.appsDir) !== null && _b !== void 0 ? _b : 'apps',
        libsDir: (_d = (_c = nxJson.workspaceLayout) === null || _c === void 0 ? void 0 : _c.libsDir) !== null && _d !== void 0 ? _d : 'libs',
    };
}
exports.workspaceLayout = workspaceLayout;
//# sourceMappingURL=configuration.js.map