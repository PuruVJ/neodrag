"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildExplicitTypeScriptDependencies = void 0;
const typescript_import_locator_1 = require("./typescript-import-locator");
const target_project_locator_1 = require("../../utils/target-project-locator");
function buildExplicitTypeScriptDependencies(workspace, graph, filesToProcess) {
    function isRoot(projectName) {
        var _a, _b;
        return ((_b = (_a = graph.nodes[projectName]) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.root) === '.';
    }
    const importLocator = new typescript_import_locator_1.TypeScriptImportLocator();
    const targetProjectLocator = new target_project_locator_1.TargetProjectLocator(graph.nodes, graph.externalNodes);
    const res = [];
    Object.keys(filesToProcess).forEach((source) => {
        Object.values(filesToProcess[source]).forEach((f) => {
            importLocator.fromFile(f.file, (importExpr, filePath, type) => {
                const target = targetProjectLocator.findProjectWithImport(importExpr, f.file);
                if (target) {
                    if (!isRoot(source) && isRoot(target)) {
                        // TODO: These edges technically should be allowed but we need to figure out how to separate config files out from root
                        return;
                    }
                    res.push({
                        sourceProjectName: source,
                        targetProjectName: target,
                        sourceProjectFile: f.file,
                    });
                }
            });
        });
    });
    return res;
}
exports.buildExplicitTypeScriptDependencies = buildExplicitTypeScriptDependencies;
//# sourceMappingURL=explicit-project-dependencies.js.map