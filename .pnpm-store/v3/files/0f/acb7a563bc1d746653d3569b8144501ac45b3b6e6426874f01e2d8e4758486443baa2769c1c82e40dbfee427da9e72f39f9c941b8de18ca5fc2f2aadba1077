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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = void 0;
const CompilerDom = require("@vue/compiler-dom");
const Vue2TemplateCompiler = require('vue-template-compiler/build');
__exportStar(require("@vue/compiler-dom"), exports);
function compile(template, options = {}) {
    var _a, _b;
    const onError = options.onError;
    const onWarn = options.onWarn;
    options.onError = (error) => {
        if (error.code === 33 /* CompilerDom.ErrorCodes.X_V_FOR_TEMPLATE_KEY_PLACEMENT */ // :key binding allowed in v-for template child in vue 2
            || error.code === 29 /* CompilerDom.ErrorCodes.X_V_IF_SAME_KEY */ // fix https://github.com/johnsoncodehk/volar/issues/1638
        ) {
            return;
        }
        if (onError) {
            onError(error);
        }
        else {
            throw error;
        }
    };
    const vue2Result = Vue2TemplateCompiler.compile(template, { outputSourceRange: true });
    for (const error of vue2Result.errors) {
        onError === null || onError === void 0 ? void 0 : onError({
            code: 'vue-template-compiler',
            name: '',
            message: error.msg,
            loc: {
                source: '',
                start: { column: -1, line: -1, offset: error.start },
                end: { column: -1, line: -1, offset: (_a = error.end) !== null && _a !== void 0 ? _a : error.start },
            },
        });
    }
    for (const error of vue2Result.tips) {
        onWarn === null || onWarn === void 0 ? void 0 : onWarn({
            code: 'vue-template-compiler',
            name: '',
            message: error.msg,
            loc: {
                source: '',
                start: { column: -1, line: -1, offset: error.start },
                end: { column: -1, line: -1, offset: (_b = error.end) !== null && _b !== void 0 ? _b : error.start },
            },
        });
    }
    return baseCompile(template, Object.assign({}, CompilerDom.parserOptions, options, {
        nodeTransforms: [
            ...CompilerDom.DOMNodeTransforms,
            ...(options.nodeTransforms || [])
        ],
        directiveTransforms: Object.assign({}, CompilerDom.DOMDirectiveTransforms, options.directiveTransforms || {}),
    }));
}
exports.compile = compile;
function baseCompile(template, options = {}) {
    const onError = options.onError || ((error) => { throw error; });
    const isModuleMode = options.mode === 'module';
    const prefixIdentifiers = options.prefixIdentifiers === true || isModuleMode;
    if (!prefixIdentifiers && options.cacheHandlers) {
        onError(CompilerDom.createCompilerError(49 /* CompilerDom.ErrorCodes.X_CACHE_HANDLER_NOT_SUPPORTED */));
    }
    if (options.scopeId && !isModuleMode) {
        onError(CompilerDom.createCompilerError(50 /* CompilerDom.ErrorCodes.X_SCOPE_ID_NOT_SUPPORTED */));
    }
    const ast = CompilerDom.baseParse(template, options);
    const [nodeTransforms, directiveTransforms] = CompilerDom.getBaseTransformPreset(prefixIdentifiers);
    // v-for > v-if in vue 2
    const transformIf = nodeTransforms[1];
    const transformFor = nodeTransforms[3];
    nodeTransforms[1] = transformFor;
    nodeTransforms[3] = transformIf;
    CompilerDom.transform(ast, Object.assign({}, options, {
        prefixIdentifiers,
        nodeTransforms: [
            ...nodeTransforms,
            ...(options.nodeTransforms || []) // user transforms
        ],
        directiveTransforms: Object.assign({}, directiveTransforms, options.directiveTransforms || {} // user transforms
        )
    }));
    return CompilerDom.generate(ast, Object.assign({}, options, {
        prefixIdentifiers
    }));
}
//# sourceMappingURL=vue2TemplateCompiler.js.map