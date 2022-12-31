"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapExternalNodes = exports.getNodeName = exports.isRootVersion = void 0;
const workspace_root_1 = require("../../utils/workspace-root");
const fs_1 = require("fs");
/**
 * Checks whether the package is a root dependency
 * @param packageName
 * @param version
 * @returns
 */
function isRootVersion(packageName, version) {
    const fullPath = `${workspace_root_1.workspaceRoot}/node_modules/${packageName}/package.json`;
    if ((0, fs_1.existsSync)(fullPath)) {
        const content = (0, fs_1.readFileSync)(fullPath, 'utf-8');
        return JSON.parse(content).version === version;
    }
    else {
        return false;
    }
}
exports.isRootVersion = isRootVersion;
// Finds the maching version of each dependency of the package and
// maps each {package}:{versionRange} pair to "npm:{package}@{version}" (when transitive) or "npm:{package}" (when root)
function mapTransitiveDependencies(parentPackages, packages, dependencies, versionCache, transitiveLookupFn) {
    if (!dependencies) {
        return [];
    }
    const result = [];
    Object.keys(dependencies).forEach((packageName) => {
        var _a, _b;
        const versions = packages[packageName];
        // some of the peer dependencies might not be installed,
        // we don't have them as nodes in externalNodes
        // so there's no need to map them as dependencies
        if (!versions) {
            return;
        }
        // fix for pnpm versions that might have suffixes - `1.2.3_@babel+core@4.5.6`
        const version = dependencies[packageName].split('_')[0];
        const key = `${packageName}@${version}`;
        // if we already processed this dependency, use the version from the cache
        if (versionCache[key]) {
            result.push(versionCache[key]);
        }
        else {
            const matchedVersion = versions[`${packageName}@${version}`]
                ? version
                : (_a = transitiveLookupFn({
                    packageName,
                    parentPackages,
                    versions,
                    version,
                })) === null || _a === void 0 ? void 0 : _a.version;
            // for some peer dependencies, we won't find installed version so we'll just ignore these
            if (matchedVersion) {
                const nodeName = getNodeName(packageName, matchedVersion, (_b = versions[`${packageName}@${matchedVersion}`]) === null || _b === void 0 ? void 0 : _b.rootVersion);
                result.push(nodeName);
                versionCache[key] = nodeName;
            }
        }
    });
    return result;
}
/**
 * Returns node name depending on whether it's root version or nested
 */
function getNodeName(dep, version, rootVersion) {
    return rootVersion ? `npm:${dep}` : `npm:${dep}@${version}`;
}
exports.getNodeName = getNodeName;
/**
 * Maps the lockfile data to the partial project graph
 * using package manager specific {@link TransitiveLookupFunction}
 *
 * @param lockFileData
 * @param transitiveLookupFn
 * @returns
 */
function mapExternalNodes(lockFileData, transitiveLookupFn) {
    const result = {
        dependencies: {},
        externalNodes: {},
        nodes: {},
    };
    const versionCache = {};
    Object.entries(lockFileData.dependencies).forEach(([packageName, versions]) => {
        Object.values(versions).forEach(({ version, rootVersion, dependencies, peerDependencies }) => {
            // save external node
            const nodeName = getNodeName(packageName, version, rootVersion);
            result.externalNodes[nodeName] = {
                type: 'npm',
                name: nodeName,
                data: {
                    version,
                    packageName,
                },
            };
            // combine dependencies and peerDependencies
            const allDependencies = dependencies || peerDependencies
                ? Object.assign(Object.assign({}, (dependencies || {})), (peerDependencies || {})) : undefined;
            if (allDependencies) {
                const nodeDependencies = [];
                const transitiveDeps = mapTransitiveDependencies([packageName], lockFileData.dependencies, allDependencies, versionCache, transitiveLookupFn);
                transitiveDeps.forEach((target) => {
                    nodeDependencies.push({
                        type: 'static',
                        source: nodeName,
                        target,
                    });
                });
                result.dependencies[nodeName] = nodeDependencies;
            }
        });
    });
    return result;
}
exports.mapExternalNodes = mapExternalNodes;
//# sourceMappingURL=mapping.js.map