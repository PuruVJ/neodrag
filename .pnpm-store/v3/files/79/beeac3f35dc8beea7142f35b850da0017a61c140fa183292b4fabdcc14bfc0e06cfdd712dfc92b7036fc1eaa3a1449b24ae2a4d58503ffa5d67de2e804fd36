"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const project_configuration_1 = require("../../generators/utils/project-configuration");
const fileutils_1 = require("../../utils/fileutils");
const path_1 = require("../../utils/path");
const format_changed_files_with_prettier_if_available_1 = require("../../generators/internal-utils/format-changed-files-with-prettier-if-available");
function default_1(tree) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        for (const [name, value] of (0, project_configuration_1.getProjects)(tree).entries()) {
            if (!value.targets) {
                continue;
            }
            for (const t of Object.values(value.targets)) {
                if (t.outputs) {
                    t.outputs = t.outputs.map((o) => (0, fileutils_1.isRelativePath)(o) ? (0, path_1.joinPathFragments)(value.root, o) : o);
                }
            }
            (0, project_configuration_1.updateProjectConfiguration)(tree, name, value);
        }
        yield (0, format_changed_files_with_prettier_if_available_1.formatChangedFilesWithPrettierIfAvailable)(tree);
    });
}
exports.default = default_1;
//# sourceMappingURL=replace-all-relative-outputs-with-absolute.js.map