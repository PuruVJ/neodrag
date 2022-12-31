"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pruneNpmLockFile = exports.transitiveDependencyNpmLookup = exports.stringifyNpmLockFile = exports.parseNpmLockFile = void 0;
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const semver_1 = require("semver");
const fileutils_1 = require("../utils/fileutils");
const output_1 = require("../utils/output");
const path_1 = require("../utils/path");
const workspace_root_1 = require("../utils/workspace-root");
const hashing_1 = require("./utils/hashing");
/**
 * Parses package-lock.json file to `LockFileData` object
 *
 * @param lockFile
 * @returns
 */
function parseNpmLockFile(lockFile) {
    const _a = JSON.parse(lockFile), { packages, dependencies } = _a, metadata = tslib_1.__rest(_a, ["packages", "dependencies"]);
    return {
        dependencies: mapPackages(dependencies, packages, metadata.lockfileVersion),
        lockFileMetadata: Object.assign({ metadata }, (packages && { rootPackage: packages[''] })),
        hash: (0, hashing_1.hashString)(lockFile),
    };
}
exports.parseNpmLockFile = parseNpmLockFile;
// Maps /node_modules/@abc/def with version 1.2.3 => @abc/def > @abc/dev@1.2.3
function mapPackages(dependencies, packages, lockfileVersion) {
    const mappedPackages = {};
    if (lockfileVersion === 1) {
        Object.entries(dependencies).forEach(([packageName, value]) => {
            const { newKey, packagePath } = prepareDependency(packageName, value, mappedPackages);
            mapPackageDependency(mappedPackages, packageName, newKey, packagePath, value, lockfileVersion, true);
            // we need to map the nested dependencies recursively
            mapPackageDependencies(mappedPackages, value.dependencies, packagePath, lockfileVersion);
        });
    }
    else {
        Object.entries(packages).forEach(([packagePath, value]) => {
            // we parse root package.json separately
            if (packagePath !== '') {
                const packageName = packagePath.split('node_modules/').pop();
                const { newKey } = prepareDependency(packageName, value, mappedPackages, undefined, packagePath);
                let dependency;
                if (lockfileVersion === 2) {
                    const path = packagePath.split(/\/?node_modules\//).slice(1);
                    let index = 1;
                    dependency = dependencies[path[0]];
                    while (index < path.length) {
                        // the root lockfile might not match the nested project's lockfile
                        // given path might not exist in the root lockfile
                        if ((dependency === null || dependency === void 0 ? void 0 : dependency.dependencies) &&
                            dependency.dependencies[path[index]]) {
                            dependency = dependency.dependencies[path[index]];
                            index++;
                        }
                        else {
                            break;
                        }
                    }
                    // if versions are same, no need to track it further
                    if (dependency && value.version === dependency.version) {
                        dependency = undefined;
                    }
                }
                mapPackageDependency(mappedPackages, packageName, newKey, packagePath, value, lockfileVersion, undefined, dependency);
            }
        });
    }
    return mappedPackages;
}
function prepareDependency(packageName, dependency, mappedPackages, pathPrefix = '', path) {
    mappedPackages[packageName] = mappedPackages[packageName] || {};
    const version = dependency.integrity
        ? dependency.version
        : dependency.resolved;
    const newKey = packageName + '@' + version;
    const packagePath = path || pathPrefix
        ? `${pathPrefix}/node_modules/${packageName}`
        : `node_modules/${packageName}`;
    return { newKey, packagePath };
}
function mapPackageDependency(mappedPackages, packageName, key, packagePath, value, lockfileVersion, isRootVersion, dependencyValue) {
    const { dev, peer, optional } = value;
    const packageMeta = {
        path: packagePath,
        dev,
        peer,
        optional,
    };
    const rootVersion = isRootVersion !== null && isRootVersion !== void 0 ? isRootVersion : packagePath.split('/node_modules/').length === 1;
    if (!mappedPackages[packageName][key] || rootVersion) {
        // const packageDependencies = lockfileVersion === 1 ? requires : dependencies;
        if (lockfileVersion === 1) {
            const { requires } = value, rest = tslib_1.__rest(value, ["requires"]);
            if (requires) {
                rest.dependencies = requires;
            }
            value = rest;
        }
        mappedPackages[packageName][key] = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, value), (!value.integrity &&
            value.version && {
            actualVersion: value.version,
            version: value.resolved,
        })), (value.integrity &&
            dependencyValue && {
            actualVersion: value.version,
            version: dependencyValue.version,
        })), (dependencyValue && { dependencyValue })), { packageMeta: [], rootVersion });
    }
    mappedPackages[packageName][key].packageMeta.push(packageMeta);
}
function mapPackageDependencies(mappedPackages, dependencies, parentPath, lockfileVersion) {
    if (!dependencies) {
        return;
    }
    Object.entries(dependencies).forEach(([packageName, value]) => {
        const { newKey, packagePath } = prepareDependency(packageName, value, mappedPackages, parentPath);
        mapPackageDependency(mappedPackages, packageName, newKey, packagePath, value, lockfileVersion, false);
        mapPackageDependencies(mappedPackages, value.dependencies, packagePath, lockfileVersion);
    });
}
/**
 * Generates package-lock.json file from `LockFileData` object
 *
 * @param lockFile
 * @returns
 */
function stringifyNpmLockFile(lockFileData) {
    const notV1 = lockFileData.lockFileMetadata.metadata.lockfileVersion > 1;
    const notV3 = lockFileData.lockFileMetadata.metadata.lockfileVersion < 3;
    // initialize the lockfile collections
    const dependencies = {};
    const packages = Object.assign({}, (notV1 && { '': lockFileData.lockFileMetadata.rootPackage }));
    const keys = Object.keys(lockFileData.dependencies);
    for (let i = 0; i < keys.length; i++) {
        const packageName = keys[i];
        const packageVersions = lockFileData.dependencies[packageName];
        const values = Object.values(packageVersions);
        values.forEach((value) => {
            if (notV1) {
                unmapPackage(packages, value);
            }
            if (notV3) {
                unmapDependencies(dependencies, packageName, value);
            }
        });
    }
    // generate package lock JSON
    const lockFileJson = Object.assign(Object.assign(Object.assign({}, lockFileData.lockFileMetadata.metadata), (notV1 && {
        packages: sortObject(packages),
    })), (notV3 && { dependencies: sortDependencies(dependencies) }));
    return JSON.stringify(lockFileJson, null, 2) + '\n';
}
exports.stringifyNpmLockFile = stringifyNpmLockFile;
function sortObject(packages) {
    const keys = Object.keys(packages);
    if (keys.length === 0) {
        return;
    }
    keys.sort((a, b) => a.localeCompare(b));
    const result = {};
    keys.forEach((key) => {
        result[key] = packages[key];
    });
    return result;
}
// remapping the package back to package-lock format
function unmapPackage(packages, dependency) {
    const { packageMeta, rootVersion, version, actualVersion, resolved, integrity, dev, peer, optional, dependencyValue } = dependency, value = tslib_1.__rest(dependency, ["packageMeta", "rootVersion", "version", "actualVersion", "resolved", "integrity", "dev", "peer", "optional", "dependencyValue"]);
    // we need to decompose value, to achieve particular field ordering
    for (let i = 0; i < packageMeta.length; i++) {
        const { path, dev, peer, optional } = packageMeta[i];
        // we are sorting the properties to get as close as possible to the original package-lock.json
        packages[path] = Object.assign({ version: actualVersion || version, resolved,
            integrity,
            dev,
            peer,
            optional }, value);
    }
}
function unmapDependencies(dependencies, packageName, _a) {
    var { packageMeta } = _a, value = tslib_1.__rest(_a, ["packageMeta"]);
    const { version, resolved, integrity, devOptional, dependencyValue, from } = value;
    for (let i = 0; i < packageMeta.length; i++) {
        const { path, dev, optional, peer } = packageMeta[i];
        const projectPath = path.split('node_modules/').slice(1);
        const requires = unmapDependencyRequires(value);
        const innerDeps = getProjectNodeAndEnsureParentHierarchy(projectPath, dependencies);
        // sorting fields to match package-lock structure
        innerDeps[packageName] = dependencyValue || Object.assign({ version,
            resolved,
            integrity,
            from,
            dev,
            devOptional,
            optional,
            peer,
            requires }, innerDeps[packageName]);
    }
}
// generates/ensures entire parent hierarchy exists for the given project path
// returns pointer to last project in the path
function getProjectNodeAndEnsureParentHierarchy(projects, dependencies) {
    while (projects.length > 1) {
        const parentName = projects.shift().replace(/\/$/, '');
        if (!dependencies[parentName]) {
            dependencies[parentName] = {};
        }
        if (!dependencies[parentName].dependencies) {
            dependencies[parentName].dependencies = {};
        }
        dependencies = dependencies[parentName].dependencies;
    }
    return dependencies;
}
// combine dependencies and optionalDependencies into requires and sort them
function unmapDependencyRequires(value) {
    if (!value.dependencies && !value.optionalDependencies) {
        return undefined;
    }
    const dependencies = Object.assign(Object.assign({}, (value.dependencies || {})), (value.optionalDependencies || {}));
    const sortedKeys = Object.keys(dependencies).sort((a, b) => a.localeCompare(b));
    const result = {};
    for (let i = 0; i < sortedKeys.length; i++) {
        const key = sortedKeys[i];
        result[key] = dependencies[key];
    }
    return result;
}
// recursively sort dependencies
function sortDependencies(unsortedDependencies) {
    const dependencies = {};
    const sortedKeys = Object.keys(unsortedDependencies).sort((a, b) => a.localeCompare(b));
    for (let i = 0; i < sortedKeys.length; i++) {
        const value = unsortedDependencies[sortedKeys[i]];
        dependencies[sortedKeys[i]] = value;
        if (value.dependencies) {
            value.dependencies = sortDependencies(value.dependencies);
        }
    }
    return dependencies;
}
/**
 * Returns matching version of the dependency
 */
function transitiveDependencyNpmLookup({ packageName, parentPackages, versions, version, }) {
    const packageDependencies = Object.values(versions);
    for (let i = 0; i < packageDependencies.length; i++) {
        if ((0, semver_1.satisfies)(packageDependencies[i].version, version)) {
            const packageMeta = packageDependencies[i].packageMeta.find((p) => isPathMatching(p.path, packageName, parentPackages));
            if (packageMeta) {
                return Object.assign(Object.assign({}, packageDependencies[i]), { packageMeta: [packageMeta] });
            }
        }
    }
    // otherwise return the root version
    return Object.values(versions).find((v) => v.rootVersion);
}
exports.transitiveDependencyNpmLookup = transitiveDependencyNpmLookup;
function isPathMatching(path, packageName, parentPackages) {
    const packages = path.split(/\/?node_modules\//).slice(1);
    if (packages[packages.length - 1] !== packageName) {
        return false;
    }
    const locations = parentPackages
        .map((p) => packages.indexOf(p))
        .filter((p) => p !== -1);
    if (locations.length === 0) {
        return false;
    }
    for (let i = 0; i < locations.length - 2; i++) {
        if (locations[i] > locations[i + 1]) {
            return false;
        }
    }
    return true;
}
/**
 * Prunes the lock file data based on the list of packages and their transitive dependencies
 *
 * @param lockFileData
 * @returns
 */
function pruneNpmLockFile(lockFileData, normalizedPackageJson) {
    const isV1 = lockFileData.lockFileMetadata.metadata.lockfileVersion === 1;
    // NPM V1 does not track full dependency list in the lock file,
    // so we can't reuse the lock file to generate a new one
    if (isV1) {
        output_1.output.warn({
            title: 'Pruning v1 lock file',
            bodyLines: [
                `If your "node_modules" are not in sync with the lock file, you might get inaccurate results.`,
                `Run "npm ci" to ensure your installed packages are synchronized or upgrade to NPM v7+ to benefit from the new lock file format`,
            ],
        });
    }
    const dependencies = pruneDependencies(lockFileData.dependencies, normalizedPackageJson, isV1);
    const lockFileMetadata = Object.assign(Object.assign({}, lockFileData.lockFileMetadata), pruneRootPackage(lockFileData, normalizedPackageJson));
    let prunedLockFileData;
    prunedLockFileData = {
        dependencies,
        lockFileMetadata,
        hash: (0, hashing_1.generatePrunnedHash)(lockFileData.hash, normalizedPackageJson),
    };
    return prunedLockFileData;
}
exports.pruneNpmLockFile = pruneNpmLockFile;
function pruneRootPackage(lockFileData, _a) {
    var { name, version, license } = _a, dependencyInfo = tslib_1.__rest(_a, ["name", "version", "license"]);
    if (lockFileData.lockFileMetadata.metadata.lockfileVersion === 1) {
        return undefined;
    }
    const rootPackage = Object.assign(Object.assign({ name: name || lockFileData.lockFileMetadata.rootPackage.name, version: version || lockFileData.lockFileMetadata.rootPackage.version }, (lockFileData.lockFileMetadata.rootPackage.license && {
        license: license || lockFileData.lockFileMetadata.rootPackage.license,
    })), dependencyInfo);
    return { rootPackage };
}
// iterate over packages to collect the affected tree of dependencies
function pruneDependencies(dependencies, normalizedPackageJson, isV1) {
    const result = {};
    const peerDependenciesToPrune = {};
    Object.keys(Object.assign(Object.assign(Object.assign({}, normalizedPackageJson.dependencies), normalizedPackageJson.devDependencies), normalizedPackageJson.peerDependencies)).forEach((packageName) => {
        var _a, _b, _c, _e;
        if (dependencies[packageName]) {
            const [key, _f] = Object.entries(dependencies[packageName]).find(([_, v]) => v.rootVersion), { packageMeta, dev: _d, peer: _p, optional: _o } = _f, value = tslib_1.__rest(_f, ["packageMeta", "dev", "peer", "optional"]);
            const dev = (_a = normalizedPackageJson.devDependencies) === null || _a === void 0 ? void 0 : _a[packageName];
            const peer = (_b = normalizedPackageJson.peerDependencies) === null || _b === void 0 ? void 0 : _b[packageName];
            const optional = (_e = (_c = normalizedPackageJson.peerDependenciesMeta) === null || _c === void 0 ? void 0 : _c[packageName]) === null || _e === void 0 ? void 0 : _e.optional;
            const modifier = peer
                ? 'peer'
                : optional
                    ? 'optional'
                    : dev
                        ? 'dev'
                        : undefined;
            result[packageName] = result[packageName] || {};
            result[packageName][key] = Object.assign(value, {
                packageMeta: [
                    Object.assign(Object.assign(Object.assign({ path: `node_modules/${packageName}` }, (dev ? { dev } : {})), (optional ? { optional } : {})), (peer ? { peer } : {})),
                ],
            });
            pruneTransitiveDependencies([packageName], dependencies, result, result[packageName][key], isV1, modifier, peerDependenciesToPrune);
        }
        else {
            console.warn(`Could not find ${packageName} in the lock file. Skipping...`);
        }
    });
    // add all peer dependencies
    Object.values(peerDependenciesToPrune).forEach(({ parentPackages, dependency, packageMeta, packageName, key }) => {
        addPrunedDependency(parentPackages, dependencies, result, dependency, packageMeta, packageName, key, isV1);
    });
    return result;
}
// find all transitive dependencies of already pruned packages
// and adds them to the collection
// recursively prune their dependencies
function pruneTransitiveDependencies(parentPackages, dependencies, prunedDeps, value, isV1, modifier, peerDependenciesToPrune) {
    let packageJSON;
    if (isV1) {
        const pathToPackageJSON = (0, path_1.joinPathFragments)(workspace_root_1.workspaceRoot, value.packageMeta[0].path, 'package.json');
        // if node_modules are our of sync with lock file, we might not have the package.json
        if ((0, fs_1.existsSync)(pathToPackageJSON)) {
            packageJSON = (0, fileutils_1.readJsonFile)(pathToPackageJSON);
        }
    }
    if (!value.dependencies &&
        !value.peerDependencies &&
        !(packageJSON === null || packageJSON === void 0 ? void 0 : packageJSON.peerDependencies)) {
        return;
    }
    Object.entries(Object.assign(Object.assign(Object.assign(Object.assign({}, value.dependencies), value.peerDependencies), value.optionalDependencies), packageJSON === null || packageJSON === void 0 ? void 0 : packageJSON.peerDependencies)).forEach(([packageName, version]) => {
        var _a, _b;
        const versions = dependencies[packageName];
        if (versions) {
            const dependency = transitiveDependencyNpmLookup({
                packageName,
                parentPackages,
                versions,
                version,
            });
            if (dependency) {
                // dev/optional/peer dependencies can be changed during the pruning process
                // so we need to update them
                if (!prunedDeps[packageName]) {
                    prunedDeps[packageName] = {};
                }
                const key = `${packageName}@${dependency.version}`;
                const packageMeta = setPackageMetaModifiers(packageName, dependency, packageJSON || value, modifier);
                // initially will collect only non-peer dependencies
                // this gives priority to direct dependencies over peer ones
                if (peerDependenciesToPrune &&
                    (((_a = value.peerDependencies) === null || _a === void 0 ? void 0 : _a[packageName]) ||
                        ((_b = packageJSON === null || packageJSON === void 0 ? void 0 : packageJSON.peerDependencies) === null || _b === void 0 ? void 0 : _b[packageName]))) {
                    peerDependenciesToPrune[key] = peerDependenciesToPrune[key] || {
                        parentPackages,
                        dependency,
                        packageMeta,
                        packageName,
                        key,
                    };
                    return;
                }
                addPrunedDependency(parentPackages, dependencies, prunedDeps, dependency, packageMeta, packageName, key, isV1, peerDependenciesToPrune);
            }
        }
    });
}
function addPrunedDependency(parentPackages, dependencies, prunedDeps, dependency, packageMeta, packageName, key, isV1, peerDependenciesToPrune) {
    if (prunedDeps[packageName][key]) {
        const currentMeta = prunedDeps[packageName][key].packageMeta;
        if (!currentMeta.find((p) => p.path === dependency.packageMeta[0].path)) {
            currentMeta.push(packageMeta);
            currentMeta.sort();
        }
    }
    else {
        dependency.packageMeta = [packageMeta];
        prunedDeps[packageName][key] = dependency;
        // recurively collect dependencies
        pruneTransitiveDependencies([...parentPackages, packageName], dependencies, prunedDeps, prunedDeps[packageName][key], isV1, getModifier(packageMeta), peerDependenciesToPrune);
    }
}
function getModifier(packageMeta) {
    if (packageMeta.dev) {
        return 'dev';
    }
    else if (packageMeta.optional) {
        return 'optional';
    }
    else if (packageMeta.peer) {
        return 'peer';
    }
}
function setPackageMetaModifiers(packageName, dependency, parent, modifier) {
    var _a, _b, _c;
    const packageMeta = { path: dependency.packageMeta[0].path };
    if ((_a = parent.devDependencies) === null || _a === void 0 ? void 0 : _a[packageName]) {
        packageMeta.dev = true;
    }
    else if (dependency.optional) {
        packageMeta.optional = true;
    }
    else if ((_b = parent.optionalDependencies) === null || _b === void 0 ? void 0 : _b[packageName]) {
        packageMeta.optional = true;
    }
    else if ((_c = parent.peerDependencies) === null || _c === void 0 ? void 0 : _c[packageName]) {
        packageMeta.peer = true;
    }
    else if (modifier === 'dev') {
        packageMeta.dev = true;
    }
    else if (modifier === 'optional') {
        packageMeta.optional = true;
    }
    // peer is carried over from the parent
    if (modifier === 'peer') {
        packageMeta.peer = true;
    }
    return packageMeta;
}
//# sourceMappingURL=npm.js.map