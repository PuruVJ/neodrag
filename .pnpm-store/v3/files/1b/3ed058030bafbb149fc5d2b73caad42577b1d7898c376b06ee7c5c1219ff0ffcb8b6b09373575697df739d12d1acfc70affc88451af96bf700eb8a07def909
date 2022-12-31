import * as eslexer from "es-module-lexer";
import glob from "fast-glob";
import fs from "fs";
import { bgGreen, bgMagenta, black, dim } from "kleur/colors";
import path from "path";
import { fileURLToPath } from "url";
import * as vite from "vite";
import { astroBundleDelayedAssetPlugin } from "../../content/index.js";
import {
  createBuildInternals,
  eachPrerenderedPageData
} from "../../core/build/internal.js";
import { emptyDir, removeDir } from "../../core/fs/index.js";
import { prependForwardSlash } from "../../core/path.js";
import { isModeServerWithNoAdapter } from "../../core/util.js";
import { runHookBuildSetup } from "../../integrations/index.js";
import { PAGE_SCRIPT_ID } from "../../vite-plugin-scripts/index.js";
import { AstroError, AstroErrorData } from "../errors/index.js";
import { info } from "../logger/core.js";
import { getOutDirWithinCwd } from "./common.js";
import { generatePages } from "./generate.js";
import { trackPageData } from "./internal.js";
import { getTimeStat } from "./util.js";
import { vitePluginAnalyzer } from "./vite-plugin-analyzer.js";
import { rollupPluginAstroBuildCSS } from "./vite-plugin-css.js";
import { vitePluginHoistedScripts } from "./vite-plugin-hoisted-scripts.js";
import { vitePluginInternals } from "./vite-plugin-internals.js";
import { vitePluginPages } from "./vite-plugin-pages.js";
import { vitePluginPrerender } from "./vite-plugin-prerender.js";
import { injectManifest, vitePluginSSR } from "./vite-plugin-ssr.js";
async function staticBuild(opts) {
  const { allPages, settings } = opts;
  if (isModeServerWithNoAdapter(opts.settings)) {
    throw new AstroError(AstroErrorData.NoAdapterInstalled);
  }
  const pageInput = /* @__PURE__ */ new Set();
  const facadeIdToPageDataMap = /* @__PURE__ */ new Map();
  const internals = createBuildInternals();
  const timer = {};
  timer.buildStart = performance.now();
  for (const [component, pageData] of Object.entries(allPages)) {
    const astroModuleURL = new URL("./" + component, settings.config.root);
    const astroModuleId = prependForwardSlash(component);
    trackPageData(internals, component, pageData, astroModuleId, astroModuleURL);
    pageInput.add(astroModuleId);
    facadeIdToPageDataMap.set(fileURLToPath(astroModuleURL), pageData);
  }
  emptyDir(settings.config.outDir, new Set(".git"));
  timer.ssr = performance.now();
  info(opts.logging, "build", `Building ${settings.config.output} entrypoints...`);
  await ssrBuild(opts, internals, pageInput);
  info(opts.logging, "build", dim(`Completed in ${getTimeStat(timer.ssr, performance.now())}.`));
  const rendererClientEntrypoints = settings.renderers.map((r) => r.clientEntrypoint).filter((a) => typeof a === "string");
  const clientInput = /* @__PURE__ */ new Set([
    ...internals.discoveredHydratedComponents,
    ...internals.discoveredClientOnlyComponents,
    ...rendererClientEntrypoints,
    ...internals.discoveredScripts
  ]);
  if (settings.scripts.some((script) => script.stage === "page")) {
    clientInput.add(PAGE_SCRIPT_ID);
  }
  timer.clientBuild = performance.now();
  await clientBuild(opts, internals, clientInput);
  timer.generate = performance.now();
  if (!settings.config.experimental.prerender) {
    if (settings.config.output === "static") {
      await generatePages(opts, internals);
      await cleanServerOutput(opts);
    } else {
      await injectManifest(opts, internals);
      info(opts.logging, null, `
${bgMagenta(black(" finalizing server assets "))}
`);
      await ssrMoveAssets(opts);
    }
  } else {
    switch (settings.config.output) {
      case "static": {
        await generatePages(opts, internals);
        await cleanServerOutput(opts);
        return;
      }
      case "server": {
        await injectManifest(opts, internals);
        await generatePages(opts, internals);
        await cleanStaticOutput(opts, internals);
        info(opts.logging, null, `
${bgMagenta(black(" finalizing server assets "))}
`);
        await ssrMoveAssets(opts);
        return;
      }
    }
  }
}
async function ssrBuild(opts, internals, input) {
  var _a, _b, _c;
  const { settings, viteConfig } = opts;
  const ssr = settings.config.output === "server";
  const out = ssr ? opts.buildConfig.server : getOutDirWithinCwd(settings.config.outDir);
  const viteBuildConfig = {
    ...viteConfig,
    mode: viteConfig.mode || "production",
    logLevel: opts.viteConfig.logLevel ?? "error",
    build: {
      target: "esnext",
      ...viteConfig.build,
      emptyOutDir: false,
      manifest: false,
      outDir: fileURLToPath(out),
      copyPublicDir: !ssr,
      rollupOptions: {
        ...(_a = viteConfig.build) == null ? void 0 : _a.rollupOptions,
        input: [],
        output: {
          format: "esm",
          chunkFileNames: "chunks/[name].[hash].mjs",
          assetFileNames: "assets/[name].[hash][extname]",
          ...(_c = (_b = viteConfig.build) == null ? void 0 : _b.rollupOptions) == null ? void 0 : _c.output,
          entryFileNames: opts.buildConfig.serverEntry
        }
      },
      ssr: true,
      minify: false,
      modulePreload: { polyfill: false },
      reportCompressedSize: false
    },
    plugins: [
      vitePluginAnalyzer(internals),
      vitePluginInternals(input, internals),
      vitePluginPages(opts, internals),
      rollupPluginAstroBuildCSS({
        buildOptions: opts,
        internals,
        target: "server"
      }),
      vitePluginPrerender(opts, internals),
      ...viteConfig.plugins || [],
      settings.config.experimental.contentCollections && astroBundleDelayedAssetPlugin({ internals }),
      ssr && vitePluginSSR(internals, settings.adapter)
    ],
    envPrefix: "PUBLIC_",
    base: settings.config.base
  };
  await runHookBuildSetup({
    config: settings.config,
    pages: internals.pagesByComponent,
    vite: viteBuildConfig,
    target: "server",
    logging: opts.logging
  });
  return await vite.build(viteBuildConfig);
}
async function clientBuild(opts, internals, input) {
  var _a, _b, _c;
  const { settings, viteConfig } = opts;
  const timer = performance.now();
  const ssr = settings.config.output === "server";
  let out;
  if (!opts.settings.config.experimental.prerender) {
    out = ssr ? opts.buildConfig.client : settings.config.outDir;
  } else {
    out = ssr ? opts.buildConfig.client : getOutDirWithinCwd(settings.config.outDir);
  }
  if (!input.size) {
    if (ssr) {
      await copyFiles(settings.config.publicDir, out);
    }
    return null;
  }
  info(opts.logging, null, `
${bgGreen(black(" building client "))}`);
  const viteBuildConfig = {
    ...viteConfig,
    mode: viteConfig.mode || "production",
    logLevel: "info",
    build: {
      target: "esnext",
      ...viteConfig.build,
      emptyOutDir: false,
      outDir: fileURLToPath(out),
      rollupOptions: {
        ...(_a = viteConfig.build) == null ? void 0 : _a.rollupOptions,
        input: Array.from(input),
        output: {
          format: "esm",
          entryFileNames: "[name].[hash].js",
          chunkFileNames: "chunks/[name].[hash].js",
          assetFileNames: "assets/[name].[hash][extname]",
          ...(_c = (_b = viteConfig.build) == null ? void 0 : _b.rollupOptions) == null ? void 0 : _c.output
        },
        preserveEntrySignatures: "exports-only"
      }
    },
    plugins: [
      vitePluginInternals(input, internals),
      vitePluginHoistedScripts(settings, internals),
      rollupPluginAstroBuildCSS({
        buildOptions: opts,
        internals,
        target: "client"
      }),
      ...viteConfig.plugins || []
    ],
    envPrefix: "PUBLIC_",
    base: settings.config.base
  };
  await runHookBuildSetup({
    config: settings.config,
    pages: internals.pagesByComponent,
    vite: viteBuildConfig,
    target: "client",
    logging: opts.logging
  });
  const buildResult = await vite.build(viteBuildConfig);
  info(opts.logging, null, dim(`Completed in ${getTimeStat(timer, performance.now())}.
`));
  return buildResult;
}
async function cleanStaticOutput(opts, internals) {
  const allStaticFiles = /* @__PURE__ */ new Set();
  for (const pageData of eachPrerenderedPageData(internals)) {
    allStaticFiles.add(internals.pageToBundleMap.get(pageData.moduleSpecifier));
  }
  const ssr = opts.settings.config.output === "server";
  const out = ssr ? opts.buildConfig.server : getOutDirWithinCwd(opts.settings.config.outDir);
  const files = await glob("**/*.mjs", {
    cwd: fileURLToPath(out)
  });
  if (files.length) {
    await eslexer.init;
    await Promise.all(
      files.map(async (filename) => {
        if (!allStaticFiles.has(filename)) {
          return;
        }
        const url = new URL(filename, out);
        const text = await fs.promises.readFile(url, { encoding: "utf8" });
        const [, exports] = eslexer.parse(text);
        let value = "const noop = () => {};";
        for (const e of exports) {
          value += `
export const ${e.n} = noop;`;
        }
        await fs.promises.writeFile(url, value, { encoding: "utf8" });
      })
    );
    const directories = /* @__PURE__ */ new Set();
    files.forEach((i) => {
      const splitFilePath = i.split(path.sep);
      if (splitFilePath.length > 1) {
        directories.add(splitFilePath[0]);
      }
    });
    await Promise.all(
      Array.from(directories).map(async (filename) => {
        const url = new URL(filename, out);
        const folder = await fs.promises.readdir(url);
        if (!folder.length) {
          await fs.promises.rm(url, { recursive: true, force: true });
        }
      })
    );
  }
  if (!opts.settings.config.experimental.prerender) {
    if (out.toString() !== opts.settings.config.outDir.toString()) {
      copyFiles(out, opts.settings.config.outDir);
      await fs.promises.rm(out, { recursive: true });
      return;
    }
  }
}
async function cleanServerOutput(opts) {
  const out = getOutDirWithinCwd(opts.settings.config.outDir);
  const files = await glob("**/*.mjs", {
    cwd: fileURLToPath(out)
  });
  if (files.length) {
    await Promise.all(
      files.map(async (filename) => {
        const url = new URL(filename, out);
        await fs.promises.rm(url);
      })
    );
    const directories = /* @__PURE__ */ new Set();
    files.forEach((i) => {
      const splitFilePath = i.split(path.sep);
      if (splitFilePath.length > 1) {
        directories.add(splitFilePath[0]);
      }
    });
    await Promise.all(
      Array.from(directories).map(async (filename) => {
        const url = new URL(filename, out);
        const dir = await glob(fileURLToPath(url));
        if (filename === "chunks")
          return;
        if (!dir.length) {
          await fs.promises.rm(url, { recursive: true, force: true });
        }
      })
    );
  }
  if (out.toString() !== opts.settings.config.outDir.toString()) {
    copyFiles(out, opts.settings.config.outDir);
    await fs.promises.rm(out, { recursive: true });
    return;
  }
}
async function copyFiles(fromFolder, toFolder) {
  const files = await glob("**/*", {
    cwd: fileURLToPath(fromFolder)
  });
  await Promise.all(
    files.map(async (filename) => {
      const from = new URL(filename, fromFolder);
      const to = new URL(filename, toFolder);
      const lastFolder = new URL("./", to);
      return fs.promises.mkdir(lastFolder, { recursive: true }).then(() => fs.promises.copyFile(from, to));
    })
  );
}
async function ssrMoveAssets(opts) {
  info(opts.logging, "build", "Rearranging server assets...");
  const serverRoot = opts.settings.config.output === "static" ? opts.buildConfig.client : opts.buildConfig.server;
  const clientRoot = opts.buildConfig.client;
  const serverAssets = new URL("./assets/", serverRoot);
  const clientAssets = new URL("./assets/", clientRoot);
  const files = await glob("assets/**/*", {
    cwd: fileURLToPath(serverRoot)
  });
  if (files.length > 0) {
    await fs.promises.mkdir(clientAssets, { recursive: true });
    await Promise.all(
      files.map(async (filename) => {
        const currentUrl = new URL(filename, serverRoot);
        const clientUrl = new URL(filename, clientRoot);
        return fs.promises.rename(currentUrl, clientUrl);
      })
    );
    removeDir(serverAssets);
  }
}
export {
  staticBuild
};
