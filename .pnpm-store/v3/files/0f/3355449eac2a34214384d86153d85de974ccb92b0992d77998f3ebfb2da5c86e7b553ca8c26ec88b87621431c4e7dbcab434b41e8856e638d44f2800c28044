import { PackageJson } from '../utils/package-json';
export declare const packagesWeCareAbout: string[];
export declare const patternsWeIgnoreInCommunityReport: Array<string | RegExp>;
/**
 * Reports relevant version numbers for adding to an Nx issue report
 *
 * @remarks
 *
 * Must be run within an Nx workspace
 *
 */
export declare function reportHandler(): Promise<void>;
export declare function readPackageJson(p: string): PackageJson | null;
export declare function readPackageVersion(p: string): string;
export declare function findInstalledCommunityPlugins(): {
    package: string;
    version: string;
}[];
