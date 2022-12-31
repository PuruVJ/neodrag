"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const format_changed_files_with_prettier_if_available_1 = require("../../generators/internal-utils/format-changed-files-with-prettier-if-available");
const project_configuration_1 = require("../../generators/utils/project-configuration");
const path_1 = require("../../utils/path");
const path_2 = require("path");
const utils_1 = require("../../tasks-runner/utils");
const json_1 = require("../../generators/utils/json");
function default_1(tree) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // If the workspace doesn't have a nx.json, don't make any changes
        if (!tree.exists('nx.json')) {
            return;
        }
        const workspaceConfiguration = (0, project_configuration_1.readWorkspaceConfiguration)(tree);
        for (const [projectName, project] of (0, project_configuration_1.getProjects)(tree)) {
            if (!project.targets) {
                continue;
            }
            for (const [_, target] of Object.entries(project.targets)) {
                if (!target.outputs) {
                    continue;
                }
                try {
                    (0, utils_1.validateOutputs)(target.outputs);
                }
                catch (e) {
                    target.outputs = (0, utils_1.transformLegacyOutputs)(project.root, e);
                }
            }
            try {
                (0, project_configuration_1.updateProjectConfiguration)(tree, projectName, project);
            }
            catch (_a) {
                if (tree.exists((0, path_2.join)(project.root, 'package.json'))) {
                    (0, json_1.updateJson)(tree, (0, path_2.join)(project.root, 'package.json'), (json) => {
                        var _a, _b;
                        var _c;
                        (_a = json.nx) !== null && _a !== void 0 ? _a : (json.nx = {});
                        (_b = (_c = json.nx).targets) !== null && _b !== void 0 ? _b : (_c.targets = project.targets);
                        return json;
                    });
                }
            }
        }
        if (workspaceConfiguration.targetDefaults) {
            for (const [_, target] of Object.entries(workspaceConfiguration.targetDefaults)) {
                if (!target.outputs) {
                    continue;
                }
                target.outputs = target.outputs.map((output) => {
                    return /^{[\s\S]+}/.test(output)
                        ? output
                        : (0, path_1.joinPathFragments)('{workspaceRoot}', output);
                });
            }
            (0, project_configuration_1.updateWorkspaceConfiguration)(tree, workspaceConfiguration);
        }
        yield (0, format_changed_files_with_prettier_if_available_1.formatChangedFilesWithPrettierIfAvailable)(tree);
    });
}
exports.default = default_1;
//# sourceMappingURL=prefix-outputs.js.map