"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePackageJson = void 0;
/**
 * Strip off non-pruning related fields from package.json
 *
 * @param packageJson
 * @param isProduction
 * @param projectName
 * @returns
 */
function normalizePackageJson(packageJson) {
    const { name, version, license, dependencies, devDependencies, peerDependencies, peerDependenciesMeta, } = packageJson;
    return {
        name,
        version,
        license,
        dependencies,
        devDependencies,
        peerDependencies,
        peerDependenciesMeta,
    };
}
exports.normalizePackageJson = normalizePackageJson;
//# sourceMappingURL=pruning.js.map