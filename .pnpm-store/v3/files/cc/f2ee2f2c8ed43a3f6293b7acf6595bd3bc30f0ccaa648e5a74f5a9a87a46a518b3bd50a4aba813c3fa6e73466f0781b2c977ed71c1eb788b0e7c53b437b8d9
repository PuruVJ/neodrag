"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const project_configuration_1 = require("../../generators/utils/project-configuration");
const format_changed_files_with_prettier_if_available_1 = require("../../generators/internal-utils/format-changed-files-with-prettier-if-available");
const path_1 = require("path");
function default_1(tree) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // This looks like it does nothing, but this will actually effectively migrate over all the configs that need to be moved over, but won't touch configs that don't need to be moved
        for (const [projName, projConfig] of (0, project_configuration_1.getProjects)(tree)) {
            if (tree.exists((0, path_1.join)(projConfig.root, 'project.json'))) {
                (0, project_configuration_1.updateProjectConfiguration)(tree, projName, projConfig);
            }
        }
        yield (0, format_changed_files_with_prettier_if_available_1.formatChangedFilesWithPrettierIfAvailable)(tree);
    });
}
exports.default = default_1;
//# sourceMappingURL=remove-roots.js.map