"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLanguageServiceForTsconfig = exports.forAllLanguageServices = exports.getLanguageService = void 0;
const path_1 = require("path");
const utils_1 = require("../../utils");
const module_loader_1 = require("./module-loader");
const DocumentSnapshot_1 = require("./snapshots/DocumentSnapshot");
const SnapshotManager_1 = require("./snapshots/SnapshotManager");
const DocumentSnapshotUtils = __importStar(require("./snapshots/utils"));
const utils_2 = require("./utils");
const services = new Map();
async function getLanguageService(path, workspaceUris, docContext) {
    const tsconfigPath = (0, utils_2.findTsConfigPath)(path, workspaceUris, docContext.ts);
    return getLanguageServiceForTsconfig(tsconfigPath, docContext, workspaceUris);
}
exports.getLanguageService = getLanguageService;
async function forAllLanguageServices(cb) {
    for (const service of services.values()) {
        cb(await service);
    }
}
exports.forAllLanguageServices = forAllLanguageServices;
/**
 * @param tsconfigPath has to be absolute
 * @param docContext
 */
async function getLanguageServiceForTsconfig(tsconfigPath, docContext, workspaceUris) {
    let service;
    if (docContext.configManager.shouldRefreshTSServices) {
        services.clear();
        docContext.configManager.shouldRefreshTSServices = false;
    }
    if (services.has(tsconfigPath)) {
        service = await services.get(tsconfigPath);
    }
    else {
        const newService = createLanguageService(tsconfigPath, docContext, workspaceUris);
        services.set(tsconfigPath, newService);
        service = await newService;
    }
    return service;
}
exports.getLanguageServiceForTsconfig = getLanguageServiceForTsconfig;
async function createLanguageService(tsconfigPath, docContext, workspaceUris) {
    const tsconfigRoot = tsconfigPath ? (0, path_1.dirname)(tsconfigPath) : process.cwd();
    const workspacePaths = workspaceUris.map((uri) => (0, utils_1.urlToPath)(uri));
    const workspacePath = workspacePaths.find((uri) => tsconfigRoot.startsWith(uri)) || workspacePaths[0];
    const astroInstall = (0, utils_1.getAstroInstall)([tsconfigRoot, workspacePath]);
    const config = (await docContext.configManager.getConfig('astro.typescript', workspacePath)) ?? {};
    const allowArbitraryAttrs = config.allowArbitraryAttributes ?? false;
    // `raw` here represent the tsconfig merged with any extended config
    const { compilerOptions, fileNames: files, raw: fullConfig } = getParsedTSConfig();
    let projectVersion = 0;
    const snapshotManager = new SnapshotManager_1.SnapshotManager(docContext.globalSnapshotManager, files, fullConfig, tsconfigRoot || process.cwd(), docContext.ts);
    const astroModuleLoader = (0, module_loader_1.createAstroModuleLoader)(getScriptSnapshot, compilerOptions, docContext.ts);
    const scriptFileNames = [];
    if (astroInstall) {
        scriptFileNames.push(...['./env.d.ts', './astro-jsx.d.ts'].map((f) => docContext.ts.sys.resolvePath((0, path_1.resolve)(astroInstall.path, f))));
    }
    let languageServerDirectory;
    try {
        languageServerDirectory = (0, path_1.dirname)(require.resolve('@astrojs/language-server'));
    }
    catch (e) {
        languageServerDirectory = __dirname;
    }
    // Fallback to internal types when Astro is not installed or the Astro version is too old
    if (!astroInstall ||
        ((astroInstall.version.major === 0 || astroInstall.version.full === '1.0.0-beta.0') &&
            !astroInstall.version.full.startsWith('0.0.0-rc-')) // 1.0.0's RC is considered to be 0.0.0, so we have to check for it
    ) {
        scriptFileNames.push(...['../types/astro-jsx.d.ts', '../types/env.d.ts'].map((f) => docContext.ts.sys.resolvePath((0, path_1.resolve)(languageServerDirectory, f))));
        console.warn("Couldn't load types from Astro, using internal types instead");
    }
    if (allowArbitraryAttrs) {
        const arbitraryAttrsDTS = docContext.ts.sys.resolvePath((0, path_1.resolve)(languageServerDirectory, '../types/arbitrary-attrs.d.ts'));
        scriptFileNames.push(arbitraryAttrsDTS);
    }
    const host = {
        getNewLine: () => docContext.ts.sys.newLine,
        useCaseSensitiveFileNames: () => docContext.ts.sys.useCaseSensitiveFileNames,
        getDirectories: docContext.ts.sys.getDirectories,
        resolveModuleNames: astroModuleLoader.resolveModuleNames,
        readFile: astroModuleLoader.readFile,
        fileExists: astroModuleLoader.fileExists,
        readDirectory: astroModuleLoader.readDirectory,
        getCompilationSettings: () => compilerOptions,
        getCurrentDirectory: () => tsconfigRoot,
        getDefaultLibFileName: docContext.ts.getDefaultLibFilePath,
        getProjectVersion: () => projectVersion.toString(),
        getScriptFileNames: () => Array.from(new Set([...snapshotManager.getProjectFileNames(), ...snapshotManager.getFileNames(), ...scriptFileNames])),
        getScriptSnapshot,
        getScriptKind: (fileName) => getScriptSnapshot(fileName).scriptKind,
        getScriptVersion: (fileName) => getScriptSnapshot(fileName).version.toString(),
    };
    if (docContext.tsLocalized) {
        host.getLocalizedDiagnosticMessages = () => docContext.tsLocalized;
    }
    let languageService = docContext.ts.createLanguageService(host);
    docContext.globalSnapshotManager.onChange(() => {
        projectVersion++;
    });
    return {
        tsconfigPath,
        compilerOptions,
        getService: () => languageService,
        updateSnapshot,
        deleteSnapshot,
        updateProjectFiles,
        updateNonAstroFile,
        hasFile,
        fileBelongsToProject,
        snapshotManager,
    };
    function deleteSnapshot(filePath) {
        astroModuleLoader.deleteFromModuleCache(filePath);
        snapshotManager.delete(filePath);
    }
    function updateSnapshot(documentOrFilePath) {
        return typeof documentOrFilePath === 'string'
            ? updateSnapshotFromFilePath(documentOrFilePath)
            : updateSnapshotFromDocument(documentOrFilePath);
    }
    function updateSnapshotFromDocument(document) {
        const filePath = document.getFilePath() || '';
        const prevSnapshot = snapshotManager.get(filePath);
        if (prevSnapshot?.version === document.version) {
            return prevSnapshot;
        }
        if (!prevSnapshot) {
            astroModuleLoader.deleteUnresolvedResolutionsFromCache(filePath);
        }
        const newSnapshot = DocumentSnapshotUtils.createFromDocument(document, docContext.ts);
        snapshotManager.set(filePath, newSnapshot);
        const scriptTagSnapshots = createScriptTagsSnapshots(filePath, document);
        scriptTagSnapshots.forEach((snapshot) => {
            snapshotManager.set(snapshot.filePath, snapshot);
            newSnapshot.scriptTagSnapshots?.push(snapshot);
        });
        if (prevSnapshot && prevSnapshot.scriptKind !== newSnapshot.scriptKind) {
            // Restart language service as it doesn't handle script kind changes.
            languageService.dispose();
            languageService = docContext.ts.createLanguageService(host);
        }
        return newSnapshot;
    }
    function updateSnapshotFromFilePath(filePath) {
        const prevSnapshot = snapshotManager.get(filePath);
        if (prevSnapshot) {
            return prevSnapshot;
        }
        astroModuleLoader.deleteUnresolvedResolutionsFromCache(filePath);
        const newSnapshot = DocumentSnapshotUtils.createFromFilePath(filePath, docContext.createDocument, docContext.ts);
        snapshotManager.set(filePath, newSnapshot);
        return newSnapshot;
    }
    function getScriptSnapshot(fileName) {
        const realFileName = (0, utils_2.ensureRealFilePath)(fileName);
        let doc = snapshotManager.get(realFileName);
        if (doc) {
            if ((0, utils_2.isDocumentSymbolsPath)(fileName)) {
                return createDocumentSymbolSnapshot(doc);
            }
            return doc;
        }
        astroModuleLoader.deleteUnresolvedResolutionsFromCache(realFileName);
        doc = DocumentSnapshotUtils.createFromFilePath(realFileName, docContext.createDocument, docContext.ts);
        snapshotManager.set(realFileName, doc);
        if ((0, utils_2.isDocumentSymbolsPath)(fileName)) {
            return createDocumentSymbolSnapshot(doc);
        }
        // If we needed to create an Astro snapshot, also create its script tags snapshots
        if ((0, utils_2.isAstroFilePath)(realFileName)) {
            const document = doc.parent;
            const scriptTagSnapshots = createScriptTagsSnapshots(realFileName, document);
            scriptTagSnapshots.forEach((snapshot) => {
                snapshotManager.set(snapshot.filePath, snapshot);
                doc.scriptTagSnapshots?.push(snapshot);
            });
        }
        return doc;
    }
    function updateProjectFiles() {
        projectVersion++;
        snapshotManager.updateProjectFiles();
    }
    function hasFile(filePath) {
        return snapshotManager.has(filePath);
    }
    function fileBelongsToProject(filePath) {
        filePath = (0, utils_1.normalizePath)(filePath);
        return hasFile(filePath) || getParsedTSConfig().fileNames.includes(filePath);
    }
    function updateNonAstroFile(fileName, changes, text) {
        if (!snapshotManager.has(fileName)) {
            astroModuleLoader.deleteUnresolvedResolutionsFromCache(fileName);
        }
        snapshotManager.updateNonAstroFile(fileName, changes, text);
    }
    function createScriptTagsSnapshots(fileName, document) {
        return document.scriptTags.map((scriptTag, index) => {
            const scriptTagLanguage = (0, utils_2.getScriptTagLanguage)(scriptTag);
            const scriptFilePath = fileName + `.__script${index}.${scriptTagLanguage}`;
            const scriptSnapshot = new DocumentSnapshot_1.ScriptTagDocumentSnapshot(scriptTag, document, scriptFilePath, scriptTagLanguage === 'ts' ? docContext.ts.ScriptKind.TS : docContext.ts.ScriptKind.JS);
            return scriptSnapshot;
        });
    }
    function createDocumentSymbolSnapshot(doc) {
        return new DocumentSnapshot_1.TypeScriptDocumentSnapshot(doc.version, doc.filePath, doc.parent.getText(), docContext.ts.ScriptKind.Unknown, false);
    }
    function getParsedTSConfig() {
        let configJson = (tsconfigPath && docContext.ts.readConfigFile(tsconfigPath, docContext.ts.sys.readFile).config) || {};
        // Delete include so that .astro files don't get mistakenly excluded by the user
        delete configJson.include;
        // If the user supplied exclude, let's use theirs otherwise, use ours
        configJson.exclude ?? (configJson.exclude = getDefaultExclude());
        // Everything here will always, unconditionally, be in the resulting config
        const forcedCompilerOptions = {
            noEmit: true,
            declaration: false,
            resolveJsonModule: true,
            allowSyntheticDefaultImports: true,
            allowNonTsExtensions: true,
            allowJs: true,
            jsx: docContext.ts.JsxEmit.Preserve,
            jsxImportSource: undefined,
            jsxFactory: 'astroHTML',
            module: docContext.ts.ModuleKind.ESNext,
            target: docContext.ts.ScriptTarget.ESNext,
            isolatedModules: true,
        };
        const project = docContext.ts.parseJsonConfigFileContent(configJson, docContext.ts.sys, tsconfigRoot, forcedCompilerOptions, tsconfigPath, undefined, [
            { extension: 'vue', isMixedContent: true, scriptKind: docContext.ts.ScriptKind.Deferred },
            { extension: 'svelte', isMixedContent: true, scriptKind: docContext.ts.ScriptKind.Deferred },
            { extension: 'astro', isMixedContent: true, scriptKind: docContext.ts.ScriptKind.Deferred },
        ]);
        const resultOptions = {
            ...project.options,
            ...forcedCompilerOptions,
        };
        if (!resultOptions.moduleResolution ||
            resultOptions.moduleResolution === docContext.ts.ModuleResolutionKind.Classic) {
            resultOptions.moduleResolution = docContext.ts.ModuleResolutionKind.NodeJs;
        }
        return {
            ...project,
            fileNames: project.fileNames.map(utils_1.normalizePath),
            compilerOptions: resultOptions,
        };
    }
}
function getDefaultExclude() {
    return ['dist', 'node_modules'];
}
