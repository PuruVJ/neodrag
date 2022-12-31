import { LockFileData, PackageDependency } from './utils/lock-file-type';
import { TransitiveLookupFunctionInput } from './utils/mapping';
import type { PackageJsonDeps } from './utils/pruning';
/**
 * Parses package-lock.json file to `LockFileData` object
 *
 * @param lockFile
 * @returns
 */
export declare function parseNpmLockFile(lockFile: string): LockFileData;
/**
 * Generates package-lock.json file from `LockFileData` object
 *
 * @param lockFile
 * @returns
 */
export declare function stringifyNpmLockFile(lockFileData: LockFileData): string;
/**
 * Returns matching version of the dependency
 */
export declare function transitiveDependencyNpmLookup({ packageName, parentPackages, versions, version, }: TransitiveLookupFunctionInput): PackageDependency;
/**
 * Prunes the lock file data based on the list of packages and their transitive dependencies
 *
 * @param lockFileData
 * @returns
 */
export declare function pruneNpmLockFile(lockFileData: LockFileData, normalizedPackageJson: PackageJsonDeps): LockFileData;
