import { PackageJson } from '../../utils/package-json';
export declare type PackageJsonDeps = Pick<PackageJson, 'name' | 'version' | 'license' | 'dependencies' | 'devDependencies' | 'peerDependencies' | 'peerDependenciesMeta'>;
/**
 * Strip off non-pruning related fields from package.json
 *
 * @param packageJson
 * @param isProduction
 * @param projectName
 * @returns
 */
export declare function normalizePackageJson(packageJson: PackageJson): PackageJsonDeps;
