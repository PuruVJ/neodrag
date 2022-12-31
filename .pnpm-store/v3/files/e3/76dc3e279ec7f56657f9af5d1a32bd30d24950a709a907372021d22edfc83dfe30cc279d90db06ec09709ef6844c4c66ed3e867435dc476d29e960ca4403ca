"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listHandler = void 0;
const tslib_1 = require("tslib");
const workspace_root_1 = require("../utils/workspace-root");
const output_1 = require("../utils/output");
const plugins_1 = require("../utils/plugins");
const local_plugins_1 = require("../utils/plugins/local-plugins");
const project_graph_1 = require("../project-graph/project-graph");
/**
 * List available plugins or capabilities within a specific plugin
 *
 * @remarks
 *
 * Must be run within an Nx workspace
 *
 */
function listHandler(args) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (args.plugin) {
            (0, plugins_1.listPluginCapabilities)(args.plugin);
        }
        else {
            const corePlugins = (0, plugins_1.fetchCorePlugins)();
            const communityPlugins = yield (0, plugins_1.fetchCommunityPlugins)().catch(() => {
                output_1.output.warn({
                    title: `Community plugins:`,
                    bodyLines: [`Error fetching plugins.`],
                });
                return [];
            });
            const projectGraph = yield (0, project_graph_1.createProjectGraphAsync)({ exitOnError: true });
            const localPlugins = (0, local_plugins_1.getLocalWorkspacePlugins)((0, project_graph_1.readProjectsConfigurationFromProjectGraph)(projectGraph));
            const installedPlugins = (0, plugins_1.getInstalledPluginsFromPackageJson)(workspace_root_1.workspaceRoot, corePlugins, communityPlugins);
            (0, local_plugins_1.listLocalWorkspacePlugins)(localPlugins);
            (0, plugins_1.listInstalledPlugins)(installedPlugins);
            (0, plugins_1.listCorePlugins)(installedPlugins, corePlugins);
            (0, plugins_1.listCommunityPlugins)(installedPlugins, communityPlugins);
            output_1.output.note({
                title: `Use "nx list [plugin]" to find out more`,
            });
        }
    });
}
exports.listHandler = listHandler;
//# sourceMappingURL=list.js.map