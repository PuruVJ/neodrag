"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readEnvironment = void 0;
const configuration_1 = require("../config/configuration");
/**
 * @deprecated Read workspaceJson from projectGraph, and use readNxJson on its own.
 */
function readEnvironment() {
    const nxJson = (0, configuration_1.readNxJson)();
    const workspaceJson = (0, configuration_1.readAllWorkspaceConfiguration)();
    return { nxJson, workspaceJson, workspaceResults: null };
}
exports.readEnvironment = readEnvironment;
//# sourceMappingURL=read-environment.js.map