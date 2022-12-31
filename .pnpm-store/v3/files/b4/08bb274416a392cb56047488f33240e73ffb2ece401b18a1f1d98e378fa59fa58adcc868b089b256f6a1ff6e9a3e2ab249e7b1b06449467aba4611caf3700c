import { LockFileData, PackageDependency } from './utils/lock-file-type';
import { TransitiveLookupFunctionInput } from './utils/mapping';
import { PackageJsonDeps } from './utils/pruning';
/**
 * Parses pnpm-lock.yaml file to `LockFileData` object
 *
 * @param lockFile
 * @returns
 */
export declare function parsePnpmLockFile(lockFile: string): LockFileData;
/**
 * Generates pnpm-lock.yml file from `LockFileData` object
 *
 * @param lockFile
 * @returns
 */
export declare function stringifyPnpmLockFile(lockFileData: LockFileData): string;
/**
 * Returns matching version of the dependency
 */
export declare function transitiveDependencyPnpmLookup({ packageName, versions, version, }: TransitiveLookupFunctionInput): PackageDependency;
/**
 * Prunes the lock file data based on the list of packages and their transitive dependencies
 *
 * @param lockFileData
 * @returns
 */
export declare function prunePnpmLockFile(lockFileData: LockFileData, normalizedPackageJson: PackageJsonDeps): LockFileData;
