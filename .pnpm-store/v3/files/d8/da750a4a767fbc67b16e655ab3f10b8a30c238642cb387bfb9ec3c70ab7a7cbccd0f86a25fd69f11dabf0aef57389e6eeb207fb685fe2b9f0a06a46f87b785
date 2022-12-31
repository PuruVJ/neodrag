"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const format_changed_files_with_prettier_if_available_1 = require("../../generators/internal-utils/format-changed-files-with-prettier-if-available");
const json_1 = require("../../generators/utils/json");
const project_configuration_1 = require("../../generators/utils/project-configuration");
const logger_1 = require("../../utils/logger");
const path_1 = require("path");
function default_1(tree) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // update nx.json $schema
        const isNxJsonExist = tree.exists('nx.json');
        if (isNxJsonExist) {
            (0, json_1.updateJson)(tree, 'nx.json', (json) => {
                if (!json['$schema']) {
                    json['$schema'] = './node_modules/nx/schemas/nx-schema.json';
                }
                return json;
            });
        }
        // update workspace.json $schema
        const isWorkspaceJsonExist = tree.exists('workspace.json');
        if (isWorkspaceJsonExist) {
            (0, json_1.updateJson)(tree, 'workspace.json', (json) => {
                if (!json['$schema']) {
                    json['$schema'] = './node_modules/nx/schemas/workspace-schema.json';
                }
                return json;
            });
        }
        // update projects $schema
        for (const [projName, projConfig] of (0, project_configuration_1.getProjects)(tree)) {
            if (projConfig['$schema'] ||
                !tree.exists((0, path_1.join)(projConfig.root, 'project.json')))
                continue;
            try {
                const relativeProjectJsonSchemaPath = (0, project_configuration_1.getRelativeProjectJsonSchemaPath)(tree, projConfig);
                (0, project_configuration_1.updateProjectConfiguration)(tree, projName, Object.assign({ $schema: relativeProjectJsonSchemaPath }, projConfig));
            }
            catch (e) {
                logger_1.logger.warn(`Could not add schema for "${projName}": ${e.message}`);
            }
        }
        yield (0, format_changed_files_with_prettier_if_available_1.formatChangedFilesWithPrettierIfAvailable)(tree);
    });
}
exports.default = default_1;
//# sourceMappingURL=add-json-schema.js.map