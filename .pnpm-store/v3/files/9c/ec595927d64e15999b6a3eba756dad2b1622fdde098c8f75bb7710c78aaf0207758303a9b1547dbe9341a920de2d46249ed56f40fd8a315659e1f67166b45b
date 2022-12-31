"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildNpmPackageNodes = void 0;
const path_1 = require("path");
const workspace_root_1 = require("../../utils/workspace-root");
const fileutils_1 = require("../../utils/fileutils");
function buildNpmPackageNodes(builder) {
    const packageJson = (0, fileutils_1.readJsonFile)((0, path_1.join)(workspace_root_1.workspaceRoot, 'package.json'));
    const deps = Object.assign(Object.assign({}, packageJson.dependencies), packageJson.devDependencies);
    Object.keys(deps).forEach((d) => {
        builder.addExternalNode({
            type: 'npm',
            name: `npm:${d}`,
            data: {
                version: deps[d],
                packageName: d,
            },
        });
    });
}
exports.buildNpmPackageNodes = buildNpmPackageNodes;
//# sourceMappingURL=npm-packages.js.map