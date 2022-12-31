"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWorkspaceProjectNodes = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const workspace_root_1 = require("../../utils/workspace-root");
const nx_plugin_1 = require("../../utils/nx-plugin");
const project_graph_utils_1 = require("../../utils/project-graph-utils");
const fileutils_1 = require("../../utils/fileutils");
const logger_1 = require("../../utils/logger");
function buildWorkspaceProjectNodes(ctx, builder, nxJson) {
    const toAdd = [];
    Object.keys(ctx.workspace.projects).forEach((key) => {
        const p = ctx.workspace.projects[key];
        const projectRoot = (0, path_1.join)(workspace_root_1.workspaceRoot, p.root);
        if ((0, fs_1.existsSync)((0, path_1.join)(projectRoot, 'package.json'))) {
            p.targets = (0, project_graph_utils_1.mergeNpmScriptsWithTargets)(projectRoot, p.targets);
            try {
                const { nx } = (0, fileutils_1.readJsonFile)((0, path_1.join)(projectRoot, 'package.json'));
                if (nx === null || nx === void 0 ? void 0 : nx.tags) {
                    p.tags = [...(p.tags || []), ...nx.tags];
                }
                if (nx === null || nx === void 0 ? void 0 : nx.implicitDependencies) {
                    p.implicitDependencies = [
                        ...(p.implicitDependencies || []),
                        ...nx.implicitDependencies,
                    ];
                }
                if (nx === null || nx === void 0 ? void 0 : nx.namedInputs) {
                    p.namedInputs = Object.assign(Object.assign({}, (p.namedInputs || {})), nx.namedInputs);
                }
            }
            catch (_a) {
                // ignore json parser errors
            }
        }
        p.targets = normalizeProjectTargets(p.targets, nxJson.targetDefaults, key);
        p.targets = (0, nx_plugin_1.mergePluginTargetsWithNxTargets)(p.root, p.targets, (0, nx_plugin_1.loadNxPlugins)(ctx.workspace.plugins));
        // TODO: remove in v16
        const projectType = p.projectType === 'application'
            ? key.endsWith('-e2e') || key === 'e2e'
                ? 'e2e'
                : 'app'
            : 'lib';
        const tags = ctx.workspace.projects && ctx.workspace.projects[key]
            ? ctx.workspace.projects[key].tags || []
            : [];
        toAdd.push({
            name: key,
            type: projectType,
            data: Object.assign(Object.assign({}, p), { tags, files: ctx.fileMap[key] }),
        });
    });
    // Sort by root directory length (do we need this?)
    toAdd.sort((a, b) => {
        if (!a.data.root)
            return -1;
        if (!b.data.root)
            return -1;
        return a.data.root.length > b.data.root.length ? -1 : 1;
    });
    toAdd.forEach((n) => {
        builder.addNode({
            name: n.name,
            type: n.type,
            data: n.data,
        });
    });
}
exports.buildWorkspaceProjectNodes = buildWorkspaceProjectNodes;
/**
 * Apply target defaults and normalization
 */
function normalizeProjectTargets(targets, defaultTargets, projectName) {
    for (const targetName in defaultTargets) {
        const target = targets === null || targets === void 0 ? void 0 : targets[targetName];
        if (!target) {
            continue;
        }
        if (defaultTargets[targetName].inputs && !target.inputs) {
            target.inputs = defaultTargets[targetName].inputs;
        }
        if (defaultTargets[targetName].dependsOn && !target.dependsOn) {
            target.dependsOn = defaultTargets[targetName].dependsOn;
        }
        if (defaultTargets[targetName].outputs && !target.outputs) {
            target.outputs = defaultTargets[targetName].outputs;
        }
    }
    for (const target in targets) {
        const config = targets[target];
        if (config.command) {
            if (config.executor) {
                throw new Error(`${logger_1.NX_PREFIX} ${projectName}: ${target} should not have executor and command both configured.`);
            }
            else {
                targets[target] = Object.assign(Object.assign({}, targets[target]), { executor: 'nx:run-commands', options: Object.assign(Object.assign({}, config.options), { command: config.command }) });
            }
        }
    }
    return targets;
}
//# sourceMappingURL=workspace-projects.js.map