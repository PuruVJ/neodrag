"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prunePnpmLockFile = exports.transitiveDependencyPnpmLookup = exports.stringifyPnpmLockFile = exports.parsePnpmLockFile = void 0;
const tslib_1 = require("tslib");
const js_yaml_1 = require("@zkochan/js-yaml");
const mapping_1 = require("./utils/mapping");
const hashing_1 = require("./utils/hashing");
const semver_1 = require("semver");
const object_sort_1 = require("../utils/object-sort");
const LOCKFILE_YAML_FORMAT = {
    blankLines: true,
    lineWidth: 1000,
    noCompatMode: true,
    noRefs: true,
    sortKeys: false,
};
/**
 * Parses pnpm-lock.yaml file to `LockFileData` object
 *
 * @param lockFile
 * @returns
 */
function parsePnpmLockFile(lockFile) {
    const data = (0, js_yaml_1.load)(lockFile);
    const { dependencies, devDependencies, packages, specifiers } = data, metadata = tslib_1.__rest(data, ["dependencies", "devDependencies", "packages", "specifiers"]);
    return {
        dependencies: mapPackages(dependencies, devDependencies, specifiers, packages, metadata.lockfileVersion.toString().endsWith('inlineSpecifiers')),
        lockFileMetadata: Object.assign({}, metadata),
        hash: (0, hashing_1.hashString)(lockFile),
    };
}
exports.parsePnpmLockFile = parsePnpmLockFile;
function mapPackages(dependencies, devDependencies, specifiers, packages, inlineSpecifiers) {
    const mappedPackages = {};
    Object.entries(packages).forEach(([key, value]) => {
        // create new key
        const { version, packageName, actualVersion } = parseVersionAndPackage(key, value, { dependencies, devDependencies });
        const newKey = `${packageName}@${version.split('_')[0]}`;
        // construct packageMeta object
        const meta = mapMetaInformation({ dependencies, devDependencies, specifiers }, inlineSpecifiers, key, value, packageName, version);
        if (!mappedPackages[packageName]) {
            mappedPackages[packageName] = {};
        }
        if (mappedPackages[packageName][newKey]) {
            mappedPackages[packageName][newKey].packageMeta.push(meta);
        }
        else {
            const { dev, optional, peer } = value, rest = tslib_1.__rest(value, ["dev", "optional", "peer"]);
            mappedPackages[packageName][newKey] = Object.assign(Object.assign(Object.assign(Object.assign({}, rest), { version: version.split('_')[0] }), (actualVersion && { actualVersion })), { packageMeta: [meta] });
        }
    });
    Object.keys(mappedPackages).forEach((packageName) => {
        const versions = mappedPackages[packageName];
        const versionKeys = Object.keys(versions);
        if (versionKeys.length === 1) {
            versions[versionKeys[0]].rootVersion = true;
        }
        else {
            const rootVersionKey = versionKeys.find((v) => (0, mapping_1.isRootVersion)(packageName, versions[v].version));
            // this should never happen, but just in case
            if (rootVersionKey) {
                versions[rootVersionKey].rootVersion = true;
            }
        }
    });
    return mappedPackages;
}
function parseVersionAndPackage(key, value, { dependencies, devDependencies }) {
    var _a;
    let version, packageName, actualVersion;
    const combinedDependencies = Object.assign(Object.assign({}, (dependencies || {})), (devDependencies || {}));
    // check if it's a special case package - npm:... or github:...
    packageName = Object.keys(combinedDependencies).find((k) => combinedDependencies[k] === key);
    if (packageName) {
        version = key;
        actualVersion = (_a = value.version) !== null && _a !== void 0 ? _a : key;
    }
    else {
        version = key.split('/').pop();
        packageName = key.slice(1, key.lastIndexOf('/'));
    }
    return { version, packageName, actualVersion };
}
// maps packageMeta based on dependencies, devDependencies and (inline) specifiers
function mapMetaInformation({ dependencies, devDependencies, specifiers, }, hasInlineSpefiers, key, _a, packageName, matchingVersion) {
    var { dev, optional, peer } = _a, dependencyDetails = tslib_1.__rest(_a, ["dev", "optional", "peer"]);
    const isDependency = isVersionMatch(dependencies === null || dependencies === void 0 ? void 0 : dependencies[packageName], matchingVersion, hasInlineSpefiers);
    const isDevDependency = isVersionMatch(devDependencies === null || devDependencies === void 0 ? void 0 : devDependencies[packageName], matchingVersion, hasInlineSpefiers);
    let specifier;
    if (isDependency || isDevDependency) {
        if (hasInlineSpefiers) {
            specifier =
                getSpecifier(dependencies === null || dependencies === void 0 ? void 0 : dependencies[packageName]) ||
                    getSpecifier(devDependencies === null || devDependencies === void 0 ? void 0 : devDependencies[packageName]);
        }
        else {
            if (isDependency || isDevDependency) {
                specifier = specifiers[packageName];
            }
        }
    }
    return Object.assign(Object.assign(Object.assign(Object.assign({ key,
        isDependency,
        isDevDependency,
        specifier }, (dev && { dev })), (optional && { optional })), (peer && { peer })), { dependencyDetails: Object.assign(Object.assign(Object.assign(Object.assign({}, (dependencyDetails.dependencies && {
            dependencies: dependencyDetails.dependencies,
        })), (dependencyDetails.peerDependencies && {
            peerDependencies: dependencyDetails.peerDependencies,
        })), (dependencyDetails.optionalDependencies && {
            optionalDependencies: dependencyDetails.optionalDependencies,
        })), (dependencyDetails.transitivePeerDependencies && {
            transitivePeerDependencies: dependencyDetails.transitivePeerDependencies,
        })) });
}
// version match for dependencies w/ or w/o inline specifier
function isVersionMatch(versionInfo, matchingVersion, hasInlineSpefiers) {
    if (!versionInfo) {
        return false;
    }
    if (!hasInlineSpefiers) {
        return versionInfo === matchingVersion;
    }
    return (versionInfo.version === matchingVersion);
}
function getSpecifier(versionInfo) {
    return (versionInfo && versionInfo.specifier);
}
/**
 * Generates pnpm-lock.yml file from `LockFileData` object
 *
 * @param lockFile
 * @returns
 */
function stringifyPnpmLockFile(lockFileData) {
    const pnpmLockFile = unmapLockFile(lockFileData);
    return (0, js_yaml_1.dump)(pnpmLockFile, LOCKFILE_YAML_FORMAT);
}
exports.stringifyPnpmLockFile = stringifyPnpmLockFile;
// revert lock file to it's original state
function unmapLockFile(lockFileData) {
    const devDependencies = {};
    const dependencies = {};
    const packages = {};
    const specifiers = {};
    const inlineSpecifiers = lockFileData.lockFileMetadata.lockfileVersion
        .toString()
        .endsWith('inlineSpecifiers');
    const packageNames = Object.keys(lockFileData.dependencies);
    for (let i = 0; i < packageNames.length; i++) {
        const packageName = packageNames[i];
        const versions = Object.values(lockFileData.dependencies[packageName]);
        versions.forEach((_a) => {
            var { packageMeta, version: _, actualVersion, rootVersion } = _a, rest = tslib_1.__rest(_a, ["packageMeta", "version", "actualVersion", "rootVersion"]);
            packageMeta.forEach(({ key, specifier, isDependency, isDevDependency, dependencyDetails, dev, optional, peer, }) => {
                let version;
                if (inlineSpecifiers) {
                    version = {
                        specifier,
                        version: actualVersion
                            ? key
                            : key.slice(key.lastIndexOf('/') + 1),
                    };
                }
                else {
                    version = actualVersion
                        ? key
                        : key.slice(key.lastIndexOf('/') + 1);
                    if (specifier) {
                        specifiers[packageName] = specifier;
                    }
                }
                if (isDependency) {
                    dependencies[packageName] = version;
                }
                if (isDevDependency) {
                    devDependencies[packageName] = version;
                }
                packages[key] = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, rest), (actualVersion &&
                    actualVersion !== version && { version: actualVersion })), { dev: !!dev }), (optional && { optional })), (peer && { peer })), dependencyDetails);
            });
        });
    }
    const _a = lockFileData.lockFileMetadata, { time } = _a, lockFileMetatada = tslib_1.__rest(_a, ["time"]);
    return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, lockFileMetatada), (Object.keys(specifiers).length && {
        specifiers: (0, object_sort_1.sortObjectByKeys)(specifiers),
    })), (Object.keys(dependencies).length && {
        dependencies: (0, object_sort_1.sortObjectByKeys)(dependencies),
    })), (Object.keys(devDependencies).length && {
        devDependencies: (0, object_sort_1.sortObjectByKeys)(devDependencies),
    })), (Object.keys(packages).length && {
        packages: (0, object_sort_1.sortObjectByKeys)(packages),
    })), { time });
}
/**
 * Returns matching version of the dependency
 */
function transitiveDependencyPnpmLookup({ packageName, versions, version, }) {
    const combinedDependency = Object.values(versions).find((v) => v.packageMeta.some((m) => m.key === `/${packageName}/${version}`));
    if (combinedDependency) {
        return combinedDependency;
    }
    // pnpm's dependencies always point to the exact version so this block is only for insurrance
    return Object.values(versions).find((v) => (0, semver_1.satisfies)(v.version, version));
}
exports.transitiveDependencyPnpmLookup = transitiveDependencyPnpmLookup;
/**
 * Prunes the lock file data based on the list of packages and their transitive dependencies
 *
 * @param lockFileData
 * @returns
 */
function prunePnpmLockFile(lockFileData, normalizedPackageJson) {
    const dependencies = pruneDependencies(lockFileData.dependencies, normalizedPackageJson);
    const prunedLockFileData = {
        lockFileMetadata: pruneMetadata(lockFileData.lockFileMetadata, dependencies),
        dependencies,
        hash: (0, hashing_1.generatePrunnedHash)(lockFileData.hash, normalizedPackageJson),
    };
    return prunedLockFileData;
}
exports.prunePnpmLockFile = prunePnpmLockFile;
// iterate over packages to collect the affected tree of dependencies
function pruneDependencies(dependencies, normalizedPackageJson) {
    const result = {};
    Object.entries(Object.assign(Object.assign(Object.assign({}, normalizedPackageJson.dependencies), normalizedPackageJson.devDependencies), normalizedPackageJson.peerDependencies)).forEach(([packageName, packageVersion]) => {
        var _a, _b, _c;
        if (dependencies[packageName]) {
            const [key, _d] = Object.entries(dependencies[packageName]).find(([_, v]) => v.rootVersion), { packageMeta } = _d, value = tslib_1.__rest(_d, ["packageMeta"]);
            result[packageName] = result[packageName] || {};
            const metaKey = value.actualVersion
                ? value.version
                : `/${packageName}/${value.version}`;
            const meta = packageMeta.find((m) => m.key.startsWith(metaKey));
            result[packageName][key] = Object.assign(value, {
                packageMeta: [
                    {
                        isDependency: !!((_a = normalizedPackageJson.dependencies) === null || _a === void 0 ? void 0 : _a[packageName]) ||
                            !!((_b = normalizedPackageJson.peerDependencies) === null || _b === void 0 ? void 0 : _b[packageName]),
                        isDevDependency: !!((_c = normalizedPackageJson.devDependencies) === null || _c === void 0 ? void 0 : _c[packageName]),
                        key: meta.key,
                        specifier: packageVersion,
                        dependencyDetails: meta.dependencyDetails,
                    },
                ],
            });
            pruneTransitiveDependencies([packageName], dependencies, result, result[packageName][key]);
        }
        else {
            console.warn(`Could not find ${packageName} in the lock file. Skipping...`);
        }
    });
    return result;
}
function pruneMetadata(lockFileMetadata, prunedDependencies) {
    // These should be removed from the lock file metadata since we don't have them in the package.json
    // overrides, patchedDependencies, neverBuiltDependencies, onlyBuiltDependencies, packageExtensionsChecksum
    return Object.assign({ lockfileVersion: lockFileMetadata.lockfileVersion }, (lockFileMetadata.time && {
        time: pruneTime(lockFileMetadata.time, prunedDependencies),
    }));
}
function pruneTime(time, prunedDependencies) {
    const result = {};
    Object.entries(time).forEach(([key, value]) => {
        const packageName = key.slice(1, key.lastIndexOf('/'));
        const version = key.slice(key.lastIndexOf('/'));
        if (prunedDependencies[packageName] &&
            prunedDependencies[packageName][`${packageName}@${version}`]) {
            result[key] = value;
        }
    });
    return result;
}
// find all transitive dependencies of already pruned packages
// and adds them to the collection
// recursively prune their dependencies
function pruneTransitiveDependencies(parentPackages, dependencies, prunedDeps, parent) {
    Object.entries(Object.assign(Object.assign({}, parent.dependencies), parent.optionalDependencies)).forEach(([packageName, version]) => {
        var _a;
        const versions = dependencies[packageName];
        if (versions) {
            const dependency = transitiveDependencyPnpmLookup({
                packageName,
                parentPackages,
                versions,
                version,
            });
            if (dependency) {
                if (!prunedDeps[packageName]) {
                    prunedDeps[packageName] = {};
                }
                const { packageMeta, rootVersion } = dependency, value = tslib_1.__rest(dependency, ["packageMeta", "rootVersion"]);
                const key = `${packageName}@${value.version}`;
                const meta = findPackageMeta(packageMeta, parentPackages);
                if (prunedDeps[packageName][key]) {
                    // TODO not sure if this is important?
                }
                else {
                    const packageMeta = {
                        key: meta.key,
                        dependencyDetails: meta.dependencyDetails,
                    };
                    prunedDeps[packageName][key] = Object.assign(value, {
                        rootVersion: false,
                        packageMeta: [packageMeta],
                    });
                    if (parent.packageMeta[0].optional ||
                        ((_a = parent.optionalDependencies) === null || _a === void 0 ? void 0 : _a[packageName])) {
                        packageMeta.optional = true;
                    }
                    pruneTransitiveDependencies([...parentPackages, packageName], dependencies, prunedDeps, prunedDeps[packageName][key]);
                }
            }
        }
    });
}
function findPackageMeta(packageMeta, parentPackages) {
    const matchPackageVersionModifier = (version) => (packageName) => {
        const normalizedName = packageName.split('/').join('+');
        if (version.includes(`_${normalizedName}@`)) {
            return true;
        }
    };
    const nestedDependency = packageMeta.find((m) => {
        const version = m.key.split('/').pop();
        // it's modified by a single dependency
        // e.g. /@org/my-package/1.0.0_@babel+core@1.2.3
        return (version.includes('_') &&
            parentPackages.some(matchPackageVersionModifier(version)));
    }) ||
        // it's not modified by a single dependency but a mix of them
        // e.g. /@org/my-package/1.0.0_asfgasgasgasg
        packageMeta.find((m) => m.key.split('/').pop().includes('_'));
    if (nestedDependency) {
        return nestedDependency;
    }
    // otherwise it's a root dependency
    return packageMeta.find((m) => !m.key.split('/').pop().includes('_'));
}
//# sourceMappingURL=pnpm.js.map