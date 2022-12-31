"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageRegistryPack = exports.packageRegistryView = exports.resolvePackageVersionUsingInstallation = exports.resolvePackageVersionUsingRegistry = exports.createTempNpmDirectory = exports.checkForNPMRC = exports.getPackageManagerVersion = exports.getPackageManagerCommand = exports.detectPackageManager = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const tmp_1 = require("tmp");
const util_1 = require("util");
const fileutils_1 = require("./fileutils");
const package_json_1 = require("./package-json");
const semver_1 = require("semver");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Detects which package manager is used in the workspace based on the lock file.
 */
function detectPackageManager(dir = '') {
    return (0, fs_1.existsSync)((0, path_1.join)(dir, 'yarn.lock'))
        ? 'yarn'
        : (0, fs_1.existsSync)((0, path_1.join)(dir, 'pnpm-lock.yaml'))
            ? 'pnpm'
            : 'npm';
}
exports.detectPackageManager = detectPackageManager;
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
function getPackageManagerCommand(packageManager = detectPackageManager()) {
    const commands = {
        yarn: () => {
            const yarnVersion = getPackageManagerVersion('yarn');
            const useBerry = (0, semver_1.gte)(yarnVersion, '2.0.0');
            return {
                install: 'yarn',
                ciInstall: useBerry
                    ? 'yarn install --immutable'
                    : 'yarn install --frozen-lockfile',
                add: useBerry ? 'yarn add' : 'yarn add -W',
                addDev: useBerry ? 'yarn add -D' : 'yarn add -D -W',
                rm: 'yarn remove',
                exec: useBerry ? 'yarn exec' : 'yarn',
                run: (script, args) => `yarn ${script} ${args}`,
                list: useBerry ? 'yarn info --name-only' : 'yarn list',
            };
        },
        pnpm: () => {
            const pnpmVersion = getPackageManagerVersion('pnpm');
            const useExec = (0, semver_1.gte)(pnpmVersion, '6.13.0');
            const includeDoubleDashBeforeArgs = (0, semver_1.lt)(pnpmVersion, '7.0.0');
            const isPnpmWorkspace = (0, fs_1.existsSync)('pnpm-workspace.yaml');
            return {
                install: 'pnpm install --no-frozen-lockfile',
                ciInstall: 'pnpm install --frozen-lockfile',
                add: isPnpmWorkspace ? 'pnpm add -w' : 'pnpm add',
                addDev: isPnpmWorkspace ? 'pnpm add -Dw' : 'pnpm add -D',
                rm: 'pnpm rm',
                exec: useExec ? 'pnpm exec' : 'pnpx',
                run: (script, args) => includeDoubleDashBeforeArgs
                    ? `pnpm run ${script} -- ${args}`
                    : `pnpm run ${script} ${args}`,
                list: 'pnpm ls --depth 100',
            };
        },
        npm: () => {
            var _a;
            var _b;
            (_a = (_b = process.env).npm_config_legacy_peer_deps) !== null && _a !== void 0 ? _a : (_b.npm_config_legacy_peer_deps = 'true');
            return {
                install: 'npm install',
                ciInstall: 'npm ci',
                add: 'npm install',
                addDev: 'npm install -D',
                rm: 'npm rm',
                exec: 'npx',
                run: (script, args) => `npm run ${script} -- ${args}`,
                list: 'npm ls',
            };
        },
    };
    return commands[packageManager]();
}
exports.getPackageManagerCommand = getPackageManagerCommand;
/**
 * Returns the version of the package manager used in the workspace.
 * By default, the package manager is derived based on the lock file,
 * but it can also be passed in explicitly.
 */
function getPackageManagerVersion(packageManager = detectPackageManager()) {
    return (0, child_process_1.execSync)(`${packageManager} --version`).toString('utf-8').trim();
}
exports.getPackageManagerVersion = getPackageManagerVersion;
/**
 * Checks for a project level npmrc file by crawling up the file tree until
 * hitting a package.json file, as this is how npm finds them as well.
 */
function checkForNPMRC(directory = process.cwd()) {
    while (!(0, fs_1.existsSync)((0, path_1.join)(directory, 'package.json'))) {
        directory = (0, path_1.dirname)(directory);
    }
    const path = (0, path_1.join)(directory, '.npmrc');
    return (0, fs_1.existsSync)(path) ? path : null;
}
exports.checkForNPMRC = checkForNPMRC;
/**
 * Creates a temporary directory where you can run package manager commands safely.
 *
 * For cases where you'd want to install packages that require an `.npmrc` set up,
 * this function looks up for the nearest `.npmrc` (if exists) and copies it over to the
 * temp directory.
 */
function createTempNpmDirectory() {
    const dir = (0, tmp_1.dirSync)().name;
    // A package.json is needed for pnpm pack and for .npmrc to resolve
    (0, fileutils_1.writeJsonFile)(`${dir}/package.json`, {});
    const npmrc = checkForNPMRC();
    if (npmrc) {
        // Copy npmrc if it exists, so that npm still follows it.
        (0, fs_1.copyFileSync)(npmrc, `${dir}/.npmrc`);
    }
    const cleanup = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, fs_extra_1.remove)(dir);
        }
        catch (_a) {
            // It's okay if this fails, the OS will clean it up eventually
        }
    });
    return { dir, cleanup };
}
exports.createTempNpmDirectory = createTempNpmDirectory;
/**
 * Returns the resolved version for a given package and version tag using the
 * NPM registry (when using Yarn it will fall back to NPM to fetch the info).
 */
function resolvePackageVersionUsingRegistry(packageName, version) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield packageRegistryView(packageName, version, 'version');
            if (!result) {
                throw new Error(`Unable to resolve version ${packageName}@${version}.`);
            }
            // get the last line of the output, strip the package version and quotes
            const resolvedVersion = result
                .split('\n')
                .pop()
                .split(' ')
                .pop()
                .replace(/'/g, '');
            return resolvedVersion;
        }
        catch (_a) {
            throw new Error(`Unable to resolve version ${packageName}@${version}.`);
        }
    });
}
exports.resolvePackageVersionUsingRegistry = resolvePackageVersionUsingRegistry;
/**
 * Return the resolved version for a given package and version tag using by
 * installing it in a temporary directory and fetching the version from the
 * package.json.
 */
function resolvePackageVersionUsingInstallation(packageName, version) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { dir, cleanup } = createTempNpmDirectory();
        try {
            const pmc = getPackageManagerCommand();
            yield execAsync(`${pmc.add} ${packageName}@${version}`, { cwd: dir });
            const { packageJson } = (0, package_json_1.readModulePackageJson)(packageName, [dir]);
            return packageJson.version;
        }
        finally {
            yield cleanup();
        }
    });
}
exports.resolvePackageVersionUsingInstallation = resolvePackageVersionUsingInstallation;
function packageRegistryView(pkg, version, args) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let pm = detectPackageManager();
        if (pm === 'yarn') {
            /**
             * yarn has `yarn info` but it behaves differently than (p)npm,
             * which makes it's usage unreliable
             *
             * @see https://github.com/nrwl/nx/pull/9667#discussion_r842553994
             */
            pm = 'npm';
        }
        const { stdout } = yield execAsync(`${pm} view ${pkg}@${version} ${args}`);
        return stdout.toString().trim();
    });
}
exports.packageRegistryView = packageRegistryView;
function packageRegistryPack(cwd, pkg, version) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let pm = detectPackageManager();
        if (pm === 'yarn') {
            /**
             * `(p)npm pack` will download a tarball of the specified version,
             * whereas `yarn` pack creates a tarball of the active workspace, so it
             * does not work for getting the content of a library.
             *
             * @see https://github.com/nrwl/nx/pull/9667#discussion_r842553994
             */
            pm = 'npm';
        }
        const { stdout } = yield execAsync(`${pm} pack ${pkg}@${version}`, { cwd });
        const tarballPath = stdout.trim();
        return { tarballPath };
    });
}
exports.packageRegistryPack = packageRegistryPack;
//# sourceMappingURL=package-manager.js.map