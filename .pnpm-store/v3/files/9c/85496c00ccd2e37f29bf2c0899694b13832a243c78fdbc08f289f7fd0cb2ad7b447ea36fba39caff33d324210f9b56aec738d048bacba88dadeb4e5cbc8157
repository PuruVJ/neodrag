"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAstroModuleLoader = void 0;
const utils_1 = require("../../utils");
const astro_sys_1 = require("./astro-sys");
const utils_2 = require("./utils");
/**
 * Caches resolved modules.
 */
class ModuleResolutionCache {
    constructor() {
        this.cache = new Map();
    }
    /**
     * Tries to get a cached module.
     */
    get(moduleName, containingFile) {
        return this.cache.get(this.getKey(moduleName, containingFile));
    }
    /**
     * Checks if has cached module.
     */
    has(moduleName, containingFile) {
        return this.cache.has(this.getKey(moduleName, containingFile));
    }
    /**
     * Caches resolved module (or undefined).
     */
    set(moduleName, containingFile, resolvedModule) {
        this.cache.set(this.getKey(moduleName, containingFile), resolvedModule);
    }
    /**
     * Deletes module from cache. Call this if a file was deleted.
     * @param resolvedModuleName full path of the module
     */
    delete(resolvedModuleName) {
        this.cache.forEach((val, key) => {
            if (val?.resolvedFileName === resolvedModuleName) {
                this.cache.delete(key);
            }
        });
    }
    /**
     * Deletes everything from cache that resolved to `undefined`
     * and which might match the path.
     */
    deleteUnresolvedResolutionsFromCache(path) {
        const fileNameWithoutEnding = (0, utils_1.getLastPartOfPath)(path).split('.').shift() || '';
        this.cache.forEach((val, key) => {
            const moduleName = key.split(':::').pop() || '';
            if (!val && moduleName.includes(fileNameWithoutEnding)) {
                this.cache.delete(key);
            }
        });
    }
    getKey(moduleName, containingFile) {
        return containingFile + ':::' + (0, utils_2.ensureRealFilePath)(moduleName);
    }
}
class ImpliedNodeFormatResolver {
    constructor(ts) {
        this.ts = ts;
        this.alreadyResolved = new Map();
    }
    resolve(importPath, importIdxInFile, sourceFile, compilerOptions) {
        // For Astro & Framework imports, we have to fallback to the old resolution algorithm or it doesn't work
        if ((0, utils_2.isAstroFilePath)(importPath) || (0, utils_2.isFrameworkFilePath)(importPath)) {
            return undefined;
        }
        let mode = undefined;
        if (sourceFile) {
            if (!sourceFile.impliedNodeFormat &&
                ((0, utils_2.isAstroFilePath)(sourceFile.fileName) || (0, utils_2.isFrameworkFilePath)(sourceFile.fileName))) {
                // impliedNodeFormat is not set for non-TS files, because the TS function which calculates this works with a
                // fixed set of extensions that does not include frameworks files
                if (!this.alreadyResolved.has(sourceFile.fileName)) {
                    sourceFile.impliedNodeFormat = this.ts.getImpliedNodeFormatForFile((0, utils_2.toVirtualFilePath)(sourceFile.fileName), undefined, this.ts.sys, compilerOptions);
                    this.alreadyResolved.set(sourceFile.fileName, sourceFile.impliedNodeFormat);
                }
                else {
                    sourceFile.impliedNodeFormat = this.alreadyResolved.get(sourceFile.fileName);
                }
            }
            mode = this.ts.getModeForResolutionAtIndex(sourceFile, importIdxInFile);
        }
        return mode;
    }
}
/**
 * Creates a module loader specifically for `.astro` and other frameworks files.
 *
 * The typescript language service tries to look up other files that are referenced in the currently open astro file.
 * For `.ts`/`.js` files this works, for `.astro` and frameworks files it does not by default.
 * Reason: The typescript language service does not know about those file endings,
 * so it assumes it's a normal typescript file and searches for files like `../Component.astro.ts`, which is wrong.
 * In order to fix this, we need to wrap typescript's module resolution and reroute all `.astro.ts` file lookups to .astro.
 *
 * @param getSnapshot A function which returns a (in case of astro file fully preprocessed) typescript/javascript snapshot
 * @param compilerOptions The typescript compiler options
 */
function createAstroModuleLoader(getSnapshot, compilerOptions, ts) {
    const astroSys = (0, astro_sys_1.createAstroSys)(getSnapshot, ts);
    const moduleCache = new ModuleResolutionCache();
    const impliedNodeFormatResolver = new ImpliedNodeFormatResolver(ts);
    return {
        fileExists: astroSys.fileExists,
        readFile: astroSys.readFile,
        readDirectory: astroSys.readDirectory,
        deleteFromModuleCache: (path) => {
            astroSys.deleteFromCache(path);
            moduleCache.delete(path);
        },
        deleteUnresolvedResolutionsFromCache: (path) => {
            astroSys.deleteFromCache(path);
            moduleCache.deleteUnresolvedResolutionsFromCache(path);
        },
        resolveModuleNames,
    };
    function resolveModuleNames(moduleNames, containingFile, _reusedNames, _redirectedReference, _options, containingSourceFile) {
        return moduleNames.map((moduleName, index) => {
            if (moduleCache.has(moduleName, containingFile)) {
                return moduleCache.get(moduleName, containingFile);
            }
            const resolvedModule = resolveModuleName(moduleName, containingFile, containingSourceFile, index);
            moduleCache.set(moduleName, containingFile, resolvedModule);
            return resolvedModule;
        });
    }
    function resolveModuleName(name, containingFile, containingSourceFile, index) {
        const mode = impliedNodeFormatResolver.resolve(name, index, containingSourceFile, compilerOptions);
        // Delegate to the TS resolver first.
        // If that does not bring up anything, try the Astro Module loader
        // which is able to deal with .astro and other frameworks files.
        const tsResolvedModule = ts.resolveModuleName(name, containingFile, compilerOptions, ts.sys, undefined, undefined, mode).resolvedModule;
        if (tsResolvedModule && !(0, utils_2.isVirtualFilePath)(tsResolvedModule.resolvedFileName)) {
            return tsResolvedModule;
        }
        const astroResolvedModule = ts.resolveModuleName(name, containingFile, compilerOptions, astroSys, undefined, undefined, mode).resolvedModule;
        if (!astroResolvedModule || !(0, utils_2.isVirtualFilePath)(astroResolvedModule.resolvedFileName)) {
            return astroResolvedModule;
        }
        const resolvedFileName = (0, utils_2.ensureRealFilePath)(astroResolvedModule.resolvedFileName);
        const snapshot = getSnapshot(resolvedFileName);
        const resolvedAstroModule = {
            extension: (0, utils_2.getExtensionFromScriptKind)(snapshot && snapshot.scriptKind, ts),
            resolvedFileName,
            isExternalLibraryImport: astroResolvedModule.isExternalLibraryImport,
        };
        return resolvedAstroModule;
    }
}
exports.createAstroModuleLoader = createAstroModuleLoader;
