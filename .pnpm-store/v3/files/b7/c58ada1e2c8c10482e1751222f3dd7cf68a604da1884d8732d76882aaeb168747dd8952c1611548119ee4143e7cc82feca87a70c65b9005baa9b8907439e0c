"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGraph = void 0;
const tslib_1 = require("tslib");
const workspace_root_1 = require("../utils/workspace-root");
const chokidar_1 = require("chokidar");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const http = require("http");
const ignore_1 = require("ignore");
const open = require("open");
const path_1 = require("path");
const perf_hooks_1 = require("perf_hooks");
const url_1 = require("url");
const configuration_1 = require("../config/configuration");
const file_hasher_1 = require("../hasher/file-hasher");
const output_1 = require("../utils/output");
const fileutils_1 = require("../utils/fileutils");
const path_2 = require("../utils/path");
const operators_1 = require("../project-graph/operators");
const project_graph_1 = require("../project-graph/project-graph");
const create_task_graph_1 = require("../tasks-runner/create-task-graph");
// maps file extention to MIME types
const mimeType = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.eot': 'appliaction/vnd.ms-fontobject',
    '.ttf': 'aplication/font-sfnt',
};
function buildEnvironmentJs(exclude, watchMode, localMode, depGraphClientResponse, taskGraphClientResponse) {
    let environmentJs = `window.exclude = ${JSON.stringify(exclude)};
  window.watch = ${!!watchMode};
  window.environment = 'release';
  window.localMode = '${localMode}';

  window.appConfig = {
    showDebugger: false,
    showExperimentalFeatures: false,
    workspaces: [
      {
        id: 'local',
        label: 'local',
        projectGraphUrl: 'project-graph.json',
        taskGraphUrl: 'task-graph.json'
      }
    ],
    defaultWorkspaceId: 'local',
  };
  `;
    if (localMode === 'build') {
        environmentJs += `window.projectGraphResponse = ${JSON.stringify(depGraphClientResponse)};
    `;
        environmentJs += `window.taskGraphResponse = ${JSON.stringify(taskGraphClientResponse)};
    `;
    }
    else {
        environmentJs += `window.projectGraphResponse = null;`;
        environmentJs += `window.taskGraphResponse = null;`;
    }
    return environmentJs;
}
function projectExists(projects, projectToFind) {
    return (projects.find((project) => project.name === projectToFind) !== undefined);
}
function hasPath(graph, target, node, visited) {
    if (target === node)
        return true;
    for (let d of graph.dependencies[node] || []) {
        if (visited.indexOf(d.target) > -1)
            continue;
        visited.push(d.target);
        if (hasPath(graph, target, d.target, visited))
            return true;
    }
    return false;
}
function filterGraph(graph, focus, exclude) {
    let projectNames = Object.values(graph.nodes).map((project) => project.name);
    let filteredProjectNames;
    if (focus !== null) {
        filteredProjectNames = new Set();
        projectNames.forEach((p) => {
            const isInPath = hasPath(graph, p, focus, []) || hasPath(graph, focus, p, []);
            if (isInPath) {
                filteredProjectNames.add(p);
            }
        });
    }
    else {
        filteredProjectNames = new Set(projectNames);
    }
    if (exclude.length !== 0) {
        exclude.forEach((p) => filteredProjectNames.delete(p));
    }
    let filteredGraph = {
        nodes: {},
        dependencies: {},
    };
    filteredProjectNames.forEach((p) => {
        filteredGraph.nodes[p] = graph.nodes[p];
        filteredGraph.dependencies[p] = graph.dependencies[p];
    });
    return filteredGraph;
}
function generateGraph(args, affectedProjects) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let graph = (0, operators_1.pruneExternalNodes)(yield (0, project_graph_1.createProjectGraphAsync)({ exitOnError: true }));
        const layout = (0, configuration_1.workspaceLayout)();
        const projects = Object.values(graph.nodes);
        projects.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
        if (args.focus) {
            if (!projectExists(projects, args.focus)) {
                output_1.output.error({
                    title: `Project to focus does not exist.`,
                    bodyLines: [`You provided --focus=${args.focus}`],
                });
                process.exit(1);
            }
        }
        if (args.exclude) {
            const invalidExcludes = [];
            args.exclude.forEach((project) => {
                if (!projectExists(projects, project)) {
                    invalidExcludes.push(project);
                }
            });
            if (invalidExcludes.length > 0) {
                output_1.output.error({
                    title: `The following projects provided to --exclude do not exist:`,
                    bodyLines: invalidExcludes,
                });
                process.exit(1);
            }
        }
        let html = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../core/graph/index.html'), 'utf-8');
        graph = filterGraph(graph, args.focus || null, args.exclude || []);
        if (args.file) {
            const workspaceFolder = workspace_root_1.workspaceRoot;
            const ext = (0, path_1.extname)(args.file);
            const fullFilePath = (0, path_1.isAbsolute)(args.file)
                ? args.file
                : (0, path_1.join)(workspaceFolder, args.file);
            const fileFolderPath = (0, path_1.dirname)(fullFilePath);
            if (ext === '.html') {
                const assetsFolder = (0, path_1.join)(fileFolderPath, 'static');
                const assets = [];
                (0, fs_extra_1.copySync)((0, path_1.join)(__dirname, '../core/graph'), assetsFolder, {
                    filter: (_src, dest) => {
                        const isntHtml = !/index\.html/.test(dest);
                        if (isntHtml && dest.includes('.')) {
                            assets.push(dest);
                        }
                        return isntHtml;
                    },
                });
                const depGraphClientResponse = yield createDepGraphClientResponse(affectedProjects);
                const taskGraphClientResponse = yield createTaskGraphClientResponse();
                const environmentJs = buildEnvironmentJs(args.exclude || [], args.watch, !!args.file && args.file.endsWith('html') ? 'build' : 'serve', depGraphClientResponse, taskGraphClientResponse);
                html = html.replace(/src="/g, 'src="static/');
                html = html.replace(/href="styles/g, 'href="static/styles');
                html = html.replace('<base href="/" />', '');
                html = html.replace(/type="module"/g, '');
                (0, fs_1.writeFileSync)(fullFilePath, html);
                (0, fs_1.writeFileSync)((0, path_1.join)(assetsFolder, 'environment.js'), environmentJs);
                output_1.output.success({
                    title: `HTML output created in ${fileFolderPath}`,
                    bodyLines: [fileFolderPath, ...assets],
                });
            }
            else if (ext === '.json') {
                (0, fs_extra_1.ensureDirSync)((0, path_1.dirname)(fullFilePath));
                (0, fileutils_1.writeJsonFile)(fullFilePath, {
                    graph,
                    affectedProjects,
                    criticalPath: affectedProjects,
                });
                output_1.output.success({
                    title: `JSON output created in ${fileFolderPath}`,
                    bodyLines: [fullFilePath],
                });
            }
            else {
                output_1.output.error({
                    title: `Please specify a filename with either .json or .html extension.`,
                    bodyLines: [`You provided --file=${args.file}`],
                });
                process.exit(1);
            }
            process.exit(0);
        }
        else {
            const environmentJs = buildEnvironmentJs(args.exclude || [], args.watch, !!args.file && args.file.endsWith('html') ? 'build' : 'serve');
            yield startServer(html, environmentJs, args.host || '127.0.0.1', args.port || 4211, args.watch, affectedProjects, args.focus, args.groupByFolder, args.exclude, args.open);
        }
    });
}
exports.generateGraph = generateGraph;
function startServer(html, environmentJs, host, port = 4211, watchForchanges = false, affected = [], focus = null, groupByFolder = false, exclude = [], openBrowser = true) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (watchForchanges) {
            startWatcher();
        }
        currentDepGraphClientResponse = yield createDepGraphClientResponse(affected);
        currentDepGraphClientResponse.focus = focus;
        currentDepGraphClientResponse.groupByFolder = groupByFolder;
        currentDepGraphClientResponse.exclude = exclude;
        const app = http.createServer((req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            // parse URL
            const parsedUrl = new url_1.URL(req.url, `http://${host}:${port}`);
            // extract URL path
            // Avoid https://en.wikipedia.org/wiki/Directory_traversal_attack
            // e.g curl --path-as-is http://localhost:9000/../fileInDanger.txt
            // by limiting the path to current directory only
            const sanitizePath = (0, path_1.basename)(parsedUrl.pathname);
            if (sanitizePath === 'project-graph.json') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(currentDepGraphClientResponse));
                return;
            }
            if (sanitizePath === 'task-graph.json') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(yield createTaskGraphClientResponse()));
                return;
            }
            if (sanitizePath === 'currentHash') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ hash: currentDepGraphClientResponse.hash }));
                return;
            }
            if (sanitizePath === 'environment.js') {
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end(environmentJs);
                return;
            }
            let pathname = (0, path_1.join)(__dirname, '../core/graph/', sanitizePath);
            // if the file is not found or is a directory, return index.html
            if (!(0, fs_1.existsSync)(pathname) || (0, fs_1.statSync)(pathname).isDirectory()) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(html);
                return;
            }
            try {
                const data = (0, fs_1.readFileSync)(pathname);
                const ext = (0, path_1.parse)(pathname).ext;
                res.setHeader('Content-type', mimeType[ext] || 'text/plain');
                res.end(data);
            }
            catch (err) {
                res.statusCode = 500;
                res.end(`Error getting the file: ${err}.`);
            }
        }));
        app.listen(port, host);
        output_1.output.note({
            title: `Project graph started at http://${host}:${port}`,
        });
        if (openBrowser) {
            let url = `http://${host}:${port}/projects`;
            let params = new url_1.URLSearchParams();
            if (focus) {
                url += `/${focus}`;
            }
            if (groupByFolder) {
                params.append('groupByFolder', 'true');
            }
            open(`${url}?${params.toString()}`);
        }
    });
}
let currentDepGraphClientResponse = {
    hash: null,
    projects: [],
    dependencies: {},
    layout: {
        appsDir: '',
        libsDir: '',
    },
    affected: [],
    focus: null,
    groupByFolder: false,
    exclude: [],
};
function getIgnoredGlobs(root) {
    const ig = (0, ignore_1.default)();
    try {
        ig.add((0, fs_1.readFileSync)(`${root}/.gitignore`, 'utf-8'));
    }
    catch (_a) { }
    try {
        ig.add((0, fs_1.readFileSync)(`${root}/.nxignore`, 'utf-8'));
    }
    catch (_b) { }
    return ig;
}
function startWatcher() {
    createFileWatcher(workspace_root_1.workspaceRoot, () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        output_1.output.note({ title: 'Recalculating project graph...' });
        const newGraphClientResponse = yield createDepGraphClientResponse();
        if (newGraphClientResponse.hash !== currentDepGraphClientResponse.hash) {
            output_1.output.note({ title: 'Graph changes updated.' });
            currentDepGraphClientResponse = newGraphClientResponse;
        }
        else {
            output_1.output.note({ title: 'No graph changes found.' });
        }
    }));
}
function debounce(fn, time) {
    let timeout;
    return (...args) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => fn(...args), time);
    };
}
function createFileWatcher(root, changeHandler) {
    const ignoredGlobs = getIgnoredGlobs(root);
    const layout = (0, configuration_1.workspaceLayout)();
    const watcher = (0, chokidar_1.watch)([
        (0, path_2.joinPathFragments)(layout.appsDir, '**'),
        (0, path_2.joinPathFragments)(layout.libsDir, '**'),
    ], {
        cwd: root,
        ignoreInitial: true,
    });
    watcher.on('all', debounce((event, path) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (ignoredGlobs.ignores(path))
            return;
        yield changeHandler();
    }), 500));
    return { close: () => watcher.close() };
}
function createDepGraphClientResponse(affected = []) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        perf_hooks_1.performance.mark('project graph watch calculation:start');
        yield file_hasher_1.defaultFileHasher.init();
        let graph = (0, operators_1.pruneExternalNodes)(yield (0, project_graph_1.createProjectGraphAsync)({ exitOnError: true }));
        perf_hooks_1.performance.mark('project graph watch calculation:end');
        perf_hooks_1.performance.mark('project graph response generation:start');
        const layout = (0, configuration_1.workspaceLayout)();
        const projects = Object.values(graph.nodes).map((project) => ({
            name: project.name,
            type: project.type,
            data: {
                tags: project.data.tags,
                root: project.data.root,
                files: project.data.files,
                targets: project.data.targets,
            },
        }));
        const dependencies = graph.dependencies;
        const hasher = (0, crypto_1.createHash)('sha256');
        hasher.update(JSON.stringify({ layout, projects, dependencies }));
        const hash = hasher.digest('hex');
        perf_hooks_1.performance.mark('project graph response generation:end');
        perf_hooks_1.performance.measure('project graph watch calculation', 'project graph watch calculation:start', 'project graph watch calculation:end');
        perf_hooks_1.performance.measure('project graph response generation', 'project graph response generation:start', 'project graph response generation:end');
        return Object.assign(Object.assign({}, currentDepGraphClientResponse), { hash,
            layout,
            projects,
            dependencies,
            affected });
    });
}
function createTaskGraphClientResponse() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let graph = (0, operators_1.pruneExternalNodes)(yield (0, project_graph_1.createProjectGraphAsync)({ exitOnError: true }));
        perf_hooks_1.performance.mark('task graph generation:start');
        const taskGraphs = getAllTaskGraphsForWorkspace(graph);
        perf_hooks_1.performance.mark('task graph generation:end');
        perf_hooks_1.performance.measure('task graph generation', 'task graph generation:start', 'task graph generation:end');
        return {
            taskGraphs,
        };
    });
}
function getAllTaskGraphsForWorkspace(projectGraph) {
    const nxJson = (0, configuration_1.readNxJson)();
    const defaultDependencyConfigs = mapTargetDefaultsToDependencies(nxJson.targetDefaults);
    const taskGraphs = {};
    for (const projectName in projectGraph.nodes) {
        const project = projectGraph.nodes[projectName];
        const targets = Object.keys(project.data.targets);
        targets.forEach((target) => {
            var _a;
            taskGraphs[createTaskId(projectName, target)] = (0, create_task_graph_1.createTaskGraph)(projectGraph, defaultDependencyConfigs, [projectName], [target], undefined, {});
            const configurations = Object.keys(((_a = project.data.targets[target]) === null || _a === void 0 ? void 0 : _a.configurations) || {});
            if (configurations.length > 0) {
                configurations.forEach((configuration) => {
                    taskGraphs[createTaskId(projectName, target, configuration)] =
                        (0, create_task_graph_1.createTaskGraph)(projectGraph, defaultDependencyConfigs, [projectName], [target], configuration, {});
                });
            }
        });
    }
    return taskGraphs;
}
function mapTargetDefaultsToDependencies(defaults) {
    const res = {};
    Object.keys(defaults).forEach((k) => {
        res[k] = defaults[k].dependsOn;
    });
    return res;
}
function createTaskId(projectId, targetId, configurationId) {
    if (configurationId) {
        return `${projectId}:${targetId}:${configurationId}`;
    }
    else {
        return `${projectId}:${targetId}`;
    }
}
//# sourceMappingURL=dep-graph.js.map