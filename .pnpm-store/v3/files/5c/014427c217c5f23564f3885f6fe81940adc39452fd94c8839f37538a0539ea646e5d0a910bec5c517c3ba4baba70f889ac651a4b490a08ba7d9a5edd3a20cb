var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTsLib = exports.createProgram = void 0;
const ts = require("typescript/lib/tsserverlibrary");
const vue = require("@volar/vue-language-core");
const vueTs = require("@volar/vue-typescript");
const shared_1 = require("./shared");
function createProgram(options, // rootNamesOrOptions: readonly string[] | CreateProgramOptions,
_options, _host, _oldProgram, _configFileParsingDiagnostics) {
    var _a, _b;
    if (!options.options.noEmit && !options.options.emitDeclarationOnly)
        throw toThrow('js emit is not supported');
    if (!options.options.noEmit && options.options.noEmitOnError)
        throw toThrow('noEmitOnError is not supported');
    if (!options.host)
        throw toThrow('!options.host');
    let program = options.oldProgram;
    if (shared_1.state.hook) {
        program = shared_1.state.hook.program;
        program.__vue.options = options;
    }
    else if (!program) {
        const ctx = {
            projectVersion: 0,
            options,
            get languageServiceHost() {
                return vueLsHost;
            },
            get languageService() {
                return vueTsLs;
            },
        };
        const vueCompilerOptions = getVueCompilerOptions();
        const scripts = new Map();
        const vueLsHost = new Proxy({
            resolveModuleNames: undefined,
            writeFile: (fileName, content) => {
                if (fileName.indexOf('__VLS_') === -1) {
                    ctx.options.host.writeFile(fileName, content, false);
                }
            },
            getCompilationSettings: () => ctx.options.options,
            getVueCompilationSettings: () => vueCompilerOptions,
            getScriptFileNames: () => {
                return ctx.options.rootNames;
            },
            getScriptVersion,
            getScriptSnapshot,
            getProjectVersion: () => {
                return ctx.projectVersion.toString();
            },
            getProjectReferences: () => ctx.options.projectReferences,
            getTypeScriptModule: () => ts,
            isTsc: true,
        }, {
            get: (target, property) => {
                if (property in target) {
                    return target[property];
                }
                return ctx.options.host[property];
            },
        });
        const vueTsLs = vueTs.createLanguageService(vueLsHost);
        program = vueTsLs.getProgram();
        program.__vue = ctx;
        function getVueCompilerOptions() {
            const tsConfig = ctx.options.options.configFilePath;
            if (typeof tsConfig === 'string') {
                return vue.createParsedCommandLine(ts, ts.sys, tsConfig, []).vueOptions;
            }
            return {};
        }
        function getScriptVersion(fileName) {
            var _a, _b;
            return (_b = (_a = getScript(fileName)) === null || _a === void 0 ? void 0 : _a.version) !== null && _b !== void 0 ? _b : '';
        }
        function getScriptSnapshot(fileName) {
            var _a;
            return (_a = getScript(fileName)) === null || _a === void 0 ? void 0 : _a.scriptSnapshot;
        }
        function getScript(fileName) {
            var _a, _b, _c, _d, _e, _f, _g;
            const script = scripts.get(fileName);
            if ((script === null || script === void 0 ? void 0 : script.projectVersion) === ctx.projectVersion) {
                return script;
            }
            const modifiedTime = (_d = (_c = (_b = (_a = ts.sys).getModifiedTime) === null || _b === void 0 ? void 0 : _b.call(_a, fileName)) === null || _c === void 0 ? void 0 : _c.valueOf()) !== null && _d !== void 0 ? _d : 0;
            if ((script === null || script === void 0 ? void 0 : script.modifiedTime) === modifiedTime) {
                return script;
            }
            if (ctx.options.host.fileExists(fileName)) {
                const fileContent = ctx.options.host.readFile(fileName);
                if (fileContent !== undefined) {
                    const script = {
                        projectVersion: ctx.projectVersion,
                        modifiedTime,
                        scriptSnapshot: ts.ScriptSnapshot.fromString(fileContent),
                        version: (_g = (_f = (_e = ctx.options.host).createHash) === null || _f === void 0 ? void 0 : _f.call(_e, fileContent)) !== null && _g !== void 0 ? _g : fileContent,
                    };
                    scripts.set(fileName, script);
                    return script;
                }
            }
        }
    }
    else {
        const ctx = program.__vue;
        ctx.options = options;
        ctx.projectVersion++;
    }
    const vueCompilerOptions = program.__vue.languageServiceHost.getVueCompilationSettings();
    if (vueCompilerOptions.hooks) {
        const index = ((_b = (_a = shared_1.state.hook) === null || _a === void 0 ? void 0 : _a.index) !== null && _b !== void 0 ? _b : -1) + 1;
        if (index < vueCompilerOptions.hooks.length) {
            const hookPath = vueCompilerOptions.hooks[index];
            const hook = require(hookPath);
            shared_1.state.hook = {
                program,
                index,
                worker: (() => __awaiter(this, void 0, void 0, function* () { return yield hook(program); }))(),
            };
            throw 'hook';
        }
    }
    for (const rootName of options.rootNames) {
        // register file watchers
        options.host.getSourceFile(rootName, ts.ScriptTarget.ESNext);
    }
    return program;
}
exports.createProgram = createProgram;
function loadTsLib() {
    return ts;
}
exports.loadTsLib = loadTsLib;
function toThrow(msg) {
    console.error(msg);
    return msg;
}
//# sourceMappingURL=index.js.map