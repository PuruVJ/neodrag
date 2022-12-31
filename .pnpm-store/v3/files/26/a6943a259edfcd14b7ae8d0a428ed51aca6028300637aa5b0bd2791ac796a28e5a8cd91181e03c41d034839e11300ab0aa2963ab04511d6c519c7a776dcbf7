"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPackageJson = void 0;
const fileutils_1 = require("./fileutils");
const object_sort_1 = require("./object-sort");
const fs_1 = require("fs");
const workspace_root_1 = require("./workspace-root");
/**
 * Creates a package.json in the output directory for support to install dependencies within containers.
 *
 * If a package.json exists in the project, it will reuse that.
 * If isProduction flag is set, it wil  remove devDependencies and optional peerDependencies
 */
function createPackageJson(projectName, graph, options = {}) {
    const npmDeps = findAllNpmDeps(projectName, graph);
    // default package.json if one does not exist
    let packageJson = {
        name: projectName,
        version: '0.0.1',
    };
    if ((0, fs_1.existsSync)(`${graph.nodes[projectName].data.root}/package.json`)) {
        try {
            packageJson = (0, fileutils_1.readJsonFile)(`${graph.nodes[projectName].data.root}/package.json`);
        }
        catch (e) { }
    }
    const rootPackageJson = (0, fileutils_1.readJsonFile)(`${options.root || workspace_root_1.workspaceRoot}/package.json`);
    Object.entries(npmDeps.dependencies).forEach(([packageName, version]) => {
        var _a, _b, _c, _d, _e, _f;
        if (((_a = rootPackageJson.devDependencies) === null || _a === void 0 ? void 0 : _a[packageName]) &&
            !((_b = packageJson.dependencies) === null || _b === void 0 ? void 0 : _b[packageName]) &&
            !((_c = packageJson.peerDependencies) === null || _c === void 0 ? void 0 : _c[packageName])) {
            // don't store dev dependencies for production
            if (!options.isProduction) {
                (_d = packageJson.devDependencies) !== null && _d !== void 0 ? _d : (packageJson.devDependencies = {});
                packageJson.devDependencies[packageName] = version;
            }
        }
        else {
            if (!((_e = packageJson.peerDependencies) === null || _e === void 0 ? void 0 : _e[packageName])) {
                (_f = packageJson.dependencies) !== null && _f !== void 0 ? _f : (packageJson.dependencies = {});
                packageJson.dependencies[packageName] = version;
            }
        }
    });
    Object.entries(npmDeps.peerDependencies).forEach(([packageName, version]) => {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!((_a = packageJson.peerDependencies) === null || _a === void 0 ? void 0 : _a[packageName])) {
            if ((_b = rootPackageJson.dependencies) === null || _b === void 0 ? void 0 : _b[packageName]) {
                (_c = packageJson.dependencies) !== null && _c !== void 0 ? _c : (packageJson.dependencies = {});
                packageJson.dependencies[packageName] = version;
                return;
            }
            const isOptionalPeer = (_d = npmDeps.peerDependenciesMeta[packageName]) === null || _d === void 0 ? void 0 : _d.optional;
            if (!isOptionalPeer) {
                (_e = packageJson.peerDependencies) !== null && _e !== void 0 ? _e : (packageJson.peerDependencies = {});
                packageJson.peerDependencies[packageName] = version;
            }
            else if (!options.isProduction) {
                // add peer optional dependencies if not in production
                (_f = packageJson.peerDependencies) !== null && _f !== void 0 ? _f : (packageJson.peerDependencies = {});
                packageJson.peerDependencies[packageName] = version;
                (_g = packageJson.peerDependenciesMeta) !== null && _g !== void 0 ? _g : (packageJson.peerDependenciesMeta = {});
                packageJson.peerDependenciesMeta[packageName] = {
                    optional: true,
                };
            }
        }
    });
    packageJson.devDependencies && (packageJson.devDependencies = (0, object_sort_1.sortObjectByKeys)(packageJson.devDependencies));
    packageJson.dependencies && (packageJson.dependencies = (0, object_sort_1.sortObjectByKeys)(packageJson.dependencies));
    packageJson.peerDependencies && (packageJson.peerDependencies = (0, object_sort_1.sortObjectByKeys)(packageJson.peerDependencies));
    packageJson.peerDependenciesMeta && (packageJson.peerDependenciesMeta = (0, object_sort_1.sortObjectByKeys)(packageJson.peerDependenciesMeta));
    return packageJson;
}
exports.createPackageJson = createPackageJson;
function findAllNpmDeps(projectName, graph, list = { dependencies: {}, peerDependencies: {}, peerDependenciesMeta: {} }, seen = new Set()) {
    var _a;
    const node = graph.externalNodes[projectName];
    if (seen.has(projectName)) {
        // if it's in peerDependencies, move it to regular dependencies
        // since this is a direct dependency of the project
        if (node && list.peerDependencies[node.data.packageName]) {
            list.dependencies[node.data.packageName] = node.data.version;
            delete list.peerDependencies[node.data.packageName];
        }
        return list;
    }
    seen.add(projectName);
    if (node) {
        list.dependencies[node.data.packageName] = node.data.version;
        recursivelyCollectPeerDependencies(node.name, graph, list, seen);
    }
    else {
        // we are not interested in the dependencies of external projects
        (_a = graph.dependencies[projectName]) === null || _a === void 0 ? void 0 : _a.forEach((dep) => {
            if (dep.type === 'static' || dep.type === 'dynamic') {
                findAllNpmDeps(dep.target, graph, list, seen);
            }
        });
    }
    return list;
}
function recursivelyCollectPeerDependencies(projectName, graph, list, seen = new Set()) {
    const npmPackage = graph.externalNodes[projectName];
    if (!npmPackage) {
        return list;
    }
    const packageName = npmPackage.data.packageName;
    try {
        const packageJson = require(`${packageName}/package.json`);
        if (!packageJson.peerDependencies) {
            return list;
        }
        Object.keys(packageJson.peerDependencies)
            .map((dependencyName) => `npm:${dependencyName}`)
            .map((dependency) => graph.externalNodes[dependency])
            .filter(Boolean)
            .forEach((node) => {
            if (!seen.has(node.name)) {
                seen.add(node.name);
                list.peerDependencies[node.data.packageName] = node.data.version;
                if (packageJson.peerDependenciesMeta &&
                    packageJson.peerDependenciesMeta[node.data.packageName] &&
                    packageJson.peerDependenciesMeta[node.data.packageName].optional) {
                    list.peerDependenciesMeta[node.data.packageName] = {
                        optional: true,
                    };
                }
                recursivelyCollectPeerDependencies(node.name, graph, list, seen);
            }
        });
        return list;
    }
    catch (e) {
        return list;
    }
}
function filterOptionalPeerDependencies(packageJson) {
    let peerDependencies;
    Object.keys(packageJson.peerDependencies).forEach((key) => {
        var _a, _b;
        if (!((_b = (_a = packageJson.peerDependenciesMeta) === null || _a === void 0 ? void 0 : _a[key]) === null || _b === void 0 ? void 0 : _b.optional)) {
            peerDependencies = peerDependencies || {};
            peerDependencies[key] = packageJson.peerDependencies[key];
        }
    });
    return peerDependencies;
}
//# sourceMappingURL=create-package-json.js.map