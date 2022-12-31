"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLocalWorkspacePlugins = exports.getLocalWorkspacePlugins = void 0;
const chalk = require("chalk");
const output_1 = require("../output");
const shared_1 = require("./shared");
const fileutils_1 = require("../fileutils");
const path_1 = require("path");
const workspace_root_1 = require("../workspace-root");
const fs_1 = require("fs");
function getLocalWorkspacePlugins(projectsConfiguration) {
    var _a, _b, _c, _d, _e, _f;
    const plugins = new Map();
    for (const project of Object.values(projectsConfiguration.projects)) {
        const packageJsonPath = (0, path_1.join)(workspace_root_1.workspaceRoot, project.root, 'package.json');
        if ((0, fs_1.existsSync)(packageJsonPath)) {
            const packageJson = (0, fileutils_1.readJsonFile)(packageJsonPath);
            const capabilities = {};
            const generatorsPath = (_a = packageJson.generators) !== null && _a !== void 0 ? _a : packageJson.schematics;
            const executorsPath = (_b = packageJson.executors) !== null && _b !== void 0 ? _b : packageJson.builders;
            if (generatorsPath) {
                const file = (0, fileutils_1.readJsonFile)((0, path_1.join)(workspace_root_1.workspaceRoot, project.root, generatorsPath));
                capabilities.generators = (_c = file.generators) !== null && _c !== void 0 ? _c : file.schematics;
            }
            if (executorsPath) {
                const file = (0, fileutils_1.readJsonFile)((0, path_1.join)(workspace_root_1.workspaceRoot, project.root, executorsPath));
                capabilities.executors = (_d = file.executors) !== null && _d !== void 0 ? _d : file.builders;
            }
            if (capabilities.executors || capabilities.generators) {
                plugins.set(packageJson.name, {
                    executors: (_e = capabilities.executors) !== null && _e !== void 0 ? _e : {},
                    generators: (_f = capabilities.generators) !== null && _f !== void 0 ? _f : {},
                    name: packageJson.name,
                });
            }
        }
    }
    return plugins;
}
exports.getLocalWorkspacePlugins = getLocalWorkspacePlugins;
function listLocalWorkspacePlugins(installedPlugins) {
    const bodyLines = [];
    for (const [, p] of installedPlugins) {
        const capabilities = [];
        if ((0, shared_1.hasElements)(p.executors)) {
            capabilities.push('executors');
        }
        if ((0, shared_1.hasElements)(p.generators)) {
            capabilities.push('generators');
        }
        bodyLines.push(`${chalk.bold(p.name)} (${capabilities.join()})`);
    }
    output_1.output.log({
        title: `Local workspace plugins:`,
        bodyLines: bodyLines,
    });
}
exports.listLocalWorkspacePlugins = listLocalWorkspacePlugins;
//# sourceMappingURL=local-plugins.js.map