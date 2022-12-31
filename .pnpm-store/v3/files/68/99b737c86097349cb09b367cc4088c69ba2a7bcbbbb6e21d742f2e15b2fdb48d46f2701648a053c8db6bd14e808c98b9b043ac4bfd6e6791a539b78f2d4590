"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findInstalledCommunityPlugins = exports.readPackageVersion = exports.readPackageJson = exports.reportHandler = exports.patternsWeIgnoreInCommunityReport = exports.packagesWeCareAbout = void 0;
const tslib_1 = require("tslib");
const chalk = require("chalk");
const workspace_root_1 = require("../utils/workspace-root");
const output_1 = require("../utils/output");
const path_1 = require("path");
const package_manager_1 = require("../utils/package-manager");
const fileutils_1 = require("../utils/fileutils");
const package_json_1 = require("../utils/package-json");
const local_plugins_1 = require("../utils/plugins/local-plugins");
const project_graph_1 = require("../project-graph/project-graph");
exports.packagesWeCareAbout = [
    'nx',
    '@nrwl/angular',
    '@nrwl/cypress',
    '@nrwl/detox',
    '@nrwl/devkit',
    '@nrwl/esbuild',
    '@nrwl/eslint-plugin-nx',
    '@nrwl/expo',
    '@nrwl/express',
    '@nrwl/jest',
    '@nrwl/js',
    '@nrwl/linter',
    '@nrwl/nest',
    '@nrwl/next',
    '@nrwl/node',
    '@nrwl/nx-cloud',
    '@nrwl/nx-plugin',
    '@nrwl/react',
    '@nrwl/react-native',
    '@nrwl/rollup',
    '@nrwl/schematics',
    '@nrwl/storybook',
    '@nrwl/web',
    '@nrwl/webpack',
    '@nrwl/workspace',
    '@nrwl/vite',
    'typescript',
];
exports.patternsWeIgnoreInCommunityReport = [
    ...exports.packagesWeCareAbout,
    '@schematics/angular',
    new RegExp('@angular/*'),
    '@nestjs/schematics',
];
/**
 * Reports relevant version numbers for adding to an Nx issue report
 *
 * @remarks
 *
 * Must be run within an Nx workspace
 *
 */
function reportHandler() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const pm = (0, package_manager_1.detectPackageManager)();
        const pmVersion = (0, package_manager_1.getPackageManagerVersion)(pm);
        const bodyLines = [
            `Node : ${process.versions.node}`,
            `OS   : ${process.platform} ${process.arch}`,
            `${pm.padEnd(5)}: ${pmVersion}`,
            ``,
        ];
        exports.packagesWeCareAbout.forEach((p) => {
            bodyLines.push(`${chalk.green(p)} : ${chalk.bold(readPackageVersion(p))}`);
        });
        bodyLines.push('---------------------------------------');
        try {
            const projectGraph = yield (0, project_graph_1.createProjectGraphAsync)({ exitOnError: true });
            bodyLines.push('Local workspace plugins:');
            const plugins = (0, local_plugins_1.getLocalWorkspacePlugins)((0, project_graph_1.readProjectsConfigurationFromProjectGraph)(projectGraph)).keys();
            for (const plugin of plugins) {
                bodyLines.push(`\t ${chalk.green(plugin)}`);
            }
            bodyLines.push(...plugins);
        }
        catch (_a) {
            bodyLines.push('Unable to construct project graph');
        }
        bodyLines.push('---------------------------------------');
        const communityPlugins = findInstalledCommunityPlugins();
        bodyLines.push('Community plugins:');
        communityPlugins.forEach((p) => {
            bodyLines.push(`\t ${chalk.green(p.package)}: ${chalk.bold(p.version)}`);
        });
        output_1.output.log({
            title: 'Report complete - copy this into the issue template',
            bodyLines,
        });
    });
}
exports.reportHandler = reportHandler;
function readPackageJson(p) {
    try {
        return (0, package_json_1.readModulePackageJson)(p).packageJson;
    }
    catch (_a) {
        return null;
    }
}
exports.readPackageJson = readPackageJson;
function readPackageVersion(p) {
    var _a;
    return ((_a = readPackageJson(p)) === null || _a === void 0 ? void 0 : _a.version) || 'Not Found';
}
exports.readPackageVersion = readPackageVersion;
function findInstalledCommunityPlugins() {
    const { dependencies, devDependencies } = (0, fileutils_1.readJsonFile)((0, path_1.join)(workspace_root_1.workspaceRoot, 'package.json'));
    const deps = [
        Object.keys(dependencies || {}),
        Object.keys(devDependencies || {}),
    ].flat();
    return deps.reduce((arr, nextDep) => {
        if (exports.patternsWeIgnoreInCommunityReport.some((pattern) => typeof pattern === 'string'
            ? pattern === nextDep
            : pattern.test(nextDep))) {
            return arr;
        }
        try {
            const depPackageJson = readPackageJson(nextDep) || {};
            if ([
                'ng-update',
                'nx-migrations',
                'schematics',
                'generators',
                'builders',
                'executors',
            ].some((field) => field in depPackageJson)) {
                arr.push({ package: nextDep, version: depPackageJson.version });
                return arr;
            }
            else {
                return arr;
            }
        }
        catch (_a) {
            console.warn(`Error parsing packageJson for ${nextDep}`);
            return arr;
        }
    }, []);
}
exports.findInstalledCommunityPlugins = findInstalledCommunityPlugins;
//# sourceMappingURL=report.js.map