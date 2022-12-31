import nodeFs from "fs";
import { fileURLToPath } from "url";
import * as vite from "vite";
import { crawlFrameworkPkgs } from "vitefu";
import {
  astroContentServerPlugin,
  astroContentVirtualModPlugin,
  astroDelayedAssetPlugin
} from "../content/index.js";
import astroPostprocessVitePlugin from "../vite-plugin-astro-postprocess/index.js";
import { vitePluginAstroServer } from "../vite-plugin-astro-server/index.js";
import astroVitePlugin from "../vite-plugin-astro/index.js";
import configAliasVitePlugin from "../vite-plugin-config-alias/index.js";
import envVitePlugin from "../vite-plugin-env/index.js";
import astroHeadPropagationPlugin from "../vite-plugin-head-propagation/index.js";
import htmlVitePlugin from "../vite-plugin-html/index.js";
import astroIntegrationsContainerPlugin from "../vite-plugin-integrations-container/index.js";
import jsxVitePlugin from "../vite-plugin-jsx/index.js";
import astroLoadFallbackPlugin from "../vite-plugin-load-fallback/index.js";
import legacyMarkdownVitePlugin from "../vite-plugin-markdown-legacy/index.js";
import markdownVitePlugin from "../vite-plugin-markdown/index.js";
import astroScannerPlugin from "../vite-plugin-scanner/index.js";
import astroScriptsPlugin from "../vite-plugin-scripts/index.js";
import astroScriptsPageSSRPlugin from "../vite-plugin-scripts/page-ssr.js";
import { createCustomViteLogger } from "./errors/dev/index.js";
import { resolveDependency } from "./util.js";
const ALWAYS_NOEXTERNAL = /* @__PURE__ */ new Set([
  "astro",
  "astro/components",
  "@nanostores/preact",
  "@fontsource/*"
]);
function getSsrNoExternalDeps(projectRoot) {
  let noExternalDeps = [];
  for (const dep of ALWAYS_NOEXTERNAL) {
    try {
      resolveDependency(dep, projectRoot);
      noExternalDeps.push(dep);
    } catch {
    }
  }
  return noExternalDeps;
}
async function createVite(commandConfig, { settings, logging, mode, fs = nodeFs }) {
  const astroPkgsConfig = await crawlFrameworkPkgs({
    root: fileURLToPath(settings.config.root),
    isBuild: mode === "build",
    viteUserConfig: settings.config.vite,
    isFrameworkPkgByJson(pkgJson) {
      var _a, _b, _c, _d;
      return ((_a = pkgJson.peerDependencies) == null ? void 0 : _a.astro) || ((_b = pkgJson.dependencies) == null ? void 0 : _b.astro) || ((_c = pkgJson.keywords) == null ? void 0 : _c.includes("astro")) || ((_d = pkgJson.keywords) == null ? void 0 : _d.includes("astro-component")) || /^(@[^\/]+\/)?astro\-/.test(pkgJson.name);
    },
    isFrameworkPkgByName(pkgName) {
      const isNotAstroPkg = isCommonNotAstro(pkgName);
      if (isNotAstroPkg) {
        return false;
      } else {
        return void 0;
      }
    }
  });
  const commonConfig = {
    cacheDir: fileURLToPath(new URL("./node_modules/.vite/", settings.config.root)),
    clearScreen: false,
    logLevel: "warn",
    appType: "custom",
    optimizeDeps: {
      entries: ["src/**/*"],
      exclude: ["astro", "node-fetch"]
    },
    plugins: [
      configAliasVitePlugin({ settings }),
      astroLoadFallbackPlugin({ fs, root: settings.config.root }),
      astroVitePlugin({ settings, logging }),
      astroScriptsPlugin({ settings }),
      mode !== "build" && vitePluginAstroServer({ settings, logging, fs }),
      envVitePlugin({ settings }),
      settings.config.legacy.astroFlavoredMarkdown ? legacyMarkdownVitePlugin({ settings, logging }) : markdownVitePlugin({ settings, logging }),
      htmlVitePlugin(),
      jsxVitePlugin({ settings, logging }),
      astroPostprocessVitePlugin({ settings }),
      astroIntegrationsContainerPlugin({ settings, logging }),
      astroScriptsPageSSRPlugin({ settings }),
      astroHeadPropagationPlugin({ settings }),
      settings.config.experimental.prerender && astroScannerPlugin({ settings, logging }),
      ...settings.config.experimental.contentCollections ? [
        astroContentVirtualModPlugin({ settings }),
        astroContentServerPlugin({ fs, settings, logging, mode }),
        astroDelayedAssetPlugin({ mode })
      ] : []
    ],
    publicDir: fileURLToPath(settings.config.publicDir),
    root: fileURLToPath(settings.config.root),
    envPrefix: "PUBLIC_",
    define: {
      "import.meta.env.SITE": settings.config.site ? JSON.stringify(settings.config.site) : "undefined"
    },
    server: {
      hmr: process.env.NODE_ENV === "test" || process.env.NODE_ENV === "production" ? false : void 0,
      proxy: {},
      watch: {
        ignored: mode === "build" ? ["**"] : void 0
      }
    },
    css: {
      postcss: settings.config.style.postcss || {}
    },
    resolve: {
      alias: [
        {
          find: "randombytes",
          replacement: "randombytes/browser"
        },
        {
          find: /^astro$/,
          replacement: fileURLToPath(new URL("../@types/astro", import.meta.url))
        }
      ],
      conditions: ["astro"],
      dedupe: ["astro"]
    },
    ssr: {
      noExternal: [
        ...getSsrNoExternalDeps(settings.config.root),
        ...astroPkgsConfig.ssr.noExternal
      ],
      external: [...mode === "dev" ? ["shiki"] : [], ...astroPkgsConfig.ssr.external]
    }
  };
  let result = commonConfig;
  result = vite.mergeConfig(result, settings.config.vite || {});
  result = vite.mergeConfig(result, commandConfig);
  if (result.plugins) {
    sortPlugins(result.plugins);
  }
  result.customLogger = createCustomViteLogger(result.logLevel ?? "warn");
  return result;
}
function isVitePlugin(plugin) {
  return Boolean(plugin == null ? void 0 : plugin.hasOwnProperty("name"));
}
function findPluginIndexByName(pluginOptions, name) {
  return pluginOptions.findIndex(function(pluginOption) {
    return isVitePlugin(pluginOption) && pluginOption.name === name;
  });
}
function sortPlugins(pluginOptions) {
  const mdxPluginIndex = findPluginIndexByName(pluginOptions, "@mdx-js/rollup");
  if (mdxPluginIndex === -1)
    return;
  const jsxPluginIndex = findPluginIndexByName(pluginOptions, "astro:jsx");
  const mdxPlugin = pluginOptions[mdxPluginIndex];
  pluginOptions.splice(mdxPluginIndex, 1);
  pluginOptions.splice(jsxPluginIndex, 0, mdxPlugin);
}
const COMMON_DEPENDENCIES_NOT_ASTRO = [
  "autoprefixer",
  "react",
  "react-dom",
  "preact",
  "preact-render-to-string",
  "vue",
  "svelte",
  "solid-js",
  "lit",
  "cookie",
  "dotenv",
  "esbuild",
  "eslint",
  "jest",
  "postcss",
  "prettier",
  "astro",
  "tslib",
  "typescript",
  "vite"
];
const COMMON_PREFIXES_NOT_ASTRO = [
  "@webcomponents/",
  "@fontsource/",
  "@postcss-plugins/",
  "@rollup/",
  "@astrojs/renderer-",
  "@types/",
  "@typescript-eslint/",
  "eslint-",
  "jest-",
  "postcss-plugin-",
  "prettier-plugin-",
  "remark-",
  "rehype-",
  "rollup-plugin-",
  "vite-plugin-"
];
function isCommonNotAstro(dep) {
  return COMMON_DEPENDENCIES_NOT_ASTRO.includes(dep) || COMMON_PREFIXES_NOT_ASTRO.some(
    (prefix) => prefix.startsWith("@") ? dep.startsWith(prefix) : dep.substring(dep.lastIndexOf("/") + 1).startsWith(prefix)
  );
}
export {
  createVite
};
