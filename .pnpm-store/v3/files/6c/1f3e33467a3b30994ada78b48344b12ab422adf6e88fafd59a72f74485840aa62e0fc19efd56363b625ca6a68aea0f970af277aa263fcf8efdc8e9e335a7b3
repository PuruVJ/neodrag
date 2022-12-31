"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPluginCapabilities = exports.getPluginCapabilities = void 0;
const workspace_root_1 = require("../workspace-root");
const chalk = require("chalk");
const path_1 = require("path");
const output_1 = require("../output");
const shared_1 = require("./shared");
const fileutils_1 = require("../fileutils");
const package_manager_1 = require("../package-manager");
const nx_plugin_1 = require("../nx-plugin");
function tryGetCollection(packageJsonPath, collectionFile, propName) {
    if (!collectionFile) {
        return null;
    }
    try {
        const collectionFilePath = (0, path_1.join)((0, path_1.dirname)(packageJsonPath), collectionFile);
        return (0, fileutils_1.readJsonFile)(collectionFilePath)[propName];
    }
    catch (_a) {
        return null;
    }
}
function getPluginCapabilities(workspaceRoot, pluginName) {
    try {
        const { json: packageJson, path: packageJsonPath } = (0, nx_plugin_1.readPluginPackageJson)(pluginName);
        return {
            name: pluginName,
            generators: tryGetCollection(packageJsonPath, packageJson.generators, 'generators') ||
                tryGetCollection(packageJsonPath, packageJson.schematics, 'generators') ||
                tryGetCollection(packageJsonPath, packageJson.schematics, 'generators') ||
                tryGetCollection(packageJsonPath, packageJson.schematics, 'schematics'),
            executors: tryGetCollection(packageJsonPath, packageJson.executors, 'executors') ||
                tryGetCollection(packageJsonPath, packageJson.executors, 'builders') ||
                tryGetCollection(packageJsonPath, packageJson.builders, 'executors') ||
                tryGetCollection(packageJsonPath, packageJson.builders, 'builders'),
        };
    }
    catch (_a) {
        return null;
    }
}
exports.getPluginCapabilities = getPluginCapabilities;
function listPluginCapabilities(pluginName) {
    const plugin = getPluginCapabilities(workspace_root_1.workspaceRoot, pluginName);
    if (!plugin) {
        const pmc = (0, package_manager_1.getPackageManagerCommand)();
        output_1.output.note({
            title: `${pluginName} is not currently installed`,
            bodyLines: [
                `Use "${pmc.addDev} ${pluginName}" to install the plugin.`,
                `After that, use "${pmc.exec} nx g ${pluginName}:init" to add the required peer deps and initialize the plugin.`,
            ],
        });
        return;
    }
    const hasBuilders = (0, shared_1.hasElements)(plugin.executors);
    const hasGenerators = (0, shared_1.hasElements)(plugin.generators);
    if (!hasBuilders && !hasGenerators) {
        output_1.output.warn({ title: `No capabilities found in ${pluginName}` });
        return;
    }
    const bodyLines = [];
    if (hasGenerators) {
        bodyLines.push(chalk.bold(chalk.green('GENERATORS')));
        bodyLines.push('');
        bodyLines.push(...Object.keys(plugin.generators).map((name) => `${chalk.bold(name)} : ${plugin.generators[name].description}`));
        if (hasBuilders) {
            bodyLines.push('');
        }
    }
    if (hasBuilders) {
        bodyLines.push(chalk.bold(chalk.green('EXECUTORS/BUILDERS')));
        bodyLines.push('');
        bodyLines.push(...Object.keys(plugin.executors).map((name) => `${chalk.bold(name)} : ${plugin.executors[name].description}`));
    }
    output_1.output.log({
        title: `Capabilities in ${plugin.name}:`,
        bodyLines,
    });
}
exports.listPluginCapabilities = listPluginCapabilities;
//# sourceMappingURL=plugin-capabilities.js.map