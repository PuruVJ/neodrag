"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildExplicitTypescriptAndPackageJsonDependencies = void 0;
const explicit_project_dependencies_1 = require("./explicit-project-dependencies");
const explicit_package_json_dependencies_1 = require("./explicit-package-json-dependencies");
function buildExplicitTypescriptAndPackageJsonDependencies(jsPluginConfig, workspace, projectGraph, filesToProcess) {
    let res = [];
    if (jsPluginConfig.analyzeSourceFiles === undefined ||
        jsPluginConfig.analyzeSourceFiles === true) {
        res = res.concat((0, explicit_project_dependencies_1.buildExplicitTypeScriptDependencies)(workspace, projectGraph, filesToProcess));
    }
    if (jsPluginConfig.analyzePackageJson === undefined ||
        jsPluginConfig.analyzePackageJson === true) {
        res = res.concat((0, explicit_package_json_dependencies_1.buildExplicitPackageJsonDependencies)(workspace, projectGraph, filesToProcess));
    }
    return res;
}
exports.buildExplicitTypescriptAndPackageJsonDependencies = buildExplicitTypescriptAndPackageJsonDependencies;
//# sourceMappingURL=build-explicit-typescript-and-package-json-dependencies.js.map