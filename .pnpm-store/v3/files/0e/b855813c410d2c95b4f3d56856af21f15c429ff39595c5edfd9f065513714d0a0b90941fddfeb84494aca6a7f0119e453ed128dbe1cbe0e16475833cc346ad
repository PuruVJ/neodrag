Object.defineProperty(exports, "__esModule", { value: true });
exports.createLanguageModule = void 0;
const path_1 = require("path");
const plugins_1 = require("./plugins");
const sourceFile_1 = require("./sourceFile");
const localTypes = require("./utils/localTypes");
const ts_1 = require("./utils/ts");
function createLanguageModule(ts, rootDir, compilerOptions, _vueCompilerOptions, extraPlugins = []) {
    const vueCompilerOptions = (0, ts_1.resolveVueCompilerOptions)(_vueCompilerOptions);
    const vueLanguagePlugin = (0, plugins_1.getDefaultVueLanguagePlugins)(ts, rootDir, compilerOptions, _vueCompilerOptions, extraPlugins);
    // from https://github.com/johnsoncodehk/volar/pull/1543
    if (!(ts.__VLS_pitched_resolveModuleNames)) {
        ts.__VLS_pitched_resolveModuleNames = true;
        const resolveModuleNames = ts.resolveModuleName;
        ts.resolveModuleName = (...args) => {
            if (args[6] === ts.ModuleKind.ESNext && vueCompilerOptions.extensions.some(ext => args[0].endsWith(ext))) {
                args[6] = ts.ModuleKind.CommonJS;
            }
            return resolveModuleNames(...args);
        };
    }
    const sharedTypesSnapshot = ts.ScriptSnapshot.fromString(localTypes.getTypesCode(vueCompilerOptions.target, vueCompilerOptions));
    const languageModule = {
        createFile(fileName, snapshot) {
            if (vueCompilerOptions.extensions.some(ext => fileName.endsWith(ext))) {
                return new sourceFile_1.VueFile(fileName, snapshot, ts, vueLanguagePlugin);
            }
        },
        updateFile(sourceFile, snapshot) {
            sourceFile.update(snapshot);
        },
        proxyLanguageServiceHost(host) {
            return {
                fileExists(fileName) {
                    const basename = path_1.posix.basename(fileName);
                    if (basename === localTypes.typesFileName) {
                        return true;
                    }
                    return host.fileExists(fileName);
                },
                getScriptFileNames() {
                    const fileNames = host.getScriptFileNames();
                    return [
                        ...getSharedTypesFiles(fileNames),
                        ...fileNames,
                    ];
                },
                getScriptVersion(fileName) {
                    const basename = path_1.posix.basename(fileName);
                    if (basename === localTypes.typesFileName) {
                        return '';
                    }
                    return host.getScriptVersion(fileName);
                },
                getScriptSnapshot(fileName) {
                    const basename = path_1.posix.basename(fileName);
                    if (basename === localTypes.typesFileName) {
                        return sharedTypesSnapshot;
                    }
                    let snapshot = host.getScriptSnapshot(fileName);
                    if (snapshot) {
                        if (!vueCompilerOptions.strictTemplates && (
                        // for vue 2.6 and vue 3
                        basename === 'runtime-dom.d.ts' ||
                            // for vue 2.7
                            basename === 'jsx.d.ts')) {
                            // allow arbitrary attributes
                            let tsScriptText = snapshot.getText(0, snapshot.getLength());
                            tsScriptText = tsScriptText.replace('type ReservedProps = {', 'type ReservedProps = { [name: string]: any');
                            snapshot = ts.ScriptSnapshot.fromString(tsScriptText);
                        }
                    }
                    return snapshot;
                },
            };
        },
    };
    return languageModule;
    function getSharedTypesFiles(fileNames) {
        const moduleFiles = fileNames.filter(fileName => vueCompilerOptions.extensions.some(ext => fileName.endsWith(ext)));
        const moduleFileDirs = [...new Set(moduleFiles.map(path_1.posix.dirname))];
        return moduleFileDirs.map(dir => path_1.posix.join(dir, localTypes.typesFileName));
    }
}
exports.createLanguageModule = createLanguageModule;
//# sourceMappingURL=languageModule.js.map