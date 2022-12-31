"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const project_configuration_1 = require("../../generators/utils/project-configuration");
const workspaces_1 = require("../../config/workspaces");
const path_1 = require("path");
const json_1 = require("../../generators/utils/json");
const format_changed_files_with_prettier_if_available_1 = require("../../generators/internal-utils/format-changed-files-with-prettier-if-available");
function default_1(tree) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const nxJson = (0, project_configuration_1.readNxJson)(tree);
        const projectFiles = (0, workspaces_1.globForProjectFiles)(tree.root, nxJson);
        const projectJsons = projectFiles.filter((f) => f.endsWith('project.json'));
        for (let f of projectJsons) {
            const projectJson = (0, json_1.readJson)(tree, f);
            if (!projectJson.name) {
                projectJson.name = toProjectName((0, path_1.dirname)(f), nxJson);
                (0, json_1.writeJson)(tree, f, projectJson);
            }
        }
        yield (0, format_changed_files_with_prettier_if_available_1.formatChangedFilesWithPrettierIfAvailable)(tree);
    });
}
exports.default = default_1;
function toProjectName(directory, nxJson) {
    let { appsDir, libsDir } = (nxJson === null || nxJson === void 0 ? void 0 : nxJson.workspaceLayout) || {};
    appsDir !== null && appsDir !== void 0 ? appsDir : (appsDir = 'apps');
    libsDir !== null && libsDir !== void 0 ? libsDir : (libsDir = 'libs');
    const parts = directory.split(/[\/\\]/g);
    if ([appsDir, libsDir].includes(parts[0])) {
        parts.splice(0, 1);
    }
    return parts.join('-').toLowerCase();
}
//# sourceMappingURL=set-project-names.js.map