"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectGraphAdapter = exports.createProjectGraphAsync = exports.buildProjectGraphWithoutDaemon = exports.readProjectsConfigurationFromProjectGraph = exports.readCachedProjectConfiguration = exports.readCachedProjectGraph = void 0;
const tslib_1 = require("tslib");
const nx_deps_cache_1 = require("./nx-deps-cache");
const build_project_graph_1 = require("./build-project-graph");
const file_utils_1 = require("./file-utils");
const output_1 = require("../utils/output");
const file_hasher_1 = require("../hasher/file-hasher");
const tmp_dir_1 = require("../daemon/tmp-dir");
const strip_indents_1 = require("../utils/strip-indents");
const client_1 = require("../daemon/client/client");
/**
 * Synchronously reads the latest cached copy of the workspace's ProjectGraph.
 * @throws {Error} if there is no cached ProjectGraph to read from
 */
function readCachedProjectGraph() {
    const projectGraphCache = (0, nx_deps_cache_1.readCache)();
    const angularSpecificError = (0, file_utils_1.workspaceFileName)() === 'angular.json'
        ? (0, strip_indents_1.stripIndents) `
      Make sure invoke 'node ./decorate-angular-cli.js' in your postinstall script.
      The decorated CLI will compute the project graph.
      'ng --help' should say 'Smart, Fast and Extensible Build System'.
      `
        : '';
    if (!projectGraphCache) {
        throw new Error((0, strip_indents_1.stripIndents) `
      [readCachedProjectGraph] ERROR: No cached ProjectGraph is available.

      If you are leveraging \`readCachedProjectGraph()\` directly then you will need to refactor your usage to first ensure that
      the ProjectGraph is created by calling \`await createProjectGraphAsync()\` somewhere before attempting to read the data.

      If you encounter this error as part of running standard \`nx\` commands then please open an issue on https://github.com/nrwl/nx

      ${angularSpecificError}
    `);
    }
    const projectGraph = {
        version: projectGraphCache.version,
        nodes: projectGraphCache.nodes,
        externalNodes: projectGraphCache.externalNodes,
        dependencies: projectGraphCache.dependencies,
    };
    return projectGraphAdapter(projectGraph.version, '5.0', projectGraph);
}
exports.readCachedProjectGraph = readCachedProjectGraph;
function readCachedProjectConfiguration(projectName) {
    const graph = readCachedProjectGraph();
    const node = graph.nodes[projectName];
    return node.data;
}
exports.readCachedProjectConfiguration = readCachedProjectConfiguration;
function readProjectsConfigurationFromProjectGraph(projectGraph) {
    return {
        projects: Object.fromEntries(Object.entries(projectGraph.nodes).map(([project, { data }]) => [
            project,
            data,
        ])),
        version: 2,
    };
}
exports.readProjectsConfigurationFromProjectGraph = readProjectsConfigurationFromProjectGraph;
function buildProjectGraphWithoutDaemon() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield file_hasher_1.defaultFileHasher.ensureInitialized();
        return yield (0, build_project_graph_1.buildProjectGraph)();
    });
}
exports.buildProjectGraphWithoutDaemon = buildProjectGraphWithoutDaemon;
function handleProjectGraphError(opts, e) {
    if (opts.exitOnError) {
        const lines = e.message.split('\n');
        output_1.output.error({
            title: lines[0],
            bodyLines: lines.slice(1),
        });
        if (process.env.NX_VERBOSE_LOGGING === 'true') {
            console.error(e);
        }
        process.exit(1);
    }
    else {
        throw e;
    }
}
/**
 * Computes and returns a ProjectGraph.
 *
 * Nx will compute the graph either in a daemon process or in the current process.
 *
 * Nx will compute it in the current process if:
 * * The process is running in CI (CI env variable is to true or other common variables used by CI providers are set).
 * * It is running in the docker container.
 * * The daemon process is disabled because of the previous error when starting the daemon.
 * * `NX_DAEMON` is set to `false`.
 * * `useDaemon` is set to false in `nx.json`
 *
 * `NX_DAEMON` env variable takes precedence:
 * * If it is set to true, the daemon will always be used.
 * * If it is set to false, the graph will always be computed in the current process.
 *
 * Tip: If you want to debug project graph creation, run your command with NX_DAEMON=false.
 *
 * Nx uses two layers of caching: the information about explicit dependencies stored on the disk and the information
 * stored in the daemon process. To reset both run: `nx reset`.
 */
function createProjectGraphAsync(opts = {
    exitOnError: false,
    resetDaemonClient: false,
}) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!client_1.daemonClient.enabled()) {
            try {
                return yield buildProjectGraphWithoutDaemon();
            }
            catch (e) {
                handleProjectGraphError(opts, e);
            }
        }
        else {
            try {
                if (opts.resetDaemonClient) {
                    client_1.daemonClient.reset();
                }
                return yield client_1.daemonClient.getProjectGraph();
            }
            catch (e) {
                if (e.message.indexOf('inotify_add_watch') > -1) {
                    // common errors with the daemon due to OS settings (cannot watch all the files available)
                    output_1.output.note({
                        title: `Unable to start Nx Daemon due to the limited amount of inotify watches, continuing without the daemon.`,
                        bodyLines: [
                            'For more information read: https://askubuntu.com/questions/1088272/inotify-add-watch-failed-no-space-left-on-device',
                            'Nx Daemon is going to be disabled until you run "nx reset".',
                        ],
                    });
                    (0, tmp_dir_1.markDaemonAsDisabled)();
                    return buildProjectGraphWithoutDaemon();
                }
                if (e.internalDaemonError) {
                    const errorLogFile = (0, tmp_dir_1.writeDaemonLogs)(e.message);
                    output_1.output.warn({
                        title: `Nx Daemon was not able to compute the project graph.`,
                        bodyLines: [
                            `Log file with the error: ${errorLogFile}`,
                            `Please file an issue at https://github.com/nrwl/nx`,
                            'Nx Daemon is going to be disabled until you run "nx reset".',
                        ],
                    });
                    (0, tmp_dir_1.markDaemonAsDisabled)();
                    return buildProjectGraphWithoutDaemon();
                }
                handleProjectGraphError(opts, e);
            }
        }
    });
}
exports.createProjectGraphAsync = createProjectGraphAsync;
/**
 * Backwards compatibility adapter for project graph
 * @param {string} sourceVersion
 * @param {string} targetVersion
 * @param projectGraph
 * @param {ProjectGraph} projectGraph
 * @returns {ProjectGraph}
 */
function projectGraphAdapter(sourceVersion, targetVersion, projectGraph) {
    if (sourceVersion === targetVersion) {
        return projectGraph;
    }
    if (+sourceVersion >= 5 && targetVersion === '4.0') {
        return projectGraphCompat5to4(projectGraph);
    }
    throw new Error(`Invalid source or target versions. Source: ${sourceVersion}, Target: ${targetVersion}.

Only backwards compatibility between "5.0" and "4.0" is supported.
This error can be caused by "@nrwl/..." packages getting out of sync or outdated project graph cache.
Check the versions running "nx report" and/or remove your "nxdeps.json" file (in node_modules/.cache/nx folder).
    `);
}
exports.projectGraphAdapter = projectGraphAdapter;
/**
 * Backwards compatibility adapter for project Nodes v4 to v5
 * @param {ProjectGraph} projectGraph
 * @returns {ProjectGraph}
 */
function projectGraphCompat5to4(projectGraph) {
    const { externalNodes } = projectGraph, rest = tslib_1.__rest(projectGraph, ["externalNodes"]);
    return Object.assign(Object.assign({}, rest), { nodes: Object.assign(Object.assign({}, projectGraph.nodes), externalNodes), dependencies: Object.assign(Object.assign({}, projectGraph.dependencies), Object.keys(externalNodes).reduce((acc, key) => (Object.assign(Object.assign({}, acc), { [`npm:${key}`]: [] })), {})), version: '4.0' });
}
//# sourceMappingURL=project-graph.js.map