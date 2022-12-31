"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const project_configuration_1 = require("../../generators/utils/project-configuration");
const format_changed_files_with_prettier_if_available_1 = require("../../generators/internal-utils/format-changed-files-with-prettier-if-available");
function default_1(tree) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const workspaceConfiguration = (0, project_configuration_1.readWorkspaceConfiguration)(tree);
        (_a = workspaceConfiguration.cli) === null || _a === void 0 ? true : delete _a.defaultCollection;
        if (workspaceConfiguration.cli &&
            Object.keys(workspaceConfiguration.cli).length === 0) {
            delete workspaceConfiguration.cli;
        }
        (0, project_configuration_1.updateWorkspaceConfiguration)(tree, workspaceConfiguration);
        yield (0, format_changed_files_with_prettier_if_available_1.formatChangedFilesWithPrettierIfAvailable)(tree);
    });
}
exports.default = default_1;
//# sourceMappingURL=remove-default-collection.js.map