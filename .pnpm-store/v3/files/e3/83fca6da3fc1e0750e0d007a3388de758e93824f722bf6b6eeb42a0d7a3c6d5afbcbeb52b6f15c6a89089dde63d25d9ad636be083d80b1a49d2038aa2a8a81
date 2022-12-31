Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveVueCompilerOptions = exports.createParsedCommandLine = exports.createParsedCommandLineByJson = void 0;
const path = require("path");
function createParsedCommandLineByJson(ts, parseConfigHost, rootDir, json, extraFileExtensions) {
    const tsConfigPath = path.join(rootDir, 'jsconfig.json');
    const content = ts.parseJsonConfigFileContent(json, parseConfigHost, rootDir, {}, tsConfigPath, undefined, extraFileExtensions);
    return createParsedCommandLineBase(ts, parseConfigHost, content, tsConfigPath, extraFileExtensions, new Set());
}
exports.createParsedCommandLineByJson = createParsedCommandLineByJson;
function createParsedCommandLine(ts, parseConfigHost, tsConfigPath, extraFileExtensions, extendsSet = new Set()) {
    try {
        const config = ts.readJsonConfigFile(tsConfigPath, parseConfigHost.readFile);
        const content = ts.parseJsonSourceFileConfigFileContent(config, parseConfigHost, path.dirname(tsConfigPath), {}, tsConfigPath, undefined, extraFileExtensions);
        // fix https://github.com/johnsoncodehk/volar/issues/1786
        // https://github.com/microsoft/TypeScript/issues/30457
        // patching ts server broke with outDir + rootDir + composite/incremental
        content.options.outDir = undefined;
        return createParsedCommandLineBase(ts, parseConfigHost, content, tsConfigPath, extraFileExtensions, extendsSet);
    }
    catch (err) {
        console.log('Failed to resolve tsconfig path:', tsConfigPath);
        return {
            fileNames: [],
            options: {},
            vueOptions: {},
            errors: [],
        };
    }
}
exports.createParsedCommandLine = createParsedCommandLine;
function createParsedCommandLineBase(ts, parseConfigHost, content, tsConfigPath, extraFileExtensions, extendsSet) {
    var _a;
    let extendsVueOptions = {};
    const folder = path.dirname(tsConfigPath);
    extendsSet.add(tsConfigPath);
    if (content.raw.extends) {
        try {
            const extendsPath = require.resolve(content.raw.extends, { paths: [folder] });
            if (!extendsSet.has(extendsPath)) {
                extendsVueOptions = createParsedCommandLine(ts, parseConfigHost, extendsPath, extraFileExtensions, extendsSet).vueOptions;
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    const vueOptions = Object.assign(Object.assign({}, extendsVueOptions), content.raw.vueCompilerOptions);
    vueOptions.hooks = (_a = vueOptions.hooks) === null || _a === void 0 ? void 0 : _a.map(hook => {
        try {
            hook = require.resolve(hook, { paths: [folder] });
        }
        catch (error) {
            console.error(error);
        }
        return hook;
    });
    return Object.assign(Object.assign({}, content), { vueOptions });
}
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element
const HTML_TAGS = 'html,body,base,head,link,meta,style,title,address,article,aside,footer,' +
    'header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,' +
    'figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,' +
    'data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,' +
    'time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,' +
    'canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,' +
    'th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,' +
    'option,output,progress,select,textarea,details,dialog,menu,' +
    'summary,template,blockquote,iframe,tfoot';
// https://developer.mozilla.org/en-US/docs/Web/SVG/Element
const SVG_TAGS = 'svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,' +
    'defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,' +
    'feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,' +
    'feDistanceLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,' +
    'feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,' +
    'fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,' +
    'foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,' +
    'mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,' +
    'polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,' +
    'text,textPath,title,tspan,unknown,use,view';
function resolveVueCompilerOptions(vueOptions) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    const target = (_a = vueOptions.target) !== null && _a !== void 0 ? _a : 3;
    return Object.assign(Object.assign({}, vueOptions), { target, extensions: (_b = vueOptions.extensions) !== null && _b !== void 0 ? _b : ['.vue'], jsxTemplates: (_c = vueOptions.jsxTemplates) !== null && _c !== void 0 ? _c : false, strictTemplates: (_d = vueOptions.strictTemplates) !== null && _d !== void 0 ? _d : false, skipTemplateCodegen: (_e = vueOptions.skipTemplateCodegen) !== null && _e !== void 0 ? _e : false, nativeTags: (_f = vueOptions.nativeTags) !== null && _f !== void 0 ? _f : [...new Set([
                ...HTML_TAGS.split(','),
                ...SVG_TAGS.split(','),
                // fix https://github.com/johnsoncodehk/volar/issues/1340
                'hgroup',
                'slot',
                'component',
            ])], dataAttributes: (_g = vueOptions.dataAttributes) !== null && _g !== void 0 ? _g : [], htmlAttributes: (_h = vueOptions.htmlAttributes) !== null && _h !== void 0 ? _h : ['aria-*'], optionsWrapper: (_j = vueOptions.optionsWrapper) !== null && _j !== void 0 ? _j : (target >= 2.7
            ? [`(await import('vue')).defineComponent(`, `)`]
            : [`(await import('vue')).default.extend(`, `)`]), narrowingTypesInInlineHandlers: (_k = vueOptions.narrowingTypesInInlineHandlers) !== null && _k !== void 0 ? _k : false, plugins: (_l = vueOptions.plugins) !== null && _l !== void 0 ? _l : [], hooks: (_m = vueOptions.hooks) !== null && _m !== void 0 ? _m : [], 
        // experimental
        experimentalResolveStyleCssClasses: (_o = vueOptions.experimentalResolveStyleCssClasses) !== null && _o !== void 0 ? _o : 'scoped', experimentalRfc436: (_p = vueOptions.experimentalRfc436) !== null && _p !== void 0 ? _p : false, 
        // https://github.com/vuejs/vue-next/blob/master/packages/compiler-dom/src/transforms/vModel.ts#L49-L51
        // https://v3.vuejs.org/guide/forms.html#basic-usage
        experimentalModelPropName: (_q = vueOptions.experimentalModelPropName) !== null && _q !== void 0 ? _q : {
            '': {
                'input': { type: 'radio' },
            },
            'checked': {
                'input': { type: 'checkbox' },
            },
            'value': {
                'input': true,
                'textarea': true,
                'select': true,
            },
        }, experimentalUseElementAccessInTemplate: (_r = vueOptions.experimentalUseElementAccessInTemplate) !== null && _r !== void 0 ? _r : false });
}
exports.resolveVueCompilerOptions = resolveVueCompilerOptions;
//# sourceMappingURL=ts.js.map