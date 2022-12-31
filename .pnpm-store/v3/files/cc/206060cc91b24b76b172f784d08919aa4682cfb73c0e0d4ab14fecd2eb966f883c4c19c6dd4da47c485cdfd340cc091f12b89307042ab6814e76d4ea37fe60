Object.defineProperty(exports, "__esModule", { value: true });
exports.collectCssVars = exports.collectStyleCssClasses = void 0;
const reactivity_1 = require("@vue/reactivity");
const script_1 = require("../generators/script");
const templateGen = require("../generators/template");
const scriptRanges_1 = require("../parsers/scriptRanges");
const scriptSetupRanges_1 = require("../parsers/scriptSetupRanges");
const language_core_1 = require("@volar/language-core");
const parseCssClassNames_1 = require("../utils/parseCssClassNames");
const parseCssVars_1 = require("../utils/parseCssVars");
const plugin = ({ modules, vueCompilerOptions, compilerOptions }) => {
    const ts = modules.typescript;
    const instances = new WeakMap();
    return {
        version: 1,
        getEmbeddedFileNames(fileName, sfc) {
            const tsx = useTsx(fileName, sfc);
            const fileNames = [];
            if (['js', 'ts', 'jsx', 'tsx'].includes(tsx.lang.value)) {
                fileNames.push(fileName + '.' + tsx.lang.value);
            }
            if (sfc.template) {
                fileNames.push(fileName + '.__VLS_template_format.ts');
                fileNames.push(fileName + '.__VLS_template_style.css');
            }
            return fileNames;
        },
        resolveEmbeddedFile(fileName, sfc, embeddedFile) {
            var _a, _b;
            const _tsx = useTsx(fileName, sfc);
            const suffix = embeddedFile.fileName.replace(fileName, '');
            if (suffix === '.' + _tsx.lang.value) {
                embeddedFile.kind = language_core_1.FileKind.TypeScriptHostFile;
                embeddedFile.capabilities = {
                    diagnostic: true,
                    foldingRange: false,
                    documentFormatting: false,
                    documentSymbol: false,
                    codeAction: true,
                    inlayHint: true,
                };
                const tsx = _tsx.tsxGen.value;
                if (tsx) {
                    embeddedFile.content = [...tsx.codeGen];
                    embeddedFile.extraMappings = [...tsx.extraMappings];
                    embeddedFile.mirrorBehaviorMappings = [...tsx.mirrorBehaviorMappings];
                }
            }
            else if (suffix.match(/^\.__VLS_template_format\.ts$/)) {
                embeddedFile.parentFileName = fileName + '.template.' + ((_a = sfc.template) === null || _a === void 0 ? void 0 : _a.lang);
                embeddedFile.capabilities = {
                    diagnostic: false,
                    foldingRange: false,
                    documentFormatting: true,
                    documentSymbol: true,
                    codeAction: false,
                    inlayHint: false,
                };
                if (_tsx.htmlGen.value) {
                    embeddedFile.content = [..._tsx.htmlGen.value.formatCodeGen];
                }
                for (const cssVar of _tsx.cssVars.value) {
                    embeddedFile.content.push('\n\n');
                    for (const range of cssVar.ranges) {
                        embeddedFile.content.push('(');
                        embeddedFile.content.push([
                            cssVar.style.content.substring(range.start, range.end),
                            cssVar.style.name,
                            range.start,
                            {},
                        ]);
                        embeddedFile.content.push(');\n');
                    }
                }
            }
            else if (suffix.match(/^\.__VLS_template_style\.css$/)) {
                embeddedFile.parentFileName = fileName + '.template.' + ((_b = sfc.template) === null || _b === void 0 ? void 0 : _b.lang);
                if (_tsx.htmlGen.value) {
                    embeddedFile.content = [..._tsx.htmlGen.value.cssCodeGen];
                }
            }
        },
    };
    function useTsx(fileName, sfc) {
        if (!instances.has(sfc)) {
            instances.set(sfc, createTsx(fileName, sfc));
        }
        return instances.get(sfc);
    }
    function createTsx(fileName, _sfc) {
        const lang = (0, reactivity_1.computed)(() => {
            let lang = !_sfc.script && !_sfc.scriptSetup ? 'ts'
                : _sfc.scriptSetup && _sfc.scriptSetup.lang !== 'js' ? _sfc.scriptSetup.lang
                    : _sfc.script && _sfc.script.lang !== 'js' ? _sfc.script.lang
                        : 'js';
            if (vueCompilerOptions.jsxTemplates) {
                if (lang === 'js') {
                    lang = 'jsx';
                }
                else if (lang === 'ts') {
                    lang = 'tsx';
                }
            }
            return lang;
        });
        const cssVars = (0, reactivity_1.computed)(() => collectCssVars(_sfc));
        const scriptRanges = (0, reactivity_1.computed)(() => _sfc.scriptAst
            ? (0, scriptRanges_1.parseScriptRanges)(ts, _sfc.scriptAst, !!_sfc.scriptSetup, false)
            : undefined);
        const scriptSetupRanges = (0, reactivity_1.computed)(() => _sfc.scriptSetupAst
            ? (0, scriptSetupRanges_1.parseScriptSetupRanges)(ts, _sfc.scriptSetupAst)
            : undefined);
        const cssModuleClasses = (0, reactivity_1.computed)(() => collectStyleCssClasses(_sfc, style => !!style.module));
        const cssScopedClasses = (0, reactivity_1.computed)(() => collectStyleCssClasses(_sfc, style => {
            const setting = vueCompilerOptions.experimentalResolveStyleCssClasses;
            return (setting === 'scoped' && style.scoped) || setting === 'always';
        }));
        const htmlGen = (0, reactivity_1.computed)(() => {
            var _a, _b, _c, _d;
            const templateAst = _sfc.templateAst;
            if (!templateAst)
                return;
            return templateGen.generate(ts, compilerOptions, vueCompilerOptions, (_b = (_a = _sfc.template) === null || _a === void 0 ? void 0 : _a.content) !== null && _b !== void 0 ? _b : '', (_d = (_c = _sfc.template) === null || _c === void 0 ? void 0 : _c.lang) !== null && _d !== void 0 ? _d : 'html', templateAst, !!_sfc.scriptSetup, Object.values(cssScopedClasses.value).map(style => style.classNames).flat());
        });
        const tsxGen = (0, reactivity_1.computed)(() => (0, script_1.generate)(ts, fileName, _sfc, lang.value, scriptRanges.value, scriptSetupRanges.value, cssVars.value, cssModuleClasses.value, cssScopedClasses.value, htmlGen.value, compilerOptions, vueCompilerOptions));
        return {
            lang,
            tsxGen,
            htmlGen,
            cssVars,
        };
    }
};
exports.default = plugin;
function collectStyleCssClasses(sfc, condition) {
    const result = [];
    for (let i = 0; i < sfc.styles.length; i++) {
        const style = sfc.styles[i];
        if (condition(style)) {
            const classNameRanges = [...(0, parseCssClassNames_1.parseCssClassNames)(style.content)];
            result.push({
                style: style,
                index: i,
                classNameRanges: classNameRanges,
                classNames: classNameRanges.map(range => style.content.substring(range.start + 1, range.end)),
            });
        }
    }
    return result;
}
exports.collectStyleCssClasses = collectStyleCssClasses;
function collectCssVars(sfc) {
    const result = [];
    for (let i = 0; i < sfc.styles.length; i++) {
        const style = sfc.styles[i];
        result.push({
            style,
            ranges: [...(0, parseCssVars_1.parseCssVars)(style.content)],
        });
    }
    return result;
}
exports.collectCssVars = collectCssVars;
//# sourceMappingURL=vue-tsx.js.map