Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultVueLanguagePlugins = void 0;
const useHtmlFilePlugin = require("./plugins/file-html");
const useMdFilePlugin = require("./plugins/file-md");
const useVueFilePlugin = require("./plugins/file-vue");
const useVueSfcCustomBlocks = require("./plugins/vue-sfc-customblocks");
const useVueSfcScriptsFormat = require("./plugins/vue-sfc-scripts");
const useVueSfcStyles = require("./plugins/vue-sfc-styles");
const useVueSfcTemplate = require("./plugins/vue-sfc-template");
const useHtmlPlugin = require("./plugins/vue-template-html");
const vue_tsx_1 = require("./plugins/vue-tsx");
const ts_1 = require("./utils/ts");
const CompilerDOM = require("@vue/compiler-dom");
const CompilerVue2 = require("./utils/vue2TemplateCompiler");
function getDefaultVueLanguagePlugins(ts, rootDir, compilerOptions, _vueCompilerOptions, extraPlugins = []) {
    const _plugins = [
        useVueFilePlugin,
        useMdFilePlugin,
        useHtmlFilePlugin,
        useHtmlPlugin,
        useVueSfcStyles,
        useVueSfcCustomBlocks,
        useVueSfcScriptsFormat,
        useVueSfcTemplate,
        vue_tsx_1.default,
        ...extraPlugins,
    ];
    const pluginPaths = new Map();
    const vueCompilerOptions = (0, ts_1.resolveVueCompilerOptions)(_vueCompilerOptions);
    if (typeof (require === null || require === void 0 ? void 0 : require.resolve) === 'function') {
        for (const pluginPath of vueCompilerOptions.plugins) {
            try {
                const importPath = require.resolve(pluginPath, { paths: [rootDir] });
                const plugin = require(importPath);
                pluginPaths.set(_plugins.length, pluginPath);
                _plugins.push(plugin);
            }
            catch (error) {
                console.log('Load plugin failed', pluginPath, error);
            }
        }
    }
    else {
        console.log('vueCompilerOptions.plugins is not available in Web.');
    }
    const pluginCtx = {
        modules: {
            '@vue/compiler-dom': vueCompilerOptions.target < 3 ? CompilerVue2 : CompilerDOM,
            typescript: ts,
        },
        compilerOptions,
        vueCompilerOptions,
    };
    const plugins = _plugins.map(plugin => plugin(pluginCtx)).sort((a, b) => {
        var _a, _b;
        const aOrder = (_a = a.order) !== null && _a !== void 0 ? _a : 0;
        const bOrder = (_b = b.order) !== null && _b !== void 0 ? _b : 0;
        return aOrder - bOrder;
    });
    return plugins.filter((plugin, i) => {
        var _a;
        const valid = plugin.version >= 1 && plugin.version < 2;
        if (!valid) {
            console.warn(`Plugin ${JSON.stringify((_a = pluginPaths.get(i)) !== null && _a !== void 0 ? _a : plugin.name)} API version incompatible, expected 1.x but got ${JSON.stringify(plugin.version)}`);
        }
        return valid;
    });
}
exports.getDefaultVueLanguagePlugins = getDefaultVueLanguagePlugins;
//# sourceMappingURL=plugins.js.map