"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const project_graph_1 = require("../src/project-graph/project-graph");
const workspace_root_1 = require("../src/utils/workspace-root");
const fileutils_1 = require("../src/utils/fileutils");
const path_1 = require("path");
const client_1 = require("../src/daemon/client/client");
(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        if (isMainNxPackage() && (0, fileutils_1.fileExists)((0, path_1.join)(workspace_root_1.workspaceRoot, 'nx.json'))) {
            try {
                yield client_1.daemonClient.stop();
            }
            catch (e) { }
            const b = new Date();
            yield (0, project_graph_1.buildProjectGraphWithoutDaemon)();
            const a = new Date();
            if (process.env.NX_VERBOSE_LOGGING === 'true') {
                console.log(`Nx project graph has been precomputed in ${a.getTime() - b.getTime()}ms`);
            }
        }
    }
    catch (e) {
        if (process.env.NX_VERBOSE_LOGGING === 'true') {
            console.log(e);
        }
    }
}))();
function isMainNxPackage() {
    const mainNxPath = require.resolve('nx', {
        paths: [workspace_root_1.workspaceRoot],
    });
    const thisNxPath = require.resolve('nx');
    return mainNxPath === thisNxPath;
}
//# sourceMappingURL=compute-project-graph.js.map