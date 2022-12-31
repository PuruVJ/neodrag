"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildProjectGraphUsingProjectFileMap = exports.buildProjectGraph = void 0;
const tslib_1 = require("tslib");
const workspace_root_1 = require("../utils/workspace-root");
const path_1 = require("path");
const perf_hooks_1 = require("perf_hooks");
const assert_workspace_validity_1 = require("../utils/assert-workspace-validity");
const nx_deps_cache_1 = require("./nx-deps-cache");
const build_dependencies_1 = require("./build-dependencies");
const build_nodes_1 = require("./build-nodes");
const os = require("os");
const build_explicit_typescript_and_package_json_dependencies_1 = require("./build-dependencies/build-explicit-typescript-and-package-json-dependencies");
const nx_plugin_1 = require("../utils/nx-plugin");
const file_hasher_1 = require("../hasher/file-hasher");
const file_map_utils_1 = require("./file-map-utils");
const typescript_1 = require("../utils/typescript");
const fileutils_1 = require("../utils/fileutils");
const logger_1 = require("../utils/logger");
const project_graph_builder_1 = require("./project-graph-builder");
const configuration_1 = require("../config/configuration");
const lock_file_1 = require("../lock-file/lock-file");
function buildProjectGraph() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const projectConfigurations = (0, configuration_1.readAllWorkspaceConfiguration)();
        const { projectFileMap, allWorkspaceFiles } = (0, file_map_utils_1.createProjectFileMap)(projectConfigurations, file_hasher_1.defaultFileHasher.allFileData());
        const cacheEnabled = process.env.NX_CACHE_PROJECT_GRAPH !== 'false';
        let cache = cacheEnabled ? (0, nx_deps_cache_1.readCache)() : null;
        return (yield buildProjectGraphUsingProjectFileMap(projectConfigurations, projectFileMap, allWorkspaceFiles, cache, cacheEnabled)).projectGraph;
    });
}
exports.buildProjectGraph = buildProjectGraph;
function buildProjectGraphUsingProjectFileMap(projectsConfigurations, projectFileMap, allWorkspaceFiles, cache, shouldWriteCache) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const nxJson = (0, configuration_1.readNxJson)();
        const projectGraphVersion = '5.0';
        (0, assert_workspace_validity_1.assertWorkspaceValidity)(projectsConfigurations, nxJson);
        const packageJsonDeps = readCombinedDeps();
        const rootTsConfig = readRootTsConfig();
        let filesToProcess;
        let cachedFileData;
        if (cache &&
            !(0, nx_deps_cache_1.shouldRecomputeWholeGraph)(cache, packageJsonDeps, projectsConfigurations, nxJson, rootTsConfig)) {
            const fromCache = (0, nx_deps_cache_1.extractCachedFileData)(projectFileMap, cache);
            filesToProcess = fromCache.filesToProcess;
            cachedFileData = fromCache.cachedFileData;
        }
        else {
            filesToProcess = projectFileMap;
            cachedFileData = {};
        }
        let partialGraph;
        let lockHash = 'n/a';
        // during the create-nx-workspace lock file might not exists yet
        if ((0, lock_file_1.lockFileExists)()) {
            lockHash = (0, lock_file_1.lockFileHash)();
            if (cache && cache.lockFileHash === lockHash) {
                partialGraph = isolatePartialGraphFromCache(cache);
            }
            else {
                partialGraph = (0, lock_file_1.mapLockFileDataToPartialGraph)((0, lock_file_1.parseLockFile)());
            }
        }
        const context = createContext(projectsConfigurations, nxJson, projectFileMap, filesToProcess);
        let projectGraph = yield buildProjectGraphUsingContext(nxJson, context, cachedFileData, projectGraphVersion, partialGraph, packageJsonDeps);
        const projectGraphCache = (0, nx_deps_cache_1.createCache)(nxJson, packageJsonDeps, projectGraph, rootTsConfig, lockHash);
        if (shouldWriteCache) {
            (0, nx_deps_cache_1.writeCache)(projectGraphCache);
        }
        projectGraph.allWorkspaceFiles = allWorkspaceFiles;
        return {
            projectGraph,
            projectGraphCache,
        };
    });
}
exports.buildProjectGraphUsingProjectFileMap = buildProjectGraphUsingProjectFileMap;
function readCombinedDeps() {
    const json = (0, fileutils_1.readJsonFile)((0, path_1.join)(workspace_root_1.workspaceRoot, 'package.json'));
    return Object.assign(Object.assign({}, json.dependencies), json.devDependencies);
}
// extract only external nodes and their dependencies
function isolatePartialGraphFromCache(cache) {
    const dependencies = {};
    Object.keys(cache.dependencies).forEach((k) => {
        if (cache.externalNodes[k]) {
            dependencies[k] = cache.dependencies[k];
        }
    });
    return {
        nodes: {},
        dependencies,
        externalNodes: cache.externalNodes,
    };
}
function buildProjectGraphUsingContext(nxJson, ctx, cachedFileData, projectGraphVersion, partialGraph, packageJsonDeps) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        perf_hooks_1.performance.mark('build project graph:start');
        const builder = new project_graph_builder_1.ProjectGraphBuilder(partialGraph);
        (0, build_nodes_1.buildWorkspaceProjectNodes)(ctx, builder, nxJson);
        if (!partialGraph) {
            (0, build_nodes_1.buildNpmPackageNodes)(builder);
        }
        for (const proj of Object.keys(cachedFileData)) {
            for (const f of builder.graph.nodes[proj].data.files) {
                const cached = cachedFileData[proj][f.file];
                if (cached && cached.deps) {
                    f.deps = [...cached.deps];
                }
            }
        }
        yield buildExplicitDependencies(jsPluginConfig(nxJson, packageJsonDeps), ctx, builder);
        (0, build_dependencies_1.buildImplicitProjectDependencies)(ctx, builder);
        builder.setVersion(projectGraphVersion);
        const initProjectGraph = builder.getUpdatedProjectGraph();
        const r = yield updateProjectGraphWithPlugins(ctx, initProjectGraph);
        perf_hooks_1.performance.mark('build project graph:end');
        perf_hooks_1.performance.measure('build project graph', 'build project graph:start', 'build project graph:end');
        return r;
    });
}
function jsPluginConfig(nxJson, packageJsonDeps) {
    var _a, _b;
    if ((_a = nxJson === null || nxJson === void 0 ? void 0 : nxJson.pluginsConfig) === null || _a === void 0 ? void 0 : _a['@nrwl/js']) {
        return (_b = nxJson === null || nxJson === void 0 ? void 0 : nxJson.pluginsConfig) === null || _b === void 0 ? void 0 : _b['@nrwl/js'];
    }
    if (packageJsonDeps['@nrwl/workspace'] ||
        packageJsonDeps['@nrwl/js'] ||
        packageJsonDeps['@nrwl/node'] ||
        packageJsonDeps['@nrwl/next'] ||
        packageJsonDeps['@nrwl/react'] ||
        packageJsonDeps['@nrwl/angular'] ||
        packageJsonDeps['@nrwl/web']) {
        return { analyzePackageJson: true, analyzeSourceFiles: true };
    }
    else {
        return { analyzePackageJson: true, analyzeSourceFiles: false };
    }
}
function buildExplicitDependencies(jsPluginConfig, ctx, builder) {
    let totalNumOfFilesToProcess = totalNumberOfFilesToProcess(ctx);
    // using workers has an overhead, so we only do it when the number of
    // files we need to process is >= 100 and there are more than 2 CPUs
    // to be able to use at least 2 workers (1 worker per CPU and
    // 1 CPU for the main thread)
    if (totalNumOfFilesToProcess < 100 || getNumberOfWorkers() <= 2) {
        return buildExplicitDependenciesWithoutWorkers(jsPluginConfig, ctx, builder);
    }
    else {
        return buildExplicitDependenciesUsingWorkers(jsPluginConfig, ctx, totalNumOfFilesToProcess, builder);
    }
}
function totalNumberOfFilesToProcess(ctx) {
    let totalNumOfFilesToProcess = 0;
    Object.values(ctx.filesToProcess).forEach((t) => (totalNumOfFilesToProcess += t.length));
    return totalNumOfFilesToProcess;
}
function splitFilesIntoBins(ctx, totalNumOfFilesToProcess, numberOfWorkers) {
    // we want to have numberOfWorkers * 5 bins
    const filesPerBin = Math.round(totalNumOfFilesToProcess / numberOfWorkers / 5) + 1;
    const bins = [];
    let currentProjectFileMap = {};
    let currentNumberOfFiles = 0;
    for (const source of Object.keys(ctx.filesToProcess)) {
        for (const f of Object.values(ctx.filesToProcess[source])) {
            if (!currentProjectFileMap[source])
                currentProjectFileMap[source] = [];
            currentProjectFileMap[source].push(f);
            currentNumberOfFiles++;
            if (currentNumberOfFiles >= filesPerBin) {
                bins.push(currentProjectFileMap);
                currentProjectFileMap = {};
                currentNumberOfFiles = 0;
            }
        }
    }
    bins.push(currentProjectFileMap);
    return bins;
}
function createWorkerPool(numberOfWorkers) {
    const res = [];
    for (let i = 0; i < numberOfWorkers; ++i) {
        res.push(new (require('worker_threads').Worker)((0, path_1.join)(__dirname, './project-graph-worker.js'), {
            env: process.env,
        }));
    }
    return res;
}
function buildExplicitDependenciesWithoutWorkers(jsPluginConfig, ctx, builder) {
    (0, build_explicit_typescript_and_package_json_dependencies_1.buildExplicitTypescriptAndPackageJsonDependencies)(jsPluginConfig, ctx.workspace, builder.graph, ctx.filesToProcess).forEach((r) => {
        builder.addExplicitDependency(r.sourceProjectName, r.sourceProjectFile, r.targetProjectName);
    });
}
function buildExplicitDependenciesUsingWorkers(jsPluginConfig, ctx, totalNumOfFilesToProcess, builder) {
    const numberOfWorkers = Math.min(totalNumOfFilesToProcess, getNumberOfWorkers());
    const bins = splitFilesIntoBins(ctx, totalNumOfFilesToProcess, numberOfWorkers);
    const workers = createWorkerPool(numberOfWorkers);
    let numberOfExpectedResponses = bins.length;
    return new Promise((res, reject) => {
        for (let w of workers) {
            w.on('message', (explicitDependencies) => {
                explicitDependencies.forEach((r) => {
                    builder.addExplicitDependency(r.sourceProjectName, r.sourceProjectFile, r.targetProjectName);
                });
                if (bins.length > 0) {
                    w.postMessage({ filesToProcess: bins.shift() });
                }
                // we processed all the bins
                if (--numberOfExpectedResponses === 0) {
                    for (let w of workers) {
                        w.terminate();
                    }
                    res(null);
                }
            });
            w.on('error', reject);
            w.on('exit', (code) => {
                if (code !== 0) {
                    reject(new Error(`Unable to complete project graph creation. Worker stopped with exit code: ${code}`));
                }
            });
            w.postMessage({
                workspace: ctx.workspace,
                projectGraph: builder.graph,
                jsPluginConfig,
            });
            w.postMessage({ filesToProcess: bins.shift() });
        }
    });
}
function getNumberOfWorkers() {
    return process.env.NX_PROJECT_GRAPH_MAX_WORKERS
        ? +process.env.NX_PROJECT_GRAPH_MAX_WORKERS
        : os.cpus().length - 1;
}
function createContext(projectsConfigurations, nxJson, fileMap, filesToProcess) {
    const projects = Object.keys(projectsConfigurations.projects).reduce((map, projectName) => {
        map[projectName] = Object.assign({}, projectsConfigurations.projects[projectName]);
        return map;
    }, {});
    return {
        workspace: Object.assign(Object.assign(Object.assign({}, projectsConfigurations), nxJson), { projects }),
        fileMap,
        filesToProcess,
    };
}
function updateProjectGraphWithPlugins(context, initProjectGraph) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const plugins = (0, nx_plugin_1.loadNxPlugins)(context.workspace.plugins).filter((x) => !!x.processProjectGraph);
        let graph = initProjectGraph;
        for (const plugin of plugins) {
            try {
                graph = yield plugin.processProjectGraph(graph, context);
            }
            catch (e) {
                const message = `Failed to process the project graph with "${plugin.name}". This will error in the future!`;
                if (process.env.NX_VERBOSE_LOGGING === 'true') {
                    console.error(e);
                    logger_1.logger.error(message);
                    return graph;
                }
                else {
                    logger_1.logger.warn(message);
                    logger_1.logger.warn(`Run with NX_VERBOSE_LOGGING=true to see the error.`);
                }
            }
        }
        return graph;
    });
}
function readRootTsConfig() {
    try {
        const tsConfigPath = (0, typescript_1.getRootTsConfigPath)();
        if (tsConfigPath) {
            return (0, fileutils_1.readJsonFile)(tsConfigPath, { expectComments: true });
        }
    }
    catch (e) {
        return {};
    }
}
//# sourceMappingURL=build-project-graph.js.map