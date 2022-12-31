import { ProjectGraph } from '../../config/project-graph';
import { LockFileData, PackageDependency, PackageVersions } from './lock-file-type';
export declare type TransitiveLookupFunctionInput = {
    packageName: string;
    parentPackages: string[];
    versions: PackageVersions;
    version: string;
};
declare type TransitiveLookupFunction = (data: TransitiveLookupFunctionInput) => PackageDependency;
/**
 * Checks whether the package is a root dependency
 * @param packageName
 * @param version
 * @returns
 */
export declare function isRootVersion(packageName: string, version: string): boolean;
/**
 * Returns node name depending on whether it's root version or nested
 */
export declare function getNodeName(dep: string, version: string, rootVersion: boolean): `npm:${string}`;
/**
 * Maps the lockfile data to the partial project graph
 * using package manager specific {@link TransitiveLookupFunction}
 *
 * @param lockFileData
 * @param transitiveLookupFn
 * @returns
 */
export declare function mapExternalNodes(lockFileData: LockFileData, transitiveLookupFn: TransitiveLookupFunction): ProjectGraph<any>;
export {};
