"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTreeWithEmptyV1Workspace = exports.createTreeWithEmptyWorkspace = void 0;
const tree_1 = require("../tree");
/**
 * Creates a host for testing.
 */
function createTreeWithEmptyWorkspace(opts = {}) {
    const tree = new tree_1.FsTree('/virtual', false);
    return addCommonFiles(tree, opts.layout === 'apps-libs');
}
exports.createTreeWithEmptyWorkspace = createTreeWithEmptyWorkspace;
function createTreeWithEmptyV1Workspace() {
    const tree = new tree_1.FsTree('/virtual', false);
    tree.write('/workspace.json', JSON.stringify({ version: 1, projects: {} }));
    return addCommonFiles(tree, true);
}
exports.createTreeWithEmptyV1Workspace = createTreeWithEmptyV1Workspace;
function addCommonFiles(tree, addAppsAndLibsFolders) {
    tree.write('./.prettierrc', JSON.stringify({ singleQuote: true }));
    tree.write('/package.json', JSON.stringify({
        name: 'test-name',
        dependencies: {},
        devDependencies: {},
    }));
    tree.write('/nx.json', JSON.stringify({
        npmScope: 'proj',
        affected: {
            defaultBase: 'main',
        },
        tasksRunnerOptions: {
            default: {
                runner: 'nx/tasks-runners/default',
                options: {
                    cacheableOperations: ['build', 'lint', 'test', 'e2e'],
                },
            },
        },
    }));
    tree.write('/tsconfig.base.json', JSON.stringify({ compilerOptions: { paths: {} } }));
    if (addAppsAndLibsFolders) {
        tree.write('/apps/.gitignore', '');
        tree.write('/libs/.gitignore', '');
    }
    return tree;
}
//# sourceMappingURL=create-tree-with-empty-workspace.js.map