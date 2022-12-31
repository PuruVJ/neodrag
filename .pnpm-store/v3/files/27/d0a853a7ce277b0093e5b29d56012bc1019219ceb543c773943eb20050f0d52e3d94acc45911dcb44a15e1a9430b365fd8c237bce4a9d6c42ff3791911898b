import { ProjectGraph } from '../../config/project-graph';
import { PackageJsonDeps } from './pruning';
/**
 * Apply simple hashing of the content using the default hashing implementation
 * @param fileContent
 * @returns
 */
export declare function hashString(fileContent: string): string;
/**
 * Hash partial graph's external nodes
 * for task graph caching
 * @param projectGraph
 */
export declare function hashExternalNodes(projectGraph: ProjectGraph): void;
/**
 * Generate new hash based on the original hash and pruning input parameters - packages and project name
 * @param originalHash
 * @param packages
 * @param projectName
 * @returns
 */
export declare function generatePrunnedHash(originalHash: string, normalizedPackageJson: PackageJsonDeps): string;
