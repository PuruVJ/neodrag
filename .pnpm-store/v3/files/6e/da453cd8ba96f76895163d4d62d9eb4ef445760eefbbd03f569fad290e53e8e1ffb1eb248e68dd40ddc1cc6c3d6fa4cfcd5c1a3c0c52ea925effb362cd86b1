"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const format_changed_files_with_prettier_if_available_1 = require("../../generators/internal-utils/format-changed-files-with-prettier-if-available");
const project_configuration_1 = require("../../generators/utils/project-configuration");
const path_1 = require("../../utils/path");
const path_2 = require("path");
const json_1 = require("../../generators/utils/json");
const skippedFiles = [
    'package.json',
    'babel.config.json',
    'karma.conf.js',
    'jest.preset.js',
    '.storybook',
    // Will be handled by @nrwl/linter
    '.eslintrc.json',
    '.eslintrc.js',
];
function default_1(tree) {
    var _a, _b, _c, _d, _e, _f, _g;
    var _h, _j;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // If the workspace doesn't have a nx.json, don't make any changes
        if (!tree.exists('nx.json')) {
            return;
        }
        const workspaceConfiguration = (0, project_configuration_1.readWorkspaceConfiguration)(tree);
        // If this is a npm workspace, don't make any changes
        if (workspaceConfiguration.extends === 'nx/presets/npm.json') {
            return;
        }
        (_a = workspaceConfiguration.namedInputs) !== null && _a !== void 0 ? _a : (workspaceConfiguration.namedInputs = {
            default: ['{projectRoot}/**/*', 'sharedGlobals'],
            sharedGlobals: [],
            production: ['default'],
        });
        if (isBuildATarget(tree)) {
            (_b = workspaceConfiguration.targetDefaults) !== null && _b !== void 0 ? _b : (workspaceConfiguration.targetDefaults = {});
            (_c = (_h = workspaceConfiguration.targetDefaults).build) !== null && _c !== void 0 ? _c : (_h.build = {});
            (_d = (_j = workspaceConfiguration.targetDefaults.build).inputs) !== null && _d !== void 0 ? _d : (_j.inputs = [
                'production',
                '^production',
            ]);
        }
        if (workspaceConfiguration.implicitDependencies) {
            const projects = (0, project_configuration_1.getProjects)(tree);
            for (const [files, dependents] of Object.entries(workspaceConfiguration.implicitDependencies)) {
                // Skip these because other plugins take care of them
                if (skippedFiles.includes(files)) {
                    continue;
                }
                else if (Array.isArray(dependents)) {
                    workspaceConfiguration.namedInputs.projectSpecificFiles = [];
                    const defaultFileset = new Set((_e = workspaceConfiguration.namedInputs.default) !== null && _e !== void 0 ? _e : [
                        '{projectRoot}/**/*',
                        'sharedGlobals',
                    ]);
                    defaultFileset.add('projectSpecificFiles');
                    workspaceConfiguration.namedInputs.default = Array.from(defaultFileset);
                    for (const dependent of dependents) {
                        const project = projects.get(dependent);
                        (_f = project.namedInputs) !== null && _f !== void 0 ? _f : (project.namedInputs = {});
                        const projectSpecificFileset = new Set((_g = project.namedInputs.projectSpecificFiles) !== null && _g !== void 0 ? _g : []);
                        projectSpecificFileset.add((0, path_1.joinPathFragments)('{workspaceRoot}', files));
                        project.namedInputs.projectSpecificFiles = Array.from(projectSpecificFileset);
                        try {
                            (0, project_configuration_1.updateProjectConfiguration)(tree, dependent, project);
                        }
                        catch (_k) {
                            if (tree.exists((0, path_2.join)(project.root, 'package.json'))) {
                                (0, json_1.updateJson)(tree, (0, path_2.join)(project.root, 'package.json'), (json) => {
                                    var _a, _b, _c;
                                    var _d, _e;
                                    (_a = json.nx) !== null && _a !== void 0 ? _a : (json.nx = {});
                                    (_b = (_d = json.nx).namedInputs) !== null && _b !== void 0 ? _b : (_d.namedInputs = {});
                                    (_c = (_e = json.nx.namedInputs).projectSpecificFiles) !== null && _c !== void 0 ? _c : (_e.projectSpecificFiles = project.namedInputs.projectSpecificFiles);
                                    return json;
                                });
                            }
                        }
                    }
                }
                else {
                    workspaceConfiguration.namedInputs.sharedGlobals.push((0, path_1.joinPathFragments)('{workspaceRoot}', files));
                }
            }
            delete workspaceConfiguration.implicitDependencies;
        }
        (0, project_configuration_1.updateWorkspaceConfiguration)(tree, workspaceConfiguration);
        yield (0, format_changed_files_with_prettier_if_available_1.formatChangedFilesWithPrettierIfAvailable)(tree);
    });
}
exports.default = default_1;
function isBuildATarget(tree) {
    var _a;
    const projects = (0, project_configuration_1.getProjects)(tree);
    for (const [_, project] of projects) {
        if ((_a = project.targets) === null || _a === void 0 ? void 0 : _a.build) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=migrate-to-inputs.js.map