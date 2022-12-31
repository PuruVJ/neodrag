import { MigrationsJson, PackageJsonUpdateForPackage } from '../config/misc-interfaces';
import { NxMigrationsConfiguration, PackageJson } from '../utils/package-json';
export interface ResolvedMigrationConfiguration extends MigrationsJson {
    packageGroup?: NxMigrationsConfiguration['packageGroup'];
}
export declare function normalizeVersion(version: string): string;
export interface MigratorOptions {
    packageJson: PackageJson;
    versions: (pkg: string) => string;
    fetch: (pkg: string, version: string) => Promise<ResolvedMigrationConfiguration>;
    to: {
        [pkg: string]: string;
    };
}
export declare class Migrator {
    private readonly packageJson;
    private readonly versions;
    private readonly fetch;
    private readonly to;
    constructor(opts: MigratorOptions);
    updatePackageJson(targetPackage: string, targetVersion: string): Promise<{
        packageJson: Record<string, PackageJsonUpdateForPackage>;
        migrations: {
            package: string;
            name: string;
            version: string;
            description?: string;
            cli?: string;
            implementation?: string;
            factory?: string;
        }[];
    }>;
    private _createMigrateJson;
    private collectedVersions;
    private _updatePackageJson;
    private collapsePackages;
    private gt;
    private lte;
}
declare type GenerateMigrations = {
    type: 'generateMigrations';
    targetPackage: string;
    targetVersion: string;
    from: {
        [k: string]: string;
    };
    to: {
        [k: string]: string;
    };
};
declare type RunMigrations = {
    type: 'runMigrations';
    runMigrations: string;
};
export declare function parseMigrationsOptions(options: {
    [k: string]: any;
}): GenerateMigrations | RunMigrations;
export declare function executeMigrations(root: string, migrations: {
    package: string;
    name: string;
    description?: string;
    version: string;
    cli?: 'nx' | 'angular';
}[], isVerbose: boolean, shouldCreateCommits: boolean, commitPrefix: string): Promise<{
    package: string;
    name: string;
    description?: string;
    version: string;
    cli?: 'nx' | 'angular';
}[]>;
export declare function migrate(root: string, args: {
    [k: string]: any;
}): Promise<any>;
export {};
