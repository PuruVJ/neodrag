import npath from "path";
import { pathToFileURL } from "url";
import * as vite from "vite";
import loadFallbackPlugin from "../../vite-plugin-load-fallback/index.js";
import { AstroError, AstroErrorData } from "../errors/index.js";
import load from "@proload/core";
import loadTypeScript from "@proload/plugin-tsm";
load.use([loadTypeScript]);
async function createViteLoader(root, fs) {
  const viteServer = await vite.createServer({
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { entries: [] },
    clearScreen: false,
    appType: "custom",
    ssr: {
      external: ["@astrojs/tailwind", "@astrojs/mdx", "@astrojs/react"]
    },
    plugins: [loadFallbackPlugin({ fs, root: pathToFileURL(root) })]
  });
  return {
    root,
    viteServer
  };
}
async function stat(fs, configPath, mustExist) {
  try {
    await fs.promises.stat(configPath);
    return true;
  } catch {
    if (mustExist) {
      throw new AstroError({
        ...AstroErrorData.ConfigNotFound,
        message: AstroErrorData.ConfigNotFound.message(configPath)
      });
    }
    return false;
  }
}
async function search(fs, root) {
  const paths = [
    "astro.config.mjs",
    "astro.config.js",
    "astro.config.ts",
    "astro.config.mts",
    "astro.config.cjs",
    "astro.config.cjs"
  ].map((path) => npath.join(root, path));
  for (const file of paths) {
    const exists = await stat(fs, file, false);
    if (exists) {
      return file;
    }
  }
}
async function loadConfigWithVite({
  configPath,
  fs,
  root
}) {
  let file;
  if (configPath) {
    await stat(fs, configPath, true);
    file = configPath;
  } else {
    const found = await search(fs, root);
    if (!found) {
      return {
        value: {},
        filePath: void 0
      };
    } else {
      file = found;
    }
  }
  if (/\.[cm]?js$/.test(file)) {
    try {
      const config = await import(pathToFileURL(file).toString());
      return {
        value: config.default ?? {},
        filePath: file
      };
    } catch {
    }
  }
  let loader;
  try {
    loader = await createViteLoader(root, fs);
    const mod = await loader.viteServer.ssrLoadModule(file);
    return {
      value: mod.default ?? {},
      filePath: file
    };
  } catch {
    const res = await load("astro", {
      mustExist: true,
      cwd: root,
      filePath: file
    });
    return {
      value: (res == null ? void 0 : res.value) ?? {},
      filePath: file
    };
  } finally {
    if (loader) {
      await loader.viteServer.close();
    }
  }
}
export {
  loadConfigWithVite
};
