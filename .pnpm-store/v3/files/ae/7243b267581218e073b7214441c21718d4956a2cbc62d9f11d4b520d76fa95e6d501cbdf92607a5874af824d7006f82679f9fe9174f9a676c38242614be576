import { PackageManager } from '../utils/package-manager';
import { LockFileData } from './utils/lock-file-type';
import { ProjectGraph } from '../config/project-graph';
import { PackageJson } from '../utils/package-json';
/**
 * Check if lock file exists
 */
export declare function lockFileExists(packageManager?: PackageManager): boolean;
/**
 * Hashes lock file content
 */
export declare function lockFileHash(packageManager?: PackageManager): string;
/**
 * Parses lock file and maps dependencies and metadata to {@link LockFileData}
 */
export declare function parseLockFile(packageManager?: PackageManager): LockFileData;
/**
 * Maps lock file data to {@link ProjectGraphExternalNode} hash map
 * @param lockFileData
 * @returns
 */
export declare function mapLockFileDataToPartialGraph(lockFileData: LockFileData, packageManager?: PackageManager): ProjectGraph;
/**
 * Stringifies {@link LockFileData} content and writes it to lock file
 */
export declare function writeLockFile(lockFile: LockFileData, packageManager?: PackageManager): void;
export declare function getLockFileName(packageManager?: PackageManager): string;
/**
 * Create lock file based on the root level lock file and (pruned) package.json
 *
 * @param packageJson
 * @param isProduction
 * @param packageManager
 * @returns
 */
export declare function createLockFile(packageJson: PackageJson, packageManager?: PackageManager): string;
