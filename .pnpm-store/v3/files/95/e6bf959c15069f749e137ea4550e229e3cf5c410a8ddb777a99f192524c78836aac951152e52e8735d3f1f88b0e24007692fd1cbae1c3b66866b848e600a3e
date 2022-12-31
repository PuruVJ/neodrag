"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTsConfigPaths = exports.registerTsProject = void 0;
const path_1 = require("path");
const logger_1 = require("./logger");
/**
 * Optionally, if swc-node and tsconfig-paths are available in the current workspace, apply the require
 * register hooks so that .ts files can be used for writing custom workspace projects.
 *
 * If ts-node and tsconfig-paths are not available, the user can still provide an index.js file in
 * the root of their project and the fundamentals will still work (but
 * workspace path mapping will not, for example).
 *
 * @returns cleanup function
 */
const registerTsProject = (path, configFilename = 'tsconfig.json') => {
    // Function to register transpiler that returns cleanup function
    let registerTranspiler;
    const tsConfigPath = (0, path_1.join)(path, configFilename);
    const cleanupFunctions = [registerTsConfigPaths(tsConfigPath)];
    const swcNodeInstalled = packageIsInstalled('@swc-node/register');
    if (swcNodeInstalled) {
        // These are requires to prevent it from registering when it shouldn't
        const { register } = require('@swc-node/register/register');
        const { readDefaultTsConfig, } = require('@swc-node/register/read-default-tsconfig');
        const tsConfig = readDefaultTsConfig(tsConfigPath);
        registerTranspiler = () => register(tsConfig);
    }
    else {
        // We can fall back on ts-node if its available
        const tsNodeInstalled = packageIsInstalled('ts-node/register');
        if (tsNodeInstalled) {
            const { register } = require('ts-node');
            // ts-node doesn't provide a cleanup method
            registerTranspiler = () => {
                const service = register({
                    project: tsConfigPath,
                    transpileOnly: true,
                    compilerOptions: {
                        module: 'commonjs',
                    },
                });
                // Don't warn if a faster transpiler is enabled
                if (!service.options.transpiler && !service.options.swc) {
                    warnTsNodeUsage();
                }
                return () => { };
            };
        }
    }
    if (registerTranspiler) {
        cleanupFunctions.push(registerTranspiler());
    }
    else {
        warnNoTranspiler();
    }
    // Overall cleanup method cleans up tsconfig path resolution
    // as well as ts transpiler
    return () => {
        for (const f of cleanupFunctions) {
            f();
        }
    };
};
exports.registerTsProject = registerTsProject;
/**
 * @param tsConfigPath Adds the paths from a tsconfig file into node resolutions
 * @returns cleanup function
 */
function registerTsConfigPaths(tsConfigPath) {
    try {
        /**
         * Load the ts config from the source project
         */
        const tsconfigPaths = require('tsconfig-paths');
        const tsConfigResult = tsconfigPaths.loadConfig(tsConfigPath);
        /**
         * Register the custom workspace path mappings with node so that workspace libraries
         * can be imported and used within project
         */
        if (tsConfigResult.resultType === 'success') {
            return tsconfigPaths.register({
                baseUrl: tsConfigResult.absoluteBaseUrl,
                paths: tsConfigResult.paths,
            });
        }
    }
    catch (err) {
        warnNoTsconfigPaths();
    }
    return () => { };
}
exports.registerTsConfigPaths = registerTsConfigPaths;
function warnTsNodeUsage() {
    logger_1.logger.warn((0, logger_1.stripIndent)(`${logger_1.NX_PREFIX} Falling back to ts-node for local typescript execution. This may be a little slower.
  - To fix this, ensure @swc-node/register and @swc/core have been installed`));
}
function warnNoTsconfigPaths() {
    logger_1.logger.warn((0, logger_1.stripIndent)(`${logger_1.NX_PREFIX} Unable to load tsconfig-paths, workspace libraries may be inaccessible.
  - To fix this, install tsconfig-paths with npm/yarn/pnpm`));
}
function warnNoTranspiler() {
    logger_1.logger.warn((0, logger_1.stripIndent)(`${logger_1.NX_PREFIX} Unable to locate swc-node or ts-node. Nx will be unable to run local ts files without transpiling.
  - To fix this, ensure @swc-node/register and @swc/core have been installed`));
}
function packageIsInstalled(m) {
    try {
        const p = require.resolve(m);
        return true;
    }
    catch (_a) {
        return false;
    }
}
//# sourceMappingURL=register.js.map