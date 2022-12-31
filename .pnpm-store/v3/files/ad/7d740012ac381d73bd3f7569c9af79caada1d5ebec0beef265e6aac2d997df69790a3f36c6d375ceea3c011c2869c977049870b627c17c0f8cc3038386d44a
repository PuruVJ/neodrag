import slash from "slash";
import { fileURLToPath } from "url";
import { cachedCompilation, getCachedCompileResult } from "../core/compile/index.js";
import {
  isRelativePath,
  prependForwardSlash,
  removeLeadingForwardSlashWindows,
  startsWithForwardSlash
} from "../core/path.js";
import { viteID } from "../core/util.js";
import { normalizeFilename } from "../vite-plugin-utils/index.js";
import { cachedFullCompilation } from "./compile.js";
import { handleHotUpdate } from "./hmr.js";
import { parseAstroRequest } from "./query.js";
import { getAstroMetadata } from "./metadata.js";
function astro({ settings, logging }) {
  const { config } = settings;
  let resolvedConfig;
  const srcRootWeb = config.srcDir.pathname.slice(config.root.pathname.length - 1);
  const isBrowserPath = (path) => path.startsWith(srcRootWeb) && srcRootWeb !== "/";
  const isFullFilePath = (path) => path.startsWith(prependForwardSlash(slash(fileURLToPath(config.root))));
  function relativeToRoot(pathname) {
    const arg = startsWithForwardSlash(pathname) ? "." + pathname : pathname;
    const url = new URL(arg, config.root);
    return slash(fileURLToPath(url)) + url.search;
  }
  function resolveRelativeFromAstroParent(id, parsedFrom) {
    const filename = normalizeFilename(parsedFrom.filename, config);
    const resolvedURL = new URL(id, `file://${filename}`);
    const resolved = resolvedURL.pathname;
    if (isBrowserPath(resolved)) {
      return relativeToRoot(resolved + resolvedURL.search);
    }
    return slash(fileURLToPath(resolvedURL)) + resolvedURL.search;
  }
  return {
    name: "astro:build",
    enforce: "pre",
    configResolved(_resolvedConfig) {
      resolvedConfig = _resolvedConfig;
    },
    async resolveId(id, from, opts) {
      if (from) {
        const parsedFrom = parseAstroRequest(from);
        const isAstroScript = parsedFrom.query.astro && parsedFrom.query.type === "script";
        if (isAstroScript && isRelativePath(id)) {
          return this.resolve(resolveRelativeFromAstroParent(id, parsedFrom), from, {
            custom: opts.custom,
            skipSelf: true
          });
        }
      }
      const { query } = parseAstroRequest(id);
      if (query.astro) {
        if (query.type === "style" && isBrowserPath(id)) {
          return relativeToRoot(id);
        }
        if (query.type === "style" && id.startsWith("/@fs")) {
          id = removeLeadingForwardSlashWindows(id.slice(4));
        }
        if (isFullFilePath(id)) {
          return viteID(new URL("file://" + id));
        }
        return id;
      }
    },
    async load(id, opts) {
      const parsedId = parseAstroRequest(id);
      const query = parsedId.query;
      if (!query.astro) {
        return null;
      }
      const filename = normalizeFilename(parsedId.filename, config);
      const compileResult = getCachedCompileResult(config, filename);
      if (!compileResult) {
        return null;
      }
      switch (query.type) {
        case "style": {
          if (typeof query.index === "undefined") {
            throw new Error(`Requests for Astro CSS must include an index.`);
          }
          const code = compileResult.css[query.index];
          if (!code) {
            throw new Error(`No Astro CSS at index ${query.index}`);
          }
          return {
            code,
            meta: {
              vite: {
                isSelfAccepting: true
              }
            }
          };
        }
        case "script": {
          if (typeof query.index === "undefined") {
            throw new Error(`Requests for hoisted scripts must include an index`);
          }
          if (opts == null ? void 0 : opts.ssr) {
            return {
              code: `/* client hoisted script, empty in SSR: ${id} */`
            };
          }
          const hoistedScript = compileResult.scripts[query.index];
          if (!hoistedScript) {
            throw new Error(`No hoisted script at index ${query.index}`);
          }
          if (hoistedScript.type === "external") {
            const src = hoistedScript.src;
            if (src.startsWith("/") && !isBrowserPath(src)) {
              const publicDir = config.publicDir.pathname.replace(/\/$/, "").split("/").pop() + "/";
              throw new Error(
                `

<script src="${src}"> references an asset in the "${publicDir}" directory. Please add the "is:inline" directive to keep this asset from being bundled.

File: ${filename}`
              );
            }
          }
          const result = {
            code: "",
            meta: {
              vite: {
                lang: "ts"
              }
            }
          };
          switch (hoistedScript.type) {
            case "inline": {
              const { code, map } = hoistedScript;
              result.code = appendSourceMap(code, map);
              break;
            }
            case "external": {
              const { src } = hoistedScript;
              result.code = `import "${src}"`;
              break;
            }
          }
          return result;
        }
        default:
          return null;
      }
    },
    async transform(source, id) {
      const parsedId = parseAstroRequest(id);
      if (!id.endsWith(".astro") || parsedId.query.astro) {
        return;
      }
      if (isRelativePath(parsedId.filename)) {
        return;
      }
      const filename = normalizeFilename(parsedId.filename, config);
      const compileProps = {
        astroConfig: config,
        viteConfig: resolvedConfig,
        filename,
        id,
        source
      };
      const transformResult = await cachedFullCompilation({
        compileProps,
        rawId: id,
        logging
      });
      for (const dep of transformResult.cssDeps) {
        this.addWatchFile(dep);
      }
      const astroMetadata = {
        clientOnlyComponents: transformResult.clientOnlyComponents,
        hydratedComponents: transformResult.hydratedComponents,
        scripts: transformResult.scripts,
        propagation: "none",
        pageOptions: {}
      };
      return {
        code: transformResult.code,
        map: transformResult.map,
        meta: {
          astro: astroMetadata,
          vite: {
            lang: "ts"
          }
        }
      };
    },
    async handleHotUpdate(context) {
      var _a;
      if (context.server.config.isProduction)
        return;
      const compileProps = {
        astroConfig: config,
        viteConfig: resolvedConfig,
        filename: context.file,
        id: ((_a = context.modules[0]) == null ? void 0 : _a.id) ?? void 0,
        source: await context.read()
      };
      const compile = () => cachedCompilation(compileProps);
      return handleHotUpdate(context, {
        config,
        logging,
        compile
      });
    }
  };
}
function appendSourceMap(content, map) {
  if (!map)
    return content;
  return `${content}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,${Buffer.from(
    map
  ).toString("base64")}`;
}
export {
  astro as default,
  getAstroMetadata
};
