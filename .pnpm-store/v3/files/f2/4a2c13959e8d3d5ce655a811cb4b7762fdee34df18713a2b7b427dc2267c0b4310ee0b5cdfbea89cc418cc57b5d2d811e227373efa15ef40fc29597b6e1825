import matter from "gray-matter";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { z } from "zod";
import { AstroError, AstroErrorData } from "../core/errors/index.js";
import { astroContentVirtualModPlugin } from "./vite-plugin-content-virtual-mod.js";
const collectionConfigParser = z.object({
  schema: z.any().optional(),
  slug: z.function().args(
    z.object({
      id: z.string(),
      collection: z.string(),
      defaultSlug: z.string(),
      body: z.string(),
      data: z.record(z.any())
    })
  ).returns(z.union([z.string(), z.promise(z.string())])).optional()
});
const contentConfigParser = z.object({
  collections: z.record(collectionConfigParser)
});
const msg = {
  collectionConfigMissing: (collection) => `${collection} does not have a config. We suggest adding one for type safety!`
};
async function getEntrySlug(entry, collectionConfig) {
  var _a;
  return ((_a = collectionConfig.slug) == null ? void 0 : _a.call(collectionConfig, {
    id: entry.id,
    data: entry.data,
    defaultSlug: entry.slug,
    collection: entry.collection,
    body: entry.body
  })) ?? entry.slug;
}
async function getEntryData(entry, collectionConfig) {
  let data = entry.data;
  if (collectionConfig.schema) {
    const parsed = await z.object(collectionConfig.schema).safeParseAsync(entry.data, { errorMap });
    if (parsed.success) {
      data = parsed.data;
    } else {
      const formattedError = new AstroError({
        ...AstroErrorData.MarkdownContentSchemaValidationError,
        message: AstroErrorData.MarkdownContentSchemaValidationError.message(
          entry.collection,
          entry.id,
          parsed.error
        ),
        location: {
          file: entry._internal.filePath,
          line: getFrontmatterErrorLine(
            entry._internal.rawData,
            String(parsed.error.errors[0].path[0])
          ),
          column: 0
        }
      });
      throw formattedError;
    }
  }
  return data;
}
const flattenPath = (path) => path.join(".");
const errorMap = (error, ctx) => {
  if (error.code === "invalid_type") {
    const badKeyPath = JSON.stringify(flattenPath(error.path));
    if (error.received === "undefined") {
      return { message: `${badKeyPath} is required.` };
    } else {
      return { message: `${badKeyPath} should be ${error.expected}, not ${error.received}.` };
    }
  }
  return { message: ctx.defaultError };
};
function getFrontmatterErrorLine(rawFrontmatter, frontmatterKey) {
  const indexOfFrontmatterKey = rawFrontmatter.indexOf(`
${frontmatterKey}`);
  if (indexOfFrontmatterKey === -1)
    return 0;
  const frontmatterBeforeKey = rawFrontmatter.substring(0, indexOfFrontmatterKey + 1);
  const numNewlinesBeforeKey = frontmatterBeforeKey.split("\n").length;
  return numNewlinesBeforeKey;
}
function parseFrontmatter(fileContents, filePath) {
  try {
    matter.clearCache();
    return matter(fileContents);
  } catch (e) {
    if (e.name === "YAMLException") {
      const err = e;
      err.id = filePath;
      err.loc = { file: e.id, line: e.mark.line + 1, column: e.mark.column };
      err.message = e.reason;
      throw err;
    } else {
      throw e;
    }
  }
}
class NotFoundError extends TypeError {
}
class ZodParseError extends TypeError {
}
async function loadContentConfig({
  fs,
  settings
}) {
  const contentPaths = getContentPaths({ srcDir: settings.config.srcDir });
  const tempConfigServer = await createServer({
    root: fileURLToPath(settings.config.root),
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { entries: [] },
    clearScreen: false,
    appType: "custom",
    logLevel: "silent",
    plugins: [astroContentVirtualModPlugin({ settings })]
  });
  let unparsedConfig;
  try {
    unparsedConfig = await tempConfigServer.ssrLoadModule(contentPaths.config.pathname);
  } catch {
    return new NotFoundError("Failed to resolve content config.");
  } finally {
    await tempConfigServer.close();
  }
  const config = contentConfigParser.safeParse(unparsedConfig);
  if (config.success) {
    return config.data;
  } else {
    return new ZodParseError("Content config file is invalid.");
  }
}
function contentObservable(initialCtx) {
  const subscribers = /* @__PURE__ */ new Set();
  let ctx = initialCtx;
  function get() {
    return ctx;
  }
  function set(_ctx) {
    ctx = _ctx;
    subscribers.forEach((fn) => fn(ctx));
  }
  function subscribe(fn) {
    subscribers.add(fn);
    return () => {
      subscribers.delete(fn);
    };
  }
  return {
    get,
    set,
    subscribe
  };
}
function getContentPaths({ srcDir }) {
  return {
    cacheDir: new URL("./content/", srcDir),
    contentDir: new URL("./content/", srcDir),
    generatedInputDir: new URL("../../src/content/template/", import.meta.url),
    config: new URL("./content/config", srcDir)
  };
}
export {
  NotFoundError,
  ZodParseError,
  collectionConfigParser,
  contentConfigParser,
  contentObservable,
  getContentPaths,
  getEntryData,
  getEntrySlug,
  loadContentConfig,
  msg,
  parseFrontmatter
};
