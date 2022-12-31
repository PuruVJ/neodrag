"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const build_explicit_typescript_and_package_json_dependencies_1 = require("./build-dependencies/build-explicit-typescript-and-package-json-dependencies");
let workspace;
let projectGraph;
let jsPluginConfig;
worker_threads_1.parentPort.on('message', (message) => {
    if (message.workspace) {
        workspace = message.workspace;
        projectGraph = message.projectGraph;
        jsPluginConfig = message.jsPluginConfig;
    }
    else {
        const res = (0, build_explicit_typescript_and_package_json_dependencies_1.buildExplicitTypescriptAndPackageJsonDependencies)(jsPluginConfig, workspace, projectGraph, message.filesToProcess);
        worker_threads_1.parentPort.postMessage(res);
    }
});
//# sourceMappingURL=project-graph-worker.js.map