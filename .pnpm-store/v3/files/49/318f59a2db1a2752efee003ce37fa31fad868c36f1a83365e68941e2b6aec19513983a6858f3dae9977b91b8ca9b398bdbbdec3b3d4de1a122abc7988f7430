// src/preprocess.ts
import path from "path";
import * as vite from "vite";
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
      result.map.sources[0] = path.basename(filename);
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
export {
  vitePreprocess
};
//# sourceMappingURL=preprocess.js.map