"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = exports.executeMigrations = exports.parseMigrationsOptions = exports.Migrator = exports.normalizeVersion = void 0;
const tslib_1 = require("tslib");
const chalk = require("chalk");
const child_process_1 = require("child_process");
const path_1 = require("path");
const semver_1 = require("semver");
const util_1 = require("util");
const tree_1 = require("../generators/tree");
const fileutils_1 = require("../utils/fileutils");
const logger_1 = require("../utils/logger");
const package_json_1 = require("../utils/package-json");
const package_manager_1 = require("../utils/package-manager");
const params_1 = require("../utils/params");
const connect_1 = require("./connect");
const output_1 = require("../utils/output");
const ab_testing_1 = require("../utils/ab-testing");
const versions_1 = require("../utils/versions");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
function normalizeVersion(version) {
    const [semver, prereleaseTag] = version.split('-');
    const [major, minor, patch] = semver.split('.');
    const newSemver = `${major || 0}.${minor || 0}.${patch || 0}`;
    const newVersion = prereleaseTag
        ? `${newSemver}-${prereleaseTag}`
        : newSemver;
    const withoutPatch = `${major || 0}.${minor || 0}.0`;
    const withoutPatchAndMinor = `${major || 0}.0.0`;
    const variationsToCheck = [
        newVersion,
        newSemver,
        withoutPatch,
        withoutPatchAndMinor,
    ];
    for (const variation of variationsToCheck) {
        try {
            if ((0, semver_1.gt)(variation, '0.0.0')) {
                return variation;
            }
        }
        catch (_a) { }
    }
    return '0.0.0';
}
exports.normalizeVersion = normalizeVersion;
function normalizeSlashes(packageName) {
    return packageName.replace(/\\/g, '/');
}
class Migrator {
    constructor(opts) {
        this.collectedVersions = {};
        this.packageJson = opts.packageJson;
        this.versions = opts.versions;
        this.fetch = opts.fetch;
        this.to = opts.to;
    }
    updatePackageJson(targetPackage, targetVersion) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const packageJson = yield this._updatePackageJson(targetPackage, {
                version: targetVersion,
                addToPackageJson: false,
            });
            const migrations = yield this._createMigrateJson(packageJson);
            return { packageJson, migrations };
        });
    }
    _createMigrateJson(versions) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const migrations = yield Promise.all(Object.keys(versions).map((packageName) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const currentVersion = this.versions(packageName);
                if (currentVersion === null)
                    return [];
                const { version } = versions[packageName];
                const { generators } = yield this.fetch(packageName, version);
                if (!generators)
                    return [];
                return Object.entries(generators)
                    .filter(([, migration]) => migration.version &&
                    this.gt(migration.version, currentVersion) &&
                    this.lte(migration.version, version))
                    .map(([migrationName, migration]) => (Object.assign(Object.assign({}, migration), { package: packageName, name: migrationName })));
            })));
            return migrations.flat();
        });
    }
    _updatePackageJson(targetPackage, target) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let targetVersion = target.version;
            if (this.to[targetPackage]) {
                targetVersion = this.to[targetPackage];
            }
            if (!this.versions(targetPackage)) {
                return {
                    [targetPackage]: {
                        version: target.version,
                        addToPackageJson: target.addToPackageJson || false,
                    },
                };
            }
            let migrationsJson;
            try {
                migrationsJson = yield this.fetch(targetPackage, targetVersion);
                targetVersion = migrationsJson.version;
                this.collectedVersions[targetPackage] = targetVersion;
            }
            catch (e) {
                if ((_a = e === null || e === void 0 ? void 0 : e.message) === null || _a === void 0 ? void 0 : _a.includes('No matching version')) {
                    throw new Error(`${e.message}\nRun migrate with --to="package1@version1,package2@version2"`);
                }
                else {
                    throw e;
                }
            }
            const packages = this.collapsePackages(targetPackage, targetVersion, migrationsJson);
            const childPackageMigrations = yield Promise.all(Object.keys(packages)
                .filter((packageName) => !this.collectedVersions[packageName] ||
                this.gt(packages[packageName].version, this.collectedVersions[packageName]))
                .map((packageName) => this._updatePackageJson(packageName, packages[packageName])));
            return childPackageMigrations.reduce((migrations, childMigrations) => {
                for (const migrationName of Object.keys(childMigrations)) {
                    if (!migrations[migrationName] ||
                        this.gt(childMigrations[migrationName].version, migrations[migrationName].version)) {
                        migrations[migrationName] = childMigrations[migrationName];
                    }
                }
                return migrations;
            }, {
                [targetPackage]: {
                    version: migrationsJson.version,
                    addToPackageJson: target.addToPackageJson || false,
                },
            });
        });
    }
    collapsePackages(packageName, targetVersion, migration) {
        // this should be used to know what version to include
        // we should use from everywhere we use versions
        var _a;
        // Support Migrating to older versions of Nx
        // Use the packageGroup of the latest version of Nx instead of the one from the target version which could be older.
        if (packageName === '@nrwl/workspace' &&
            (0, semver_1.lt)(targetVersion, '14.0.0-beta.0')) {
            migration.packageGroup = {
                '@nrwl/workspace': targetVersion,
                '@nrwl/angular': targetVersion,
                '@nrwl/cypress': targetVersion,
                '@nrwl/devkit': targetVersion,
                '@nrwl/eslint-plugin-nx': targetVersion,
                '@nrwl/express': targetVersion,
                '@nrwl/jest': targetVersion,
                '@nrwl/linter': targetVersion,
                '@nrwl/nest': targetVersion,
                '@nrwl/next': targetVersion,
                '@nrwl/node': targetVersion,
                '@nrwl/nx-plugin': targetVersion,
                '@nrwl/react': targetVersion,
                '@nrwl/storybook': targetVersion,
                '@nrwl/web': targetVersion,
                '@nrwl/js': targetVersion,
                '@nrwl/cli': targetVersion,
                '@nrwl/nx-cloud': 'latest',
                '@nrwl/react-native': targetVersion,
                '@nrwl/detox': targetVersion,
                '@nrwl/expo': targetVersion,
            };
        }
        if (migration.packageGroup) {
            (_a = migration.packageJsonUpdates) !== null && _a !== void 0 ? _a : (migration.packageJsonUpdates = {});
            const packageGroup = normalizePackageGroup(migration.packageGroup);
            migration.packageJsonUpdates[targetVersion + '--PackageGroup'] = {
                version: targetVersion,
                packages: packageGroup.reduce((acc, packageConfig) => {
                    const { package: pkg, version } = typeof packageConfig === 'string'
                        ? { package: packageConfig, version: targetVersion }
                        : packageConfig;
                    return Object.assign(Object.assign({}, acc), { [pkg]: {
                            version,
                            alwaysAddToPackageJson: false,
                        } });
                }, {}),
            };
        }
        if (!migration.packageJsonUpdates || !this.versions(packageName))
            return {};
        return Object.values(migration.packageJsonUpdates)
            .filter(({ version, packages }) => {
            return (packages &&
                this.gt(version, this.versions(packageName)) &&
                this.lte(version, targetVersion));
        })
            .map(({ packages }) => {
            const { dependencies, devDependencies } = this.packageJson;
            return Object.entries(packages)
                .filter(([packageName, packageUpdate]) => {
                return ((!packageUpdate.ifPackageInstalled ||
                    this.versions(packageUpdate.ifPackageInstalled)) &&
                    (packageUpdate.alwaysAddToPackageJson ||
                        packageUpdate.addToPackageJson ||
                        !!(dependencies === null || dependencies === void 0 ? void 0 : dependencies[packageName]) ||
                        !!(devDependencies === null || devDependencies === void 0 ? void 0 : devDependencies[packageName])));
            })
                .reduce((acc, [packageName, packageUpdate]) => (Object.assign(Object.assign({}, acc), { [packageName]: {
                    version: packageUpdate.version,
                    addToPackageJson: packageUpdate.alwaysAddToPackageJson
                        ? 'dependencies'
                        : packageUpdate.addToPackageJson || false,
                } })), {});
        })
            .reduce((m, c) => (Object.assign(Object.assign({}, m), c)), {});
    }
    gt(v1, v2) {
        return (0, semver_1.gt)(normalizeVersion(v1), normalizeVersion(v2));
    }
    lte(v1, v2) {
        return (0, semver_1.lte)(normalizeVersion(v1), normalizeVersion(v2));
    }
}
exports.Migrator = Migrator;
function normalizePackageGroup(packageGroup) {
    if (!Array.isArray(packageGroup)) {
        return Object.entries(packageGroup).map(([pkg, version]) => ({
            package: pkg,
            version,
        }));
    }
    return packageGroup;
}
function normalizeVersionWithTagCheck(version) {
    if (version === 'latest' || version === 'next')
        return version;
    return normalizeVersion(version);
}
function versionOverrides(overrides, param) {
    const res = {};
    overrides.split(',').forEach((p) => {
        const split = p.lastIndexOf('@');
        if (split === -1 || split === 0) {
            throw new Error(`Incorrect '${param}' section. Use --${param}="package@version"`);
        }
        const selectedPackage = p.substring(0, split).trim();
        const selectedVersion = p.substring(split + 1).trim();
        if (!selectedPackage || !selectedVersion) {
            throw new Error(`Incorrect '${param}' section. Use --${param}="package@version"`);
        }
        res[normalizeSlashes(selectedPackage)] =
            normalizeVersionWithTagCheck(selectedVersion);
    });
    return res;
}
function parseTargetPackageAndVersion(args) {
    if (!args) {
        throw new Error(`Provide the correct package name and version. E.g., my-package@9.0.0.`);
    }
    if (args.indexOf('@') > -1) {
        const i = args.lastIndexOf('@');
        if (i === 0) {
            const targetPackage = args.trim();
            const targetVersion = 'latest';
            return { targetPackage, targetVersion };
        }
        else {
            const targetPackage = args.substring(0, i);
            const maybeVersion = args.substring(i + 1);
            if (!targetPackage || !maybeVersion) {
                throw new Error(`Provide the correct package name and version. E.g., my-package@9.0.0.`);
            }
            const targetVersion = normalizeVersionWithTagCheck(maybeVersion);
            return { targetPackage, targetVersion };
        }
    }
    else {
        if (args === 'latest' ||
            args === 'next' ||
            (0, semver_1.valid)(args) ||
            args.match(/^\d+(?:\.\d+)?(?:\.\d+)?$/)) {
            const targetVersion = normalizeVersionWithTagCheck(args);
            const targetPackage = !['latest', 'next'].includes(args) && (0, semver_1.lt)(targetVersion, '14.0.0-beta.0')
                ? '@nrwl/workspace'
                : 'nx';
            return {
                targetPackage,
                targetVersion,
            };
        }
        else {
            return {
                targetPackage: args,
                targetVersion: 'latest',
            };
        }
    }
}
function parseMigrationsOptions(options) {
    if (options.runMigrations === '') {
        options.runMigrations = 'migrations.json';
    }
    if (!options.runMigrations) {
        const from = options.from
            ? versionOverrides(options.from, 'from')
            : {};
        const to = options.to ? versionOverrides(options.to, 'to') : {};
        const { targetPackage, targetVersion } = parseTargetPackageAndVersion(options['packageAndVersion']);
        return {
            type: 'generateMigrations',
            targetPackage: normalizeSlashes(targetPackage),
            targetVersion,
            from,
            to,
        };
    }
    else {
        return {
            type: 'runMigrations',
            runMigrations: options.runMigrations,
        };
    }
}
exports.parseMigrationsOptions = parseMigrationsOptions;
function versions(root, from) {
    const cache = {};
    function getFromVersion(packageName) {
        try {
            if (from[packageName]) {
                return from[packageName];
            }
            if (!cache[packageName]) {
                const { packageJson } = (0, package_json_1.readModulePackageJson)(packageName, [root]);
                cache[packageName] = packageJson.version;
            }
            return cache[packageName];
        }
        catch (_a) {
            // Support migrating old workspaces without nx package
            if (packageName === 'nx') {
                return getFromVersion('@nrwl/workspace');
            }
            return null;
        }
    }
    return getFromVersion;
}
// testing-fetch-start
function createFetcher() {
    const migrationsCache = {};
    const resolvedVersionCache = {};
    function fetchMigrations(packageName, packageVersion, setCache) {
        const cacheKey = packageName + '-' + packageVersion;
        return Promise.resolve(resolvedVersionCache[cacheKey])
            .then((cachedResolvedVersion) => {
            if (cachedResolvedVersion) {
                return cachedResolvedVersion;
            }
            resolvedVersionCache[cacheKey] = (0, package_manager_1.resolvePackageVersionUsingRegistry)(packageName, packageVersion);
            return resolvedVersionCache[cacheKey];
        })
            .then((resolvedVersion) => {
            if (resolvedVersion !== packageVersion &&
                migrationsCache[`${packageName}-${resolvedVersion}`]) {
                return migrationsCache[`${packageName}-${resolvedVersion}`];
            }
            setCache(packageName, resolvedVersion);
            return getPackageMigrationsUsingRegistry(packageName, resolvedVersion);
        })
            .catch(() => {
            logger_1.logger.info(`Fetching ${packageName}@${packageVersion}`);
            return getPackageMigrationsUsingInstall(packageName, packageVersion);
        });
    }
    return function nxMigrateFetcher(packageName, packageVersion) {
        if (migrationsCache[`${packageName}-${packageVersion}`]) {
            return migrationsCache[`${packageName}-${packageVersion}`];
        }
        let resolvedVersion = packageVersion;
        let migrations;
        function setCache(packageName, packageVersion) {
            migrationsCache[packageName + '-' + packageVersion] = migrations;
        }
        migrations = fetchMigrations(packageName, packageVersion, setCache).then((result) => {
            if (result.schematics) {
                result.generators = result.schematics;
                delete result.schematics;
            }
            resolvedVersion = result.version;
            return result;
        });
        setCache(packageName, packageVersion);
        return migrations;
    };
}
// testing-fetch-end
function getPackageMigrationsUsingRegistry(packageName, packageVersion) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // check if there are migrations in the packages by looking at the
        // registry directly
        const migrationsConfig = yield getPackageMigrationsConfigFromRegistry(packageName, packageVersion);
        if (!migrationsConfig) {
            return {
                version: packageVersion,
            };
        }
        if (!migrationsConfig.migrations) {
            return {
                version: packageVersion,
                packageGroup: migrationsConfig.packageGroup,
            };
        }
        logger_1.logger.info(`Fetching ${packageName}@${packageVersion}`);
        // try to obtain the migrations from the registry directly
        return yield downloadPackageMigrationsFromRegistry(packageName, packageVersion, migrationsConfig);
    });
}
function getPackageMigrationsConfigFromRegistry(packageName, packageVersion) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = yield (0, package_manager_1.packageRegistryView)(packageName, packageVersion, 'nx-migrations ng-update --json');
        if (!result) {
            return null;
        }
        return (0, package_json_1.readNxMigrateConfig)(JSON.parse(result));
    });
}
function downloadPackageMigrationsFromRegistry(packageName, packageVersion, { migrations: migrationsFilePath, packageGroup }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { dir, cleanup } = (0, package_manager_1.createTempNpmDirectory)();
        let result;
        try {
            const { tarballPath } = yield (0, package_manager_1.packageRegistryPack)(dir, packageName, packageVersion);
            const migrations = yield (0, fileutils_1.extractFileFromTarball)((0, path_1.join)(dir, tarballPath), (0, path_1.join)('package', migrationsFilePath), (0, path_1.join)(dir, migrationsFilePath)).then((path) => (0, fileutils_1.readJsonFile)(path));
            result = Object.assign(Object.assign({}, migrations), { packageGroup, version: packageVersion });
        }
        catch (_a) {
            throw new Error(`Failed to find migrations file "${migrationsFilePath}" in package "${packageName}@${packageVersion}".`);
        }
        finally {
            yield cleanup();
        }
        return result;
    });
}
function getPackageMigrationsUsingInstall(packageName, packageVersion) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { dir, cleanup } = (0, package_manager_1.createTempNpmDirectory)();
        let result;
        try {
            const pmc = (0, package_manager_1.getPackageManagerCommand)((0, package_manager_1.detectPackageManager)(dir));
            yield execAsync(`${pmc.add} ${packageName}@${packageVersion}`, {
                cwd: dir,
            });
            const { migrations: migrationsFilePath, packageGroup, packageJson, } = readPackageMigrationConfig(packageName, dir);
            let migrations = undefined;
            if (migrationsFilePath) {
                migrations = (0, fileutils_1.readJsonFile)(migrationsFilePath);
            }
            result = Object.assign(Object.assign({}, migrations), { packageGroup, version: packageJson.version });
        }
        finally {
            yield cleanup();
        }
        return result;
    });
}
function readPackageMigrationConfig(packageName, dir) {
    const { path: packageJsonPath, packageJson: json } = (0, package_json_1.readModulePackageJson)(packageName, [dir]);
    const migrationConfigOrFile = json['nx-migrations'] || json['ng-update'];
    if (!migrationConfigOrFile) {
        return { packageJson: json, migrations: null, packageGroup: [] };
    }
    const migrationsConfig = typeof migrationConfigOrFile === 'string'
        ? {
            migrations: migrationConfigOrFile,
            packageGroup: [],
        }
        : migrationConfigOrFile;
    try {
        const migrationFile = require.resolve(migrationsConfig.migrations, {
            paths: [(0, path_1.dirname)(packageJsonPath)],
        });
        return {
            packageJson: json,
            migrations: migrationFile,
            packageGroup: migrationsConfig.packageGroup,
        };
    }
    catch (_a) {
        return {
            packageJson: json,
            migrations: null,
            packageGroup: migrationsConfig.packageGroup,
        };
    }
}
function createMigrationsFile(root, migrations) {
    (0, fileutils_1.writeJsonFile)((0, path_1.join)(root, 'migrations.json'), { migrations });
}
function updatePackageJson(root, updatedPackages) {
    const packageJsonPath = (0, path_1.join)(root, 'package.json');
    const parseOptions = {};
    const json = (0, fileutils_1.readJsonFile)(packageJsonPath, parseOptions);
    Object.keys(updatedPackages).forEach((p) => {
        var _a, _b, _c;
        if ((_a = json.devDependencies) === null || _a === void 0 ? void 0 : _a[p]) {
            json.devDependencies[p] = updatedPackages[p].version;
            return;
        }
        if ((_b = json.dependencies) === null || _b === void 0 ? void 0 : _b[p]) {
            json.dependencies[p] = updatedPackages[p].version;
            return;
        }
        const dependencyType = updatedPackages[p].addToPackageJson;
        if (typeof dependencyType === 'string') {
            (_c = json[dependencyType]) !== null && _c !== void 0 ? _c : (json[dependencyType] = {});
            json[dependencyType][p] = updatedPackages[p].version;
        }
    });
    (0, fileutils_1.writeJsonFile)(packageJsonPath, json, {
        appendNewLine: parseOptions.endsWithNewline,
    });
}
function isMigratingToNewMajor(from, to) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        from = normalizeVersion(from);
        to = ['latest', 'next'].includes(to) ? to : normalizeVersion(to);
        if (!(0, semver_1.valid)(from)) {
            from = yield (0, package_manager_1.resolvePackageVersionUsingRegistry)('nx', from);
        }
        if (!(0, semver_1.valid)(to)) {
            to = yield (0, package_manager_1.resolvePackageVersionUsingRegistry)('nx', to);
        }
        return (0, semver_1.major)(from) < (0, semver_1.major)(to);
    });
}
function readNxVersion(packageJson) {
    var _a, _b, _c, _d, _e, _f, _g;
    return ((_f = (_d = (_b = (_a = packageJson === null || packageJson === void 0 ? void 0 : packageJson.devDependencies) === null || _a === void 0 ? void 0 : _a['nx']) !== null && _b !== void 0 ? _b : (_c = packageJson === null || packageJson === void 0 ? void 0 : packageJson.dependencies) === null || _c === void 0 ? void 0 : _c['nx']) !== null && _d !== void 0 ? _d : (_e = packageJson === null || packageJson === void 0 ? void 0 : packageJson.devDependencies) === null || _e === void 0 ? void 0 : _e['@nrwl/workspace']) !== null && _f !== void 0 ? _f : (_g = packageJson === null || packageJson === void 0 ? void 0 : packageJson.dependencies) === null || _g === void 0 ? void 0 : _g['@nrwl/workspace']);
}
function generateMigrationsJsonAndUpdatePackageJson(root, opts) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const pmc = (0, package_manager_1.getPackageManagerCommand)();
        try {
            let originalPackageJson = (0, fileutils_1.readJsonFile)((0, path_1.join)(root, 'package.json'));
            try {
                if (['nx', '@nrwl/workspace'].includes(opts.targetPackage) &&
                    (yield isMigratingToNewMajor(readNxVersion(originalPackageJson), opts.targetVersion))) {
                    const useCloud = yield (0, connect_1.connectToNxCloudCommand)(ab_testing_1.messages.getPromptMessage('nxCloudMigration'));
                    yield (0, ab_testing_1.recordStat)({
                        command: 'migrate',
                        nxVersion: versions_1.nxVersion,
                        useCloud,
                        meta: ab_testing_1.messages.codeOfSelectedPromptMessage('nxCloudMigration'),
                    });
                    originalPackageJson = (0, fileutils_1.readJsonFile)((0, path_1.join)(root, 'package.json'));
                }
            }
            catch (_a) {
                // The above code is to remind folks when updating to a new major and not currently using Nx cloud.
                // If for some reason it fails, it shouldn't affect the overall migration process
            }
            logger_1.logger.info(`Fetching meta data about packages.`);
            logger_1.logger.info(`It may take a few minutes.`);
            const migrator = new Migrator({
                packageJson: originalPackageJson,
                versions: versions(root, opts.from),
                fetch: createFetcher(),
                to: opts.to,
            });
            const { migrations, packageJson } = yield migrator.updatePackageJson(opts.targetPackage, opts.targetVersion);
            updatePackageJson(root, packageJson);
            if (migrations.length > 0) {
                createMigrationsFile(root, migrations);
            }
            output_1.output.success({
                title: `The migrate command has run successfully.`,
                bodyLines: [
                    `- Package.json has been updated.`,
                    migrations.length > 0
                        ? `- Migrations.json has been generated.`
                        : `- There are no migrations to run, so migrations.json has not been created.`,
                ],
            });
            output_1.output.log({
                title: 'Next steps:',
                bodyLines: [
                    `- Make sure package.json changes make sense and then run '${pmc.install}',`,
                    ...(migrations.length > 0
                        ? [`- Run '${pmc.exec} nx migrate --run-migrations'`]
                        : []),
                    `- To learn more go to https://nx.dev/core-features/automate-updating-dependencies`,
                    ...(showConnectToCloudMessage()
                        ? [
                            `- You may run '${pmc.run('nx', 'connect-to-nx-cloud')}' to get faster builds, GitHub integration, and more. Check out https://nx.app`,
                        ]
                        : []),
                ],
            });
        }
        catch (e) {
            output_1.output.error({
                title: `The migrate command failed.`,
            });
            throw e;
        }
    });
}
function showConnectToCloudMessage() {
    try {
        const nxJson = (0, fileutils_1.readJsonFile)('nx.json');
        const defaultRunnerIsUsed = !nxJson.tasksRunnerOptions ||
            Object.values(nxJson.tasksRunnerOptions).find((r) => r.runner == '@nrwl/workspace/tasks-runners/default' ||
                r.runner == 'nx/tasks-runners/default');
        return !!defaultRunnerIsUsed;
    }
    catch (_a) {
        return false;
    }
}
function runInstall() {
    const pmCommands = (0, package_manager_1.getPackageManagerCommand)();
    output_1.output.log({
        title: `Running '${pmCommands.install}' to make sure necessary packages are installed`,
    });
    (0, child_process_1.execSync)(pmCommands.install, { stdio: [0, 1, 2] });
}
function executeMigrations(root, migrations, isVerbose, shouldCreateCommits, commitPrefix) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const depsBeforeMigrations = getStringifiedPackageJsonDeps(root);
        const migrationsWithNoChanges = [];
        let ngCliAdapter;
        if (migrations.some((m) => m.cli !== 'nx')) {
            ngCliAdapter = yield Promise.resolve().then(() => require('../adapter/ngcli-adapter'));
            require('../adapter/compat');
        }
        for (const m of migrations) {
            try {
                if (m.cli === 'nx') {
                    const changes = yield runNxMigration(root, m.package, m.name);
                    if (changes.length < 1) {
                        migrationsWithNoChanges.push(m);
                        // If no changes are made, continue on without printing anything
                        continue;
                    }
                    logger_1.logger.info(`Ran ${m.name} from ${m.package}`);
                    logger_1.logger.info(`  ${m.description}\n`);
                    (0, tree_1.printChanges)(changes, '  ');
                }
                else {
                    const { madeChanges, loggingQueue } = yield ngCliAdapter.runMigration(root, m.package, m.name, isVerbose);
                    if (!madeChanges) {
                        migrationsWithNoChanges.push(m);
                        // If no changes are made, continue on without printing anything
                        continue;
                    }
                    logger_1.logger.info(`Ran ${m.name} from ${m.package}`);
                    logger_1.logger.info(`  ${m.description}\n`);
                    loggingQueue.forEach((log) => logger_1.logger.info('  ' + log));
                }
                if (shouldCreateCommits) {
                    const commitMessage = `${commitPrefix}${m.name}`;
                    try {
                        const committedSha = commitChanges(commitMessage);
                        if (committedSha) {
                            logger_1.logger.info(chalk.dim(`- Commit created for changes: ${committedSha}`));
                        }
                        else {
                            logger_1.logger.info(chalk.red(`- A commit could not be created/retrieved for an unknown reason`));
                        }
                    }
                    catch (e) {
                        logger_1.logger.info(chalk.red(`- ${e.message}`));
                    }
                }
                logger_1.logger.info(`---------------------------------------------------------`);
            }
            catch (e) {
                output_1.output.error({
                    title: `Failed to run ${m.name} from ${m.package}. This workspace is NOT up to date!`,
                });
                throw e;
            }
        }
        const depsAfterMigrations = getStringifiedPackageJsonDeps(root);
        if (depsBeforeMigrations !== depsAfterMigrations) {
            runInstall();
        }
        return migrationsWithNoChanges;
    });
}
exports.executeMigrations = executeMigrations;
function runMigrations(root, opts, isVerbose, shouldCreateCommits = false, commitPrefix) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!process.env.NX_MIGRATE_SKIP_INSTALL) {
            runInstall();
        }
        output_1.output.log({
            title: `Running migrations from '${opts.runMigrations}'` +
                (shouldCreateCommits ? ', with each applied in a dedicated commit' : ''),
        });
        const migrations = (0, fileutils_1.readJsonFile)((0, path_1.join)(root, opts.runMigrations)).migrations;
        const migrationsWithNoChanges = yield executeMigrations(root, migrations, isVerbose, shouldCreateCommits, commitPrefix);
        if (migrationsWithNoChanges.length < migrations.length) {
            output_1.output.success({
                title: `Successfully finished running migrations from '${opts.runMigrations}'. This workspace is up to date!`,
            });
        }
        else {
            output_1.output.success({
                title: `No changes were made from running '${opts.runMigrations}'. This workspace is up to date!`,
            });
        }
    });
}
function getStringifiedPackageJsonDeps(root) {
    const { dependencies, devDependencies } = (0, fileutils_1.readJsonFile)((0, path_1.join)(root, 'package.json'));
    return JSON.stringify([dependencies, devDependencies]);
}
function commitChanges(commitMessage) {
    try {
        (0, child_process_1.execSync)('git add -A', { encoding: 'utf8', stdio: 'pipe' });
        (0, child_process_1.execSync)('git commit --no-verify -F -', {
            encoding: 'utf8',
            stdio: 'pipe',
            input: commitMessage,
        });
    }
    catch (err) {
        throw new Error(`Error committing changes:\n${err.stderr}`);
    }
    return getLatestCommitSha();
}
function getLatestCommitSha() {
    try {
        return (0, child_process_1.execSync)('git rev-parse HEAD', {
            encoding: 'utf8',
            stdio: 'pipe',
        }).trim();
    }
    catch (_a) {
        return null;
    }
}
function runNxMigration(root, packageName, name) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const collectionPath = readPackageMigrationConfig(packageName, root).migrations;
        const collection = (0, fileutils_1.readJsonFile)(collectionPath);
        const g = collection.generators || collection.schematics;
        if (!g[name]) {
            const source = collection.generators ? 'generators' : 'schematics';
            throw new Error(`Unable to determine implementation path for "${collectionPath}:${name}" using collection.${source}`);
        }
        const implRelativePath = g[name].implementation || g[name].factory;
        let implPath;
        try {
            implPath = require.resolve(implRelativePath, {
                paths: [(0, path_1.dirname)(collectionPath)],
            });
        }
        catch (e) {
            // workaround for a bug in node 12
            implPath = require.resolve(`${(0, path_1.dirname)(collectionPath)}/${implRelativePath}`);
        }
        const fn = require(implPath).default;
        const host = new tree_1.FsTree(root, false);
        yield fn(host, {});
        const changes = host.listChanges();
        (0, tree_1.flushChanges)(root, changes);
        return changes;
    });
}
function migrate(root, args) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (args['verbose']) {
            process.env.NX_VERBOSE_LOGGING = 'true';
        }
        return (0, params_1.handleErrors)(process.env.NX_VERBOSE_LOGGING === 'true', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const opts = parseMigrationsOptions(args);
            if (opts.type === 'generateMigrations') {
                yield generateMigrationsJsonAndUpdatePackageJson(root, opts);
            }
            else {
                yield runMigrations(root, opts, args['verbose'], args['createCommits'], args['commitPrefix']);
            }
        }));
    });
}
exports.migrate = migrate;
//# sourceMappingURL=migrate.js.map