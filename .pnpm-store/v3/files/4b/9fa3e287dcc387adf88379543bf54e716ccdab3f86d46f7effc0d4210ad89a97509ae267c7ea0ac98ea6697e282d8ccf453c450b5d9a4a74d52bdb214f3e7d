export declare type PackageManager = 'yarn' | 'pnpm' | 'npm';
export interface PackageManagerCommands {
    install: string;
    ciInstall: string;
    add: string;
    addDev: string;
    rm: string;
    exec: string;
    list: string;
    run: (script: string, args: string) => string;
}
/**
 * Detects which package manager is used in the workspace based on the lock file.
 */
export declare function detectPackageManager(dir?: string): PackageManager;
/**
 * Returns commands for the package manager used in the workspace.
 * By default, the package manager is derived based on the lock file,
 * but it can also be passed in explicitly.
 *
 * Example:
 *
 * ```javascript
 * execSync(`${getPackageManagerCommand().addDev} my-dev-package`);
 * ```
 */
export declare function getPackageManagerCommand(packageManager?: PackageManager): PackageManagerCommands;
/**
 * Returns the version of the package manager used in the workspace.
 * By default, the package manager is derived based on the lock file,
 * but it can also be passed in explicitly.
 */
export declare function getPackageManagerVersion(packageManager?: PackageManager): string;
/**
 * Checks for a project level npmrc file by crawling up the file tree until
 * hitting a package.json file, as this is how npm finds them as well.
 */
export declare function checkForNPMRC(directory?: string): string | null;
/**
 * Creates a temporary directory where you can run package manager commands safely.
 *
 * For cases where you'd want to install packages that require an `.npmrc` set up,
 * this function looks up for the nearest `.npmrc` (if exists) and copies it over to the
 * temp directory.
 */
export declare function createTempNpmDirectory(): {
    dir: string;
    cleanup: () => Promise<void>;
};
/**
 * Returns the resolved version for a given package and version tag using the
 * NPM registry (when using Yarn it will fall back to NPM to fetch the info).
 */
export declare function resolvePackageVersionUsingRegistry(packageName: string, version: string): Promise<string>;
/**
 * Return the resolved version for a given package and version tag using by
 * installing it in a temporary directory and fetching the version from the
 * package.json.
 */
export declare function resolvePackageVersionUsingInstallation(packageName: string, version: string): Promise<string>;
export declare function packageRegistryView(pkg: string, version: string, args: string): Promise<string>;
export declare function packageRegistryPack(cwd: string, pkg: string, version: string): Promise<{
    tarballPath: string;
}>;
