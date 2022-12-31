"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const project_configuration_1 = require("../../generators/utils/project-configuration");
const format_changed_files_with_prettier_if_available_1 = require("../../generators/internal-utils/format-changed-files-with-prettier-if-available");
function default_1(tree) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const workspaceConfiguration = (0, project_configuration_1.readWorkspaceConfiguration)(tree);
        if (workspaceConfiguration.targetDependencies) {
            workspaceConfiguration.targetDefaults = {};
            for (const targetName of Object.keys(workspaceConfiguration.targetDependencies)) {
                const dependsOn = [];
                for (const c of workspaceConfiguration.targetDependencies[targetName]) {
                    if (typeof c === 'string') {
                        dependsOn.push(c);
                    }
                    else if (c.projects === 'self') {
                        dependsOn.push(c.target);
                    }
                    else {
                        dependsOn.push(`^${c.target}`);
                    }
                }
                workspaceConfiguration.targetDefaults[targetName] = {
                    dependsOn,
                };
            }
        }
        delete workspaceConfiguration.targetDependencies;
        (0, project_configuration_1.updateWorkspaceConfiguration)(tree, workspaceConfiguration);
        yield (0, format_changed_files_with_prettier_if_available_1.formatChangedFilesWithPrettierIfAvailable)(tree);
    });
}
exports.default = default_1;
//# sourceMappingURL=create-target-defaults.js.map