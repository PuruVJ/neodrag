"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceLint = void 0;
const tslib_1 = require("tslib");
const workspace_integrity_checks_1 = require("./workspace-integrity-checks");
const configuration_1 = require("../config/configuration");
const output_1 = require("../utils/output");
const path = require("path");
const project_graph_1 = require("../project-graph/project-graph");
function workspaceLint() {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const graph = yield (0, project_graph_1.createProjectGraphAsync)({ exitOnError: true });
        const allWorkspaceFiles = graph.allWorkspaceFiles;
        const integrityMessages = new workspace_integrity_checks_1.WorkspaceIntegrityChecks(graph, readAllFilesFromAppsAndLibs(allWorkspaceFiles)).run();
        for (const message of integrityMessages.warn) {
            output_1.output.warn(message);
        }
        if (((_a = integrityMessages.error) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            integrityMessages.error.forEach((errorConfig) => {
                output_1.output.error(errorConfig);
            });
            process.exit(1);
        }
    });
}
exports.workspaceLint = workspaceLint;
function readAllFilesFromAppsAndLibs(allWorkspaceFiles) {
    const wl = (0, configuration_1.workspaceLayout)();
    return allWorkspaceFiles
        .map((f) => f.file)
        .filter((f) => f.startsWith(`${wl.appsDir}/`) || f.startsWith(`${wl.libsDir}/`))
        .filter((f) => !path.basename(f).startsWith('.'));
}
//# sourceMappingURL=lint.js.map