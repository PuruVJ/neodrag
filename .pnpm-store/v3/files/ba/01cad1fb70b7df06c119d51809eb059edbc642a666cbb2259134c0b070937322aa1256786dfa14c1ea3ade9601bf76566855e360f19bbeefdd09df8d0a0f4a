"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveTagsAndImplicitDepsFromNxJsonToWorkspaceJson = exports.format = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const path = require("path");
const command_line_utils_1 = require("../utils/command-line-utils");
const fileutils_1 = require("../utils/fileutils");
const file_utils_1 = require("../project-graph/file-utils");
const workspaces_1 = require("../config/workspaces");
const workspace_root_1 = require("../utils/workspace-root");
const prettier = require("prettier");
const object_sort_1 = require("../utils/object-sort");
const typescript_1 = require("../utils/typescript");
const fileutils_2 = require("../utils/fileutils");
const project_graph_1 = require("../project-graph/project-graph");
const affected_project_graph_1 = require("../project-graph/affected/affected-project-graph");
const configuration_1 = require("../config/configuration");
const PRETTIER_PATH = require.resolve('prettier/bin-prettier');
function format(command, args) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { nxArgs } = (0, command_line_utils_1.splitArgsIntoNxArgsAndOverrides)(args, 'affected', { printWarnings: false }, (0, configuration_1.readNxJson)());
        const patterns = (yield getPatterns(Object.assign(Object.assign({}, args), nxArgs))).map(
        // prettier removes one of the \
        // prettier-ignore
        (p) => `"${p.replace(/\$/g, "\\\$")}"`);
        // Chunkify the patterns array to prevent crashing the windows terminal
        const chunkList = chunkify(patterns, 50);
        switch (command) {
            case 'write':
                const workspaceJsonPath = (0, workspaces_1.workspaceConfigName)(workspace_root_1.workspaceRoot);
                if (workspaceJsonPath) {
                    updateWorkspaceJsonToMatchFormatVersion(workspaceJsonPath);
                    sortWorkspaceJson(workspaceJsonPath);
                    movePropertiesToNewLocations(workspaceJsonPath);
                }
                sortTsConfig();
                addRootConfigFiles(chunkList, nxArgs, workspaceJsonPath);
                chunkList.forEach((chunk) => write(chunk));
                break;
            case 'check':
                const pass = chunkList.reduce((pass, chunk) => check(chunk) && pass, true);
                if (!pass) {
                    process.exit(1);
                }
                break;
        }
    });
}
exports.format = format;
function getPatterns(args) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const graph = yield (0, project_graph_1.createProjectGraphAsync)({ exitOnError: true });
        const allFilesPattern = ['.'];
        if (args.all) {
            return allFilesPattern;
        }
        try {
            if (args.projects && args.projects.length > 0) {
                return getPatternsFromProjects(args.projects, graph);
            }
            const p = (0, command_line_utils_1.parseFiles)(args);
            const supportedExtensions = prettier
                .getSupportInfo()
                .languages.flatMap((language) => language.extensions)
                .filter((extension) => !!extension)
                // Prettier supports ".swcrc" as a file instead of an extension
                // So we add ".swcrc" as a supported extension manually
                // which allows it to be considered for calculating "patterns"
                .concat('.swcrc');
            const patterns = p.files.filter((f) => (0, fileutils_1.fileExists)(f) && supportedExtensions.includes(path.extname(f)));
            return args.libsAndApps
                ? yield getPatternsFromApps(patterns, graph.allWorkspaceFiles, graph)
                : patterns;
        }
        catch (_a) {
            return allFilesPattern;
        }
    });
}
function getPatternsFromApps(affectedFiles, allWorkspaceFiles, projectGraph) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const graph = yield (0, project_graph_1.createProjectGraphAsync)({ exitOnError: true });
        const affectedGraph = (0, affected_project_graph_1.filterAffected)(graph, (0, file_utils_1.calculateFileChanges)(affectedFiles, allWorkspaceFiles));
        return getPatternsFromProjects(Object.keys(affectedGraph.nodes), projectGraph);
    });
}
function addRootConfigFiles(chunkList, nxArgs, workspaceJsonPath) {
    if (nxArgs.all) {
        return;
    }
    const chunk = [];
    const addToChunkIfNeeded = (file) => {
        if (chunkList.every((c) => !c.includes(`"${file}"`))) {
            chunk.push(file);
        }
    };
    if (workspaceJsonPath) {
        addToChunkIfNeeded(workspaceJsonPath);
    }
    ['nx.json', (0, typescript_1.getRootTsConfigFileName)()]
        .filter(Boolean)
        .forEach(addToChunkIfNeeded);
    if (chunk.length > 0) {
        chunkList.push(chunk);
    }
}
function getPatternsFromProjects(projects, projectGraph) {
    return (0, command_line_utils_1.getProjectRoots)(projects, projectGraph);
}
function chunkify(target, size) {
    return target.reduce((current, value, index) => {
        if (index % size === 0)
            current.push([]);
        current[current.length - 1].push(value);
        return current;
    }, []);
}
function write(patterns) {
    if (patterns.length > 0) {
        const [swcrcPatterns, regularPatterns] = patterns.reduce((result, pattern) => {
            result[pattern.includes('.swcrc') ? 0 : 1].push(pattern);
            return result;
        }, [[], []]);
        (0, child_process_1.execSync)(`node "${PRETTIER_PATH}" --write --list-different ${regularPatterns.join(' ')}`, {
            stdio: [0, 1, 2],
        });
        if (swcrcPatterns.length > 0) {
            (0, child_process_1.execSync)(`node "${PRETTIER_PATH}" --write --list-different ${swcrcPatterns.join(' ')} --parser json`, {
                stdio: [0, 1, 2],
            });
        }
    }
}
function check(patterns) {
    if (patterns.length === 0) {
        return true;
    }
    try {
        (0, child_process_1.execSync)(`node "${PRETTIER_PATH}" --list-different ${patterns.join(' ')}`, {
            stdio: [0, 1, 2],
        });
        return true;
    }
    catch (_a) {
        return false;
    }
}
function updateWorkspaceJsonToMatchFormatVersion(workspaceJsonPath) {
    try {
        const workspaceJson = (0, fileutils_2.readJsonFile)(workspaceJsonPath);
        const reformatted = (0, workspaces_1.reformattedWorkspaceJsonOrNull)(workspaceJson);
        if (reformatted) {
            (0, fileutils_2.writeJsonFile)(workspaceJsonPath, reformatted);
        }
    }
    catch (e) {
        console.error(`Failed to format workspace config: ${workspaceJsonPath}`);
        console.error(e);
    }
}
function sortWorkspaceJson(workspaceJsonPath) {
    try {
        const workspaceJson = (0, fileutils_2.readJsonFile)(workspaceJsonPath);
        if (Object.entries(workspaceJson.projects).length !== 0) {
            const sortedProjects = (0, object_sort_1.sortObjectByKeys)(workspaceJson.projects);
            workspaceJson.projects = sortedProjects;
            (0, fileutils_2.writeJsonFile)(workspaceJsonPath, workspaceJson);
        }
    }
    catch (e) {
        // catch noop
    }
}
function sortTsConfig() {
    try {
        const tsconfigPath = (0, typescript_1.getRootTsConfigPath)();
        const tsconfig = (0, fileutils_2.readJsonFile)(tsconfigPath);
        const sortedPaths = (0, object_sort_1.sortObjectByKeys)(tsconfig.compilerOptions.paths);
        tsconfig.compilerOptions.paths = sortedPaths;
        (0, fileutils_2.writeJsonFile)(tsconfigPath, tsconfig);
    }
    catch (e) {
        // catch noop
    }
}
function movePropertiesToNewLocations(workspaceJsonPath) {
    var _a, _b, _c, _d;
    try {
        const workspaceJson = (0, fileutils_2.readJsonFile)(workspaceJsonPath);
        const nxJson = (0, fileutils_2.readJsonFile)('nx.json');
        if (workspaceJson.cli ||
            workspaceJson.generators ||
            nxJson.projects ||
            nxJson.defaultProject) {
            (_a = nxJson.cli) !== null && _a !== void 0 ? _a : (nxJson.cli = workspaceJson.cli);
            (_b = nxJson.generators) !== null && _b !== void 0 ? _b : (nxJson.generators = (_c = workspaceJson.generators) !== null && _c !== void 0 ? _c : workspaceJson.schematics);
            (_d = nxJson.defaultProject) !== null && _d !== void 0 ? _d : (nxJson.defaultProject = workspaceJson.defaultProject);
            delete workspaceJson['cli'];
            delete workspaceJson['generators'];
            delete workspaceJson['defaultProject'];
            moveTagsAndImplicitDepsFromNxJsonToWorkspaceJson(workspaceJson, nxJson);
            (0, fileutils_2.writeJsonFile)(workspaceJsonPath, workspaceJson);
            (0, fileutils_2.writeJsonFile)('nx.json', nxJson);
        }
    }
    catch (e) {
        console.error(`Error moving properties between Nx.Json + ${workspaceJsonPath}`);
        console.error(e);
    }
}
function moveTagsAndImplicitDepsFromNxJsonToWorkspaceJson(workspaceJson, nxJson) {
    if (!nxJson.projects) {
        return;
    }
    Object.entries(nxJson.projects).forEach(([project, config]) => {
        workspaceJson.projects[project] = Object.assign(Object.assign({}, workspaceJson.projects[project]), config);
    });
    delete nxJson.projects;
}
exports.moveTagsAndImplicitDepsFromNxJsonToWorkspaceJson = moveTagsAndImplicitDepsFromNxJsonToWorkspaceJson;
//# sourceMappingURL=format.js.map