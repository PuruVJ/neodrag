Object.defineProperty(exports, "__esModule", { value: true });
exports.createLanguageContext = void 0;
const path_1 = require("path");
const documentRegistry_1 = require("./documentRegistry");
const types_1 = require("./types");
function createLanguageContext(host, languageModules) {
    for (const languageModule of languageModules.reverse()) {
        if (languageModule.proxyLanguageServiceHost) {
            const proxyApis = languageModule.proxyLanguageServiceHost(host);
            host = new Proxy(host, {
                get(target, key) {
                    if (key in proxyApis) {
                        return proxyApis[key];
                    }
                    return target[key];
                },
            });
        }
    }
    let lastProjectVersion;
    let tsProjectVersion = 0;
    const virtualFiles = (0, documentRegistry_1.createVirtualFiles)(languageModules);
    const ts = host.getTypeScriptModule();
    const scriptSnapshots = new Map();
    const sourceTsFileVersions = new Map();
    const sourceFileVersions = new Map();
    const virtualFileVersions = new Map();
    const _tsHost = {
        fileExists: host.fileExists
            ? fileName => {
                var _a;
                // .vue.js -> .vue
                // .vue.ts -> .vue
                // .vue.d.ts -> [ignored]
                const vueFileName = fileName.substring(0, fileName.lastIndexOf('.'));
                if (!virtualFiles.hasSourceFile(vueFileName)) {
                    // create virtual files
                    const scriptSnapshot = host.getScriptSnapshot(vueFileName);
                    if (scriptSnapshot) {
                        virtualFiles.update(vueFileName, scriptSnapshot);
                    }
                }
                if (virtualFiles.getSourceByVirtualFileName(fileName)) {
                    return true;
                }
                return !!((_a = host.fileExists) === null || _a === void 0 ? void 0 : _a.call(host, fileName));
            }
            : undefined,
        getProjectVersion: () => {
            return tsProjectVersion.toString();
        },
        getScriptFileNames,
        getScriptVersion,
        getScriptSnapshot,
        readDirectory: (_path, extensions, exclude, include, depth) => {
            var _a, _b;
            const result = (_b = (_a = host.readDirectory) === null || _a === void 0 ? void 0 : _a.call(host, _path, extensions, exclude, include, depth)) !== null && _b !== void 0 ? _b : [];
            for (const [fileName] of virtualFiles.all()) {
                const vuePath2 = path_1.posix.join(_path, path_1.posix.basename(fileName));
                if (path_1.posix.relative(_path.toLowerCase(), fileName.toLowerCase()).startsWith('..')) {
                    continue;
                }
                if (!depth && fileName.toLowerCase() === vuePath2.toLowerCase()) {
                    result.push(vuePath2);
                }
                else if (depth) {
                    result.push(vuePath2); // TODO: depth num
                }
            }
            return result;
        },
        getScriptKind(fileName) {
            if (virtualFiles.hasSourceFile(fileName))
                return ts.ScriptKind.Deferred;
            switch (path_1.posix.extname(fileName)) {
                case '.js': return ts.ScriptKind.JS;
                case '.jsx': return ts.ScriptKind.JSX;
                case '.ts': return ts.ScriptKind.TS;
                case '.tsx': return ts.ScriptKind.TSX;
                case '.json': return ts.ScriptKind.JSON;
                default: return ts.ScriptKind.Unknown;
            }
        },
    };
    return {
        typescript: {
            languageServiceHost: new Proxy(_tsHost, {
                get: (target, property) => {
                    update();
                    return target[property] || host[property];
                },
            }),
        },
        virtualFiles: new Proxy(virtualFiles, {
            get: (target, property) => {
                update();
                return target[property];
            },
        }),
    };
    function update() {
        var _a;
        const newProjectVersion = (_a = host.getProjectVersion) === null || _a === void 0 ? void 0 : _a.call(host);
        const shouldUpdate = newProjectVersion === undefined || newProjectVersion !== lastProjectVersion;
        lastProjectVersion = newProjectVersion;
        if (!shouldUpdate)
            return;
        let shouldUpdateTsProject = false;
        let virtualFilesUpdatedNum = 0;
        const remainRootFiles = new Set(host.getScriptFileNames());
        // .vue
        for (const [fileName] of virtualFiles.all()) {
            remainRootFiles.delete(fileName);
            const snapshot = host.getScriptSnapshot(fileName);
            if (!snapshot) {
                // delete
                virtualFiles.delete(fileName);
                shouldUpdateTsProject = true;
                continue;
            }
            const newVersion = host.getScriptVersion(fileName);
            if (sourceFileVersions.get(fileName) !== newVersion) {
                // update
                sourceFileVersions.set(fileName, newVersion);
                virtualFiles.update(fileName, snapshot);
                virtualFilesUpdatedNum++;
            }
        }
        // no any vue file version change, it mean project version was update by ts file change at this time
        if (!virtualFilesUpdatedNum) {
            shouldUpdateTsProject = true;
        }
        // add
        for (const fileName of [...remainRootFiles]) {
            const snapshot = host.getScriptSnapshot(fileName);
            if (snapshot) {
                const virtualFile = virtualFiles.update(fileName, snapshot);
                if (virtualFile) {
                    remainRootFiles.delete(fileName);
                }
            }
        }
        // .ts / .js / .d.ts / .json ...
        for (const [oldTsFileName, oldTsFileVersion] of [...sourceTsFileVersions]) {
            const newVersion = host.getScriptVersion(oldTsFileName);
            if (oldTsFileVersion !== newVersion) {
                if (!remainRootFiles.has(oldTsFileName) && !host.getScriptSnapshot(oldTsFileName)) {
                    // delete
                    sourceTsFileVersions.delete(oldTsFileName);
                }
                else {
                    // update
                    sourceTsFileVersions.set(oldTsFileName, newVersion);
                }
                shouldUpdateTsProject = true;
            }
        }
        for (const nowFileName of remainRootFiles) {
            if (!sourceTsFileVersions.has(nowFileName)) {
                // add
                const newVersion = host.getScriptVersion(nowFileName);
                sourceTsFileVersions.set(nowFileName, newVersion);
                shouldUpdateTsProject = true;
            }
        }
        for (const [_1, _2, virtualFile] of virtualFiles.all()) {
            if (!shouldUpdateTsProject) {
                (0, documentRegistry_1.forEachEmbeddedFile)(virtualFile, embedded => {
                    var _a;
                    if (embedded.kind === types_1.FileKind.TypeScriptHostFile) {
                        if (virtualFileVersions.has(embedded.fileName) && ((_a = virtualFileVersions.get(embedded.fileName)) === null || _a === void 0 ? void 0 : _a.virtualFileSnapshot) !== embedded.snapshot) {
                            shouldUpdateTsProject = true;
                        }
                    }
                });
            }
        }
        if (shouldUpdateTsProject) {
            tsProjectVersion++;
        }
    }
    function getScriptFileNames() {
        const tsFileNames = new Set();
        for (const [_1, _2, sourceFile] of virtualFiles.all()) {
            (0, documentRegistry_1.forEachEmbeddedFile)(sourceFile, embedded => {
                if (embedded.kind === types_1.FileKind.TypeScriptHostFile) {
                    tsFileNames.add(embedded.fileName); // virtual .ts
                }
            });
        }
        for (const fileName of host.getScriptFileNames()) {
            if (!virtualFiles.hasSourceFile(fileName)) {
                tsFileNames.add(fileName); // .ts
            }
        }
        return [...tsFileNames];
    }
    function getScriptVersion(fileName) {
        let source = virtualFiles.getSourceByVirtualFileName(fileName);
        if (source) {
            let version = virtualFileVersions.get(source[2].fileName);
            if (!version) {
                version = {
                    value: 0,
                    virtualFileSnapshot: source[2].snapshot,
                    sourceFileSnapshot: source[1],
                };
                virtualFileVersions.set(source[2].fileName, version);
            }
            else if (version.virtualFileSnapshot !== source[2].snapshot
                || (host.isTsc && version.sourceFileSnapshot !== source[1]) // fix https://github.com/johnsoncodehk/volar/issues/1082
            ) {
                version.value++;
                version.virtualFileSnapshot = source[2].snapshot;
                version.sourceFileSnapshot = source[1];
            }
            return version.value.toString();
        }
        return host.getScriptVersion(fileName);
    }
    function getScriptSnapshot(fileName) {
        const version = getScriptVersion(fileName);
        const cache = scriptSnapshots.get(fileName.toLowerCase());
        if (cache && cache[0] === version) {
            return cache[1];
        }
        const source = virtualFiles.getSourceByVirtualFileName(fileName);
        if (source) {
            const snapshot = source[2].snapshot;
            scriptSnapshots.set(fileName.toLowerCase(), [version, snapshot]);
            return snapshot;
        }
        let tsScript = host.getScriptSnapshot(fileName);
        if (tsScript) {
            scriptSnapshots.set(fileName.toLowerCase(), [version, tsScript]);
            return tsScript;
        }
    }
}
exports.createLanguageContext = createLanguageContext;
//# sourceMappingURL=languageContext.js.map