"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildExplicitPackageJsonDependencies = void 0;
const file_utils_1 = require("../file-utils");
const path_1 = require("path");
const json_1 = require("../../utils/json");
const path_2 = require("../../utils/path");
class ProjectGraphNodeRecords {
}
function buildExplicitPackageJsonDependencies(workspace, graph, filesToProcess) {
    const res = [];
    let packageNameMap = undefined;
    Object.keys(filesToProcess).forEach((source) => {
        Object.values(filesToProcess[source]).forEach((f) => {
            if (isPackageJsonAtProjectRoot(graph.nodes, f.file)) {
                // we only create the package name map once and only if a package.json file changes
                packageNameMap = packageNameMap || createPackageNameMap(workspace);
                processPackageJson(source, f.file, graph, res, packageNameMap);
            }
        });
    });
    return res;
}
exports.buildExplicitPackageJsonDependencies = buildExplicitPackageJsonDependencies;
function createPackageNameMap(w) {
    var _a;
    const res = {};
    for (let projectName of Object.keys(w.projects)) {
        try {
            const packageJson = (0, json_1.parseJson)((0, file_utils_1.defaultFileRead)((0, path_1.join)(w.projects[projectName].root, 'package.json')));
            res[(_a = packageJson.name) !== null && _a !== void 0 ? _a : (0, path_2.getImportPath)(w.npmScope, projectName)] =
                projectName;
        }
        catch (e) { }
    }
    return res;
}
function isPackageJsonAtProjectRoot(nodes, fileName) {
    return Object.values(nodes).find((projectNode) => (projectNode.type === 'lib' || projectNode.type === 'app') &&
        (0, path_2.joinPathFragments)(projectNode.data.root, 'package.json') === fileName);
}
function processPackageJson(sourceProject, fileName, graph, collectedDeps, packageNameMap) {
    try {
        const deps = readDeps((0, json_1.parseJson)((0, file_utils_1.defaultFileRead)(fileName)));
        // the name matches the import path
        deps.forEach((d) => {
            // package.json refers to another project in the monorepo
            if (packageNameMap[d]) {
                collectedDeps.push({
                    sourceProjectName: sourceProject,
                    targetProjectName: packageNameMap[d],
                    sourceProjectFile: fileName,
                });
            }
            else if (graph.externalNodes[`npm:${d}`]) {
                collectedDeps.push({
                    sourceProjectName: sourceProject,
                    targetProjectName: `npm:${d}`,
                    sourceProjectFile: fileName,
                });
            }
        });
    }
    catch (e) {
        if (process.env.NX_VERBOSE_LOGGING === 'true') {
            console.log(e);
        }
    }
}
function readDeps(packageJsonDeps) {
    var _a, _b, _c;
    return [
        ...Object.keys((_a = packageJsonDeps === null || packageJsonDeps === void 0 ? void 0 : packageJsonDeps.dependencies) !== null && _a !== void 0 ? _a : {}),
        ...Object.keys((_b = packageJsonDeps === null || packageJsonDeps === void 0 ? void 0 : packageJsonDeps.devDependencies) !== null && _b !== void 0 ? _b : {}),
        ...Object.keys((_c = packageJsonDeps === null || packageJsonDeps === void 0 ? void 0 : packageJsonDeps.peerDependencies) !== null && _c !== void 0 ? _c : {}),
    ];
}
//# sourceMappingURL=explicit-package-json-dependencies.js.map