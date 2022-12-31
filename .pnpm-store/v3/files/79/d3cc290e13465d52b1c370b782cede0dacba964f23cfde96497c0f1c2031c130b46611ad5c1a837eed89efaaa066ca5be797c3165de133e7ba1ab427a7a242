"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetProjectLocator = void 0;
const typescript_1 = require("./typescript");
const fileutils_1 = require("./fileutils");
const path_1 = require("path");
const workspace_root_1 = require("./workspace-root");
const find_project_for_path_1 = require("../project-graph/utils/find-project-for-path");
class TargetProjectLocator {
    constructor(nodes, externalNodes) {
        var _a, _b;
        this.nodes = nodes;
        this.externalNodes = externalNodes;
        this.projectRootMappings = (0, find_project_for_path_1.createProjectRootMappings)(this.nodes);
        this.npmProjects = filterRootExternalDependencies(this.externalNodes);
        this.tsConfig = this.getRootTsConfig();
        this.paths = (_b = (_a = this.tsConfig.config) === null || _a === void 0 ? void 0 : _a.compilerOptions) === null || _b === void 0 ? void 0 : _b.paths;
        this.typescriptResolutionCache = new Map();
        this.npmResolutionCache = new Map();
    }
    /**
     * Find a project based on its import
     *
     * @param importExpr
     * @param filePath
     */
    findProjectWithImport(importExpr, filePath) {
        const normalizedImportExpr = importExpr.split('#')[0];
        if ((0, fileutils_1.isRelativePath)(normalizedImportExpr)) {
            const resolvedModule = path_1.posix.join((0, path_1.dirname)(filePath), normalizedImportExpr);
            return this.findProjectOfResolvedModule(resolvedModule);
        }
        const paths = this.findPaths(normalizedImportExpr);
        if (paths) {
            for (let p of paths) {
                const maybeResolvedProject = this.findProjectOfResolvedModule(p);
                if (maybeResolvedProject) {
                    return maybeResolvedProject;
                }
            }
        }
        // try to find npm package before using expensive typescript resolution
        const npmProject = this.findNpmPackage(normalizedImportExpr);
        if (npmProject) {
            return npmProject;
        }
        if (this.tsConfig.config) {
            // TODO(meeroslav): this block is probably obsolete
            // and existed only because of the incomplete `paths` matching
            // if import cannot be matched using tsconfig `paths` the compilation would fail anyway
            const resolvedProject = this.resolveImportWithTypescript(normalizedImportExpr, filePath);
            if (resolvedProject) {
                return resolvedProject;
            }
        }
        // nothing found, cache for later
        this.npmResolutionCache.set(normalizedImportExpr, undefined);
        return null;
    }
    /**
     * Return file paths matching the import relative to the repo root
     * @param normalizedImportExpr
     * @returns
     */
    findPaths(normalizedImportExpr) {
        if (!this.paths) {
            return undefined;
        }
        if (this.paths[normalizedImportExpr]) {
            return this.paths[normalizedImportExpr];
        }
        const wildcardPath = Object.keys(this.paths).find((path) => path.endsWith('/*') &&
            (normalizedImportExpr.startsWith(path.replace(/\*$/, '')) ||
                normalizedImportExpr === path.replace(/\/\*$/, '')));
        if (wildcardPath) {
            return this.paths[wildcardPath];
        }
        return undefined;
    }
    resolveImportWithTypescript(normalizedImportExpr, filePath) {
        let resolvedModule;
        if (this.typescriptResolutionCache.has(normalizedImportExpr)) {
            resolvedModule = this.typescriptResolutionCache.get(normalizedImportExpr);
        }
        else {
            resolvedModule = (0, typescript_1.resolveModuleByImport)(normalizedImportExpr, filePath, this.tsConfig.absolutePath);
            this.typescriptResolutionCache.set(normalizedImportExpr, resolvedModule ? resolvedModule : null);
        }
        // TODO: vsavkin temporary workaround. Remove it once we reworking handling of npm packages.
        if (resolvedModule && resolvedModule.indexOf('node_modules/') === -1) {
            const resolvedProject = this.findProjectOfResolvedModule(resolvedModule);
            if (resolvedProject) {
                return resolvedProject;
            }
        }
        return;
    }
    findNpmPackage(npmImport) {
        if (this.npmResolutionCache.has(npmImport)) {
            return this.npmResolutionCache.get(npmImport);
        }
        else {
            const pkg = this.npmProjects.find((pkg) => npmImport === pkg.data.packageName ||
                npmImport.startsWith(`${pkg.data.packageName}/`));
            if (pkg) {
                this.npmResolutionCache.set(npmImport, pkg.name);
                return pkg.name;
            }
        }
    }
    findProjectOfResolvedModule(resolvedModule) {
        const normalizedResolvedModule = resolvedModule.startsWith('./')
            ? resolvedModule.substring(2)
            : resolvedModule;
        const importedProject = this.findMatchingProjectFiles(normalizedResolvedModule);
        return importedProject ? importedProject.name : void 0;
    }
    getAbsolutePath(path) {
        return (0, path_1.join)(workspace_root_1.workspaceRoot, path);
    }
    getRootTsConfig() {
        const path = (0, typescript_1.getRootTsConfigFileName)();
        if (!path) {
            return {
                path: null,
                absolutePath: null,
                config: null,
            };
        }
        const absolutePath = this.getAbsolutePath(path);
        return {
            absolutePath,
            path,
            config: (0, fileutils_1.readJsonFile)(absolutePath),
        };
    }
    findMatchingProjectFiles(file) {
        const project = (0, find_project_for_path_1.findProjectForPath)(file, this.projectRootMappings);
        return this.nodes[project];
    }
}
exports.TargetProjectLocator = TargetProjectLocator;
// matches `npm:@scope/name`, `npm:name` but not `npm:@scope/name@version` and `npm:name@version`
const ROOT_VERSION_PACKAGE_NAME_REGEX = /^npm:(?!.+@.+)/;
function filterRootExternalDependencies(externalNodes) {
    if (!externalNodes) {
        return [];
    }
    const keys = Object.keys(externalNodes);
    const nodes = [];
    for (let i = 0; i < keys.length; i++) {
        if (keys[i].match(ROOT_VERSION_PACKAGE_NAME_REGEX)) {
            nodes.push(externalNodes[keys[i]]);
        }
    }
    return nodes;
}
//# sourceMappingURL=target-project-locator.js.map