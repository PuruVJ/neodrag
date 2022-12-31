import { LockFileData, PackageDependency } from './utils/lock-file-type';
import { TransitiveLookupFunctionInput } from './utils/mapping';
import { PackageJsonDeps } from './utils/pruning';
/**
 * Parses `yarn.lock` syml file and maps to {@link LockFileData}
 *
 * @param lockFile
 * @returns
 */
export declare function parseYarnLockFile(lockFile: string): LockFileData;
/**
 * Generates yarn.lock file from `LockFileData` object
 *
 * @param lockFileData
 * @returns
 */
export declare function stringifyYarnLockFile(lockFileData: LockFileData): string;
/**
 * Returns matching version of the dependency
 */
export declare function transitiveDependencyYarnLookup({ packageName, versions, version, }: TransitiveLookupFunctionInput): PackageDependency;
/**
 * Prunes the lock file data based on the list of packages and their transitive dependencies
 *
 * @param lockFileData
 * @returns
 */
export declare function pruneYarnLockFile(lockFileData: LockFileData, normalizedPackageJson: PackageJsonDeps): LockFileData;
