"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/preprocess.ts
var preprocess_exports = {};
__export(preprocess_exports, {
  vitePreprocess: () => vitePreprocess
});
module.exports = __toCommonJS(preprocess_exports);
var import_path = __toESM(require("path"), 1);
var vite = __toESM(require("vite"), 1);
var supportedStyleLangs = ["css", "less", "sass", "scss", "styl", "stylus", "postcss", "sss"];
var supportedScriptLangs = ["ts"];
function vitePreprocess(opts) {
  const preprocessor = {};
  if (opts?.script !== false) {
    preprocessor.script = viteScript().script;
  }
  if (opts?.style !== false) {
    const styleOpts = typeof opts?.style == "object" ? opts?.style : void 0;
    preprocessor.style = viteStyle(styleOpts).style;
  }
  return preprocessor;
}
function viteScript() {
  return {
    async script({ attributes, content, filename = "" }) {
      const lang = attributes.lang;
      if (!supportedScriptLangs.includes(lang))
        return;
      const transformResult = await vite.transformWithEsbuild(content, filename, {
        loader: lang,
        target: "esnext",
        tsconfigRaw: {
          compilerOptions: {
            importsNotUsedAsValues: "preserve",
            preserveValueImports: true
          }
        }
      });
      return {
        code: transformResult.code,
        map: transformResult.map
      };
    }
  };
}
function viteStyle(config = {}) {
  let transform;
  const style = async ({ attributes, content, filename = "" }) => {
    const lang = attributes.lang;
    if (!supportedStyleLangs.includes(lang))
      return;
    if (!transform) {
      let resolvedConfig;
      if (style.__resolvedConfig) {
        resolvedConfig = style.__resolvedConfig;
      } else if (isResolvedConfig(config)) {
        resolvedConfig = config;
      } else {
        resolvedConfig = await vite.resolveConfig(
          config,
          process.env.NODE_ENV === "production" ? "build" : "serve"
        );
      }
      transform = getCssTransformFn(resolvedConfig);
    }
    const moduleId = `${filename}.${lang}`;
    const result = await transform(content, moduleId);
    if (result.map?.sources?.[0] === moduleId) {
      result.map.sources[0] = import_path.default.basename(filename);
    }
    return {
      code: result.code,
      map: result.map ?? void 0
    };
  };
  style.__resolvedConfig = null;
  return { style };
}
function getCssTransformFn(config) {
  if (vite.preprocessCSS) {
    return async (code, filename) => {
      return vite.preprocessCSS(code, filename, config);
    };
  } else {
    const pluginName = "vite:css";
    const plugin = config.plugins.find((p) => p.name === pluginName);
    if (!plugin) {
      throw new Error(`failed to find plugin ${pluginName}`);
    }
    if (!plugin.transform) {
      throw new Error(`plugin ${pluginName} has no transform`);
    }
    return plugin.transform.bind(null);
  }
}
function isResolvedConfig(config) {
  return !!config.inlineConfig;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  vitePreprocess
});
//# sourceMappingURL=preprocess.cjs.map