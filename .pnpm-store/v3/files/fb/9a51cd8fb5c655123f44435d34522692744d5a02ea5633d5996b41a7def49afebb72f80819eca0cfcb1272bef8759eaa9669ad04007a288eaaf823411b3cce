import { transformWithEsbuild } from "vite";
import babel from "@babel/core";
import * as colors from "kleur/colors";
import path from "path";
import { error } from "../core/logger/core.js";
import { removeQueryString } from "../core/path.js";
import { detectImportSource } from "./import-source.js";
import tagExportsPlugin from "./tag.js";
const JSX_EXTENSIONS = /* @__PURE__ */ new Set([".jsx", ".tsx", ".mdx"]);
const IMPORT_STATEMENTS = {
  react: "import React from 'react'",
  preact: "import { h } from 'preact'",
  "solid-js": "import 'solid-js'",
  astro: "import 'astro/jsx-runtime'"
};
function getEsbuildLoader(filePath) {
  const fileExt = path.extname(filePath);
  if (fileExt === ".mdx")
    return "jsx";
  return fileExt.slice(1);
}
function collectJSXRenderers(renderers) {
  const renderersWithJSXSupport = renderers.filter((r) => r.jsxImportSource);
  return new Map(
    renderersWithJSXSupport.map((r) => [r.jsxImportSource, r])
  );
}
async function transformJSX({
  code,
  mode,
  id,
  ssr,
  renderer,
  root
}) {
  const { jsxTransformOptions } = renderer;
  const options = await jsxTransformOptions({ mode, ssr });
  const plugins = [...options.plugins || []];
  if (ssr) {
    plugins.push(await tagExportsPlugin({ rendererName: renderer.name, root }));
  }
  const result = await babel.transformAsync(code, {
    presets: options.presets,
    plugins,
    cwd: process.cwd(),
    filename: id,
    ast: false,
    compact: false,
    sourceMaps: true,
    configFile: false,
    babelrc: false,
    inputSourceMap: options.inputSourceMap
  });
  if (!result)
    return null;
  if (renderer.name === "astro:jsx") {
    const { astro } = result.metadata;
    return {
      code: result.code || "",
      map: result.map,
      meta: {
        astro,
        vite: {
          lang: "ts"
        }
      }
    };
  }
  return {
    code: result.code || "",
    map: result.map
  };
}
function jsx({ settings, logging }) {
  let viteConfig;
  const jsxRenderers = /* @__PURE__ */ new Map();
  const jsxRenderersIntegrationOnly = /* @__PURE__ */ new Map();
  let astroJSXRenderer;
  let defaultJSXRendererEntry;
  return {
    name: "astro:jsx",
    enforce: "pre",
    async configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
      const possibleRenderers = collectJSXRenderers(settings.renderers);
      for (const [importSource, renderer] of possibleRenderers) {
        jsxRenderers.set(importSource, renderer);
        if (importSource === "astro") {
          astroJSXRenderer = renderer;
        } else {
          jsxRenderersIntegrationOnly.set(importSource, renderer);
        }
      }
      defaultJSXRendererEntry = [...jsxRenderersIntegrationOnly.entries()][0];
    },
    async transform(code, id, opts) {
      const ssr = Boolean(opts == null ? void 0 : opts.ssr);
      id = removeQueryString(id);
      if (!JSX_EXTENSIONS.has(path.extname(id))) {
        return null;
      }
      const { mode } = viteConfig;
      if (id.endsWith(".mdx")) {
        const { code: jsxCode2 } = await transformWithEsbuild(code, id, {
          loader: getEsbuildLoader(id),
          jsx: "preserve",
          sourcemap: "inline",
          tsconfigRaw: {
            compilerOptions: {
              importsNotUsedAsValues: "remove"
            }
          }
        });
        return transformJSX({
          code: jsxCode2,
          id,
          renderer: astroJSXRenderer,
          mode,
          ssr,
          root: settings.config.root
        });
      }
      if (defaultJSXRendererEntry && jsxRenderersIntegrationOnly.size === 1) {
        const { code: jsxCode2 } = await transformWithEsbuild(code, id, {
          loader: getEsbuildLoader(id),
          jsx: "preserve",
          sourcemap: "inline"
        });
        return transformJSX({
          code: jsxCode2,
          id,
          renderer: defaultJSXRendererEntry[1],
          mode,
          ssr,
          root: settings.config.root
        });
      }
      const importSource = await detectImportSource(code, jsxRenderers, settings.tsConfig);
      if (!importSource && defaultJSXRendererEntry) {
        const [defaultRendererName] = defaultJSXRendererEntry;
        error(
          logging,
          "renderer",
          `${colors.yellow(id)}
Unable to resolve a renderer that handles this file! With more than one renderer enabled, you should include an import or use a pragma comment.
Add ${colors.cyan(
            IMPORT_STATEMENTS[defaultRendererName] || `import '${defaultRendererName}';`
          )} or ${colors.cyan(`/* jsxImportSource: ${defaultRendererName} */`)} to this file.
`
        );
        return null;
      } else if (!importSource) {
        error(
          logging,
          "renderer",
          `${colors.yellow(id)}
Unable to find a renderer for JSX. Do you have one configured in your Astro config? See this page to learn how:
https://docs.astro.build/en/core-concepts/framework-components/#installing-integrations
`
        );
        return null;
      }
      const selectedJsxRenderer = jsxRenderers.get(importSource);
      if (!selectedJsxRenderer) {
        error(
          logging,
          "renderer",
          `${colors.yellow(
            id
          )} No renderer installed for ${importSource}. Try adding \`@astrojs/${importSource}\` to your project.`
        );
        return null;
      }
      const { code: jsxCode } = await transformWithEsbuild(code, id, {
        loader: getEsbuildLoader(id),
        jsx: "preserve",
        sourcemap: "inline"
      });
      return await transformJSX({
        code: jsxCode,
        id,
        renderer: selectedJsxRenderer,
        mode,
        ssr,
        root: settings.config.root
      });
    }
  };
}
export {
  jsx as default
};
