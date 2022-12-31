import { InputDefinition, TargetConfiguration } from '../config/workspace-json-project-json';
export declare type PackageJsonTargetConfiguration = Omit<TargetConfiguration, 'executor'>;
export interface NxProjectPackageJsonConfiguration {
    implicitDependencies?: string[];
    tags?: string[];
    namedInputs?: {
        [inputName: string]: (string | InputDefinition)[];
    };
    targets?: Record<string, PackageJsonTargetConfiguration>;
    includedScripts?: string[];
}
export declare type PackageGroup = (string | {
    package: string;
    version: string;
})[] | Record<string, string>;
export interface NxMigrationsConfiguration {
    migrations?: string;
    packageGroup?: PackageGroup;
}
export interface PackageJson {
    name: string;
    version: string;
    license?: string;
    scripts?: Record<string, string>;
    type?: 'module' | 'commonjs';
    main?: string;
    types?: string;
    module?: string;
    exports?: string | Record<string, string | {
        types?: string;
        require?: string;
        import?: string;
    }>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    peerDependenciesMeta?: Record<string, {
        optional?: boolean;
    }>;
    bin?: Record<string, string>;
    workspaces?: string[] | {
        packages: string[];
    };
    nx?: NxProjectPackageJsonConfiguration;
    generators?: string;
    schematics?: string;
    builders?: string;
    executors?: string;
    'nx-migrations'?: string | NxMigrationsConfiguration;
    'ng-update'?: string | NxMigrationsConfiguration;
}
export declare function readNxMigrateConfig(json: Partial<PackageJson>): NxMigrationsConfiguration;
export declare function buildTargetFromScript(script: string, nx: NxProjectPackageJsonConfiguration): TargetConfiguration;
/**
 * Uses `require.resolve` to read the package.json for a module.
 *
 * This will fail if the module doesn't export package.json
 *
 * @returns package json contents and path
 */
export declare function readModulePackageJsonWithoutFallbacks(moduleSpecifier: string, requirePaths?: string[]): {
    packageJson: PackageJson;
    path: string;
};
/**
 * Reads the package.json file for a specified module.
 *
 * Includes a fallback that accounts for modules that don't export package.json
 *
 * @param {string} moduleSpecifier The module to look up
 * @param {string[]} requirePaths List of paths look in. Pass `module.paths` to ensure non-hoisted dependencies are found.
 *
 * @example
 * // Use the caller's lookup paths for non-hoisted dependencies
 * readModulePackageJson('http-server', module.paths);
 *
 * @returns package json contents and path
 */
export declare function readModulePackageJson(moduleSpecifier: string, requirePaths?: string[]): {
    packageJson: PackageJson;
    path: string;
};
