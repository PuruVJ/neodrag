Object.defineProperty(exports, "__esModule", { value: true });
exports.forEachEmbeddedFile = exports.createVirtualFiles = void 0;
const source_map_1 = require("@volar/source-map");
const reactivity_1 = require("@vue/reactivity");
const sourceMaps_1 = require("./sourceMaps");
function createVirtualFiles(languageModules) {
    const sourceFileToRootVirtualFileMap = (0, reactivity_1.shallowReactive)({});
    const all = (0, reactivity_1.computed)(() => Object.values(sourceFileToRootVirtualFileMap));
    const virtualFileNameToSource = (0, reactivity_1.computed)(() => {
        const map = new Map();
        for (const row of all.value) {
            forEachEmbeddedFile(row[2], file => {
                map.set(normalizePath(file.fileName), [file, row]);
            });
        }
        return map;
    });
    const virtualFileToSourceMapsMap = new WeakMap();
    const virtualFileToMirrorMap = new WeakMap();
    return {
        update(fileName, snapshot) {
            const key = normalizePath(fileName);
            if (sourceFileToRootVirtualFileMap[key]) {
                const virtualFile = sourceFileToRootVirtualFileMap[key][2];
                sourceFileToRootVirtualFileMap[key][1] = snapshot;
                sourceFileToRootVirtualFileMap[key][3].updateFile(virtualFile, snapshot);
                return virtualFile; // updated
            }
            for (const languageModule of languageModules) {
                const virtualFile = languageModule.createFile(fileName, snapshot);
                if (virtualFile) {
                    sourceFileToRootVirtualFileMap[key] = [fileName, snapshot, (0, reactivity_1.shallowReactive)(virtualFile), languageModule];
                    return virtualFile; // created
                }
            }
        },
        delete(fileName) {
            var _a, _b;
            const key = normalizePath(fileName);
            if (sourceFileToRootVirtualFileMap[key]) {
                const virtualFile = sourceFileToRootVirtualFileMap[key][2];
                (_b = (_a = sourceFileToRootVirtualFileMap[key][3]).deleteFile) === null || _b === void 0 ? void 0 : _b.call(_a, virtualFile);
                delete sourceFileToRootVirtualFileMap[key]; // deleted
            }
        },
        get(fileName) {
            const key = normalizePath(fileName);
            if (sourceFileToRootVirtualFileMap[key]) {
                return [
                    sourceFileToRootVirtualFileMap[key][1],
                    sourceFileToRootVirtualFileMap[key][2],
                ];
            }
        },
        hasSourceFile: (fileName) => !!sourceFileToRootVirtualFileMap[normalizePath(fileName)],
        all: () => all.value,
        getMirrorMap: getMirrorMap,
        getMaps: getSourceMaps,
        getSourceByVirtualFileName(fileName) {
            const source = virtualFileNameToSource.value.get(normalizePath(fileName));
            if (source) {
                return [
                    source[1][0],
                    source[1][1],
                    source[0],
                ];
            }
        },
    };
    function getSourceMaps(virtualFile) {
        let sourceMapsBySourceFileName = virtualFileToSourceMapsMap.get(virtualFile.snapshot);
        if (!sourceMapsBySourceFileName) {
            sourceMapsBySourceFileName = new Map();
            virtualFileToSourceMapsMap.set(virtualFile.snapshot, sourceMapsBySourceFileName);
        }
        const sources = new Set();
        for (const map of virtualFile.mappings) {
            sources.add(map.source);
        }
        for (const source of sources) {
            const sourceFileName = source !== null && source !== void 0 ? source : virtualFileNameToSource.value.get(normalizePath(virtualFile.fileName))[1][0];
            if (!sourceMapsBySourceFileName.has(sourceFileName)) {
                sourceMapsBySourceFileName.set(sourceFileName, [
                    sourceFileName,
                    new source_map_1.SourceMap(virtualFile.mappings.filter(mapping => mapping.source === source)),
                ]);
            }
        }
        return [...sourceMapsBySourceFileName.values()];
    }
    function getMirrorMap(file) {
        if (!virtualFileToMirrorMap.has(file.snapshot)) {
            virtualFileToMirrorMap.set(file.snapshot, file.mirrorBehaviorMappings ? new sourceMaps_1.MirrorMap(file.mirrorBehaviorMappings) : undefined);
        }
        return virtualFileToMirrorMap.get(file.snapshot);
    }
}
exports.createVirtualFiles = createVirtualFiles;
function forEachEmbeddedFile(file, cb) {
    cb(file);
    for (const embeddedFile of file.embeddedFiles) {
        forEachEmbeddedFile(embeddedFile, cb);
    }
}
exports.forEachEmbeddedFile = forEachEmbeddedFile;
function normalizePath(fileName) {
    return fileName.replace(/\\/g, '/').toLowerCase();
}
//# sourceMappingURL=documentRegistry.js.map