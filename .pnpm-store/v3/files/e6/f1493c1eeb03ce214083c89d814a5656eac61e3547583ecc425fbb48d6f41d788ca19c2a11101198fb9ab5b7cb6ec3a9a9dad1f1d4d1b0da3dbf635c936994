import glob from "fast-glob";
import { cyan } from "kleur/colors";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { normalizePath } from "vite";
import { info, warn } from "../core/logger/core.js";
import { appendForwardSlash, isRelativePath } from "../core/path.js";
import { contentFileExts, CONTENT_TYPES_FILE } from "./consts.js";
import {
  getContentPaths,
  loadContentConfig
} from "./utils.js";
class UnsupportedFileTypeError extends Error {
}
async function createContentTypesGenerator({
  contentConfigObserver,
  fs,
  logging,
  settings
}) {
  const contentTypes = {};
  const contentPaths = getContentPaths({ srcDir: settings.config.srcDir });
  let events = [];
  let debounceTimeout;
  const contentTypesBase = await fs.promises.readFile(
    new URL(CONTENT_TYPES_FILE, contentPaths.generatedInputDir),
    "utf-8"
  );
  async function init() {
    await handleEvent({ name: "add", entry: contentPaths.config }, { logLevel: "warn" });
    const globResult = await glob("./**/*.*", {
      cwd: fileURLToPath(contentPaths.contentDir),
      fs: {
        readdir: fs.readdir.bind(fs),
        readdirSync: fs.readdirSync.bind(fs)
      }
    });
    const entries = globResult.map((e) => new URL(e, contentPaths.contentDir)).filter(
      (e) => !e.href.startsWith(contentPaths.config.href)
    );
    for (const entry of entries) {
      events.push(handleEvent({ name: "add", entry }, { logLevel: "warn" }));
    }
    await runEvents();
  }
  async function handleEvent(event, opts) {
    const logLevel = (opts == null ? void 0 : opts.logLevel) ?? "info";
    if (event.name === "addDir" || event.name === "unlinkDir") {
      const collection2 = normalizePath(
        path.relative(fileURLToPath(contentPaths.contentDir), fileURLToPath(event.entry))
      );
      const isCollectionEvent = collection2.split("/").length === 1;
      if (!isCollectionEvent)
        return { shouldGenerateTypes: false };
      switch (event.name) {
        case "addDir":
          addCollection(contentTypes, JSON.stringify(collection2));
          if (logLevel === "info") {
            info(logging, "content", `${cyan(collection2)} collection added`);
          }
          break;
        case "unlinkDir":
          removeCollection(contentTypes, JSON.stringify(collection2));
          break;
      }
      return { shouldGenerateTypes: true };
    }
    const fileType = getEntryType(fileURLToPath(event.entry), contentPaths);
    if (fileType === "generated-types") {
      return { shouldGenerateTypes: false };
    }
    if (fileType === "config") {
      contentConfigObserver.set({ status: "loading" });
      const config = await loadContentConfig({ fs, settings });
      if (config instanceof Error) {
        contentConfigObserver.set({ status: "error", error: config });
      } else {
        contentConfigObserver.set({ status: "loaded", config });
      }
      return { shouldGenerateTypes: true };
    }
    const entryInfo = getEntryInfo({
      entry: event.entry,
      contentDir: contentPaths.contentDir
    });
    if (entryInfo instanceof Error)
      return { shouldGenerateTypes: false };
    if (fileType === "unknown") {
      if (entryInfo.id.startsWith("_") && (event.name === "add" || event.name === "change")) {
        return { shouldGenerateTypes: false };
      } else {
        return {
          shouldGenerateTypes: false,
          error: new UnsupportedFileTypeError(entryInfo.id)
        };
      }
    }
    if (entryInfo.collection === ".") {
      if (["info", "warn"].includes(logLevel)) {
        warn(
          logging,
          "content",
          `${cyan(
            normalizePath(
              path.relative(fileURLToPath(contentPaths.contentDir), fileURLToPath(event.entry))
            )
          )} must be nested in a collection directory. Skipping.`
        );
      }
      return { shouldGenerateTypes: false };
    }
    const { id, slug, collection } = entryInfo;
    const collectionKey = JSON.stringify(collection);
    const entryKey = JSON.stringify(id);
    switch (event.name) {
      case "add":
        if (!(collectionKey in contentTypes)) {
          addCollection(contentTypes, collectionKey);
        }
        if (!(entryKey in contentTypes[collectionKey])) {
          addEntry(contentTypes, collectionKey, entryKey, slug);
        }
        return { shouldGenerateTypes: true };
      case "unlink":
        if (collectionKey in contentTypes && entryKey in contentTypes[collectionKey]) {
          removeEntry(contentTypes, collectionKey, entryKey);
        }
        return { shouldGenerateTypes: true };
      case "change":
        return { shouldGenerateTypes: false };
    }
  }
  function queueEvent(rawEvent, opts) {
    const event = {
      entry: pathToFileURL(rawEvent.entry),
      name: rawEvent.name
    };
    if (!event.entry.pathname.startsWith(contentPaths.contentDir.pathname))
      return;
    events.push(handleEvent(event, opts));
    debounceTimeout && clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(
      async () => runEvents(opts),
      50
    );
  }
  async function runEvents(opts) {
    const logLevel = (opts == null ? void 0 : opts.logLevel) ?? "info";
    const eventResponses = await Promise.all(events);
    events = [];
    let unsupportedFiles = [];
    for (const response of eventResponses) {
      if (response.error instanceof UnsupportedFileTypeError) {
        unsupportedFiles.push(response.error.message);
      }
    }
    if (unsupportedFiles.length > 0 && ["info", "warn"].includes(logLevel)) {
      warn(
        logging,
        "content",
        `Unsupported file types found. Prefix with an underscore (\`_\`) to ignore:
- ${unsupportedFiles.join(
          "\n"
        )}`
      );
    }
    const observable = contentConfigObserver.get();
    if (eventResponses.some((r) => r.shouldGenerateTypes)) {
      await writeContentFiles({
        fs,
        contentTypes,
        contentPaths,
        contentTypesBase,
        contentConfig: observable.status === "loaded" ? observable.config : void 0
      });
      if (observable.status === "loaded" && ["info", "warn"].includes(logLevel)) {
        warnNonexistentCollections({
          logging,
          contentConfig: observable.config,
          contentTypes
        });
      }
    }
  }
  return { init, queueEvent };
}
function addCollection(contentMap, collectionKey) {
  contentMap[collectionKey] = {};
}
function removeCollection(contentMap, collectionKey) {
  delete contentMap[collectionKey];
}
function addEntry(contentTypes, collectionKey, entryKey, slug) {
  contentTypes[collectionKey][entryKey] = { slug };
}
function removeEntry(contentTypes, collectionKey, entryKey) {
  delete contentTypes[collectionKey][entryKey];
}
function getEntryInfo({
  entry,
  contentDir
}) {
  const rawRelativePath = path.relative(fileURLToPath(contentDir), fileURLToPath(entry));
  const rawCollection = path.dirname(rawRelativePath).split(path.sep).shift();
  if (!rawCollection)
    return new Error();
  const rawId = path.relative(rawCollection, rawRelativePath);
  const rawSlug = rawId.replace(path.extname(rawId), "");
  const res = {
    id: normalizePath(rawId),
    slug: normalizePath(rawSlug),
    collection: normalizePath(rawCollection)
  };
  return res;
}
function getEntryType(entryPath, paths) {
  const { dir: rawDir, ext, name, base } = path.parse(entryPath);
  const dir = appendForwardSlash(pathToFileURL(rawDir).href);
  if (contentFileExts.includes(ext)) {
    return "content";
  } else if (new URL(name, dir).pathname === paths.config.pathname) {
    return "config";
  } else if (new URL(base, dir).pathname === new URL(CONTENT_TYPES_FILE, paths.cacheDir).pathname) {
    return "generated-types";
  } else {
    return "unknown";
  }
}
async function writeContentFiles({
  fs,
  contentPaths,
  contentTypes,
  contentTypesBase,
  contentConfig
}) {
  let contentTypesStr = "";
  const collectionKeys = Object.keys(contentTypes).sort();
  for (const collectionKey of collectionKeys) {
    const collectionConfig = contentConfig == null ? void 0 : contentConfig.collections[JSON.parse(collectionKey)];
    contentTypesStr += `${collectionKey}: {
`;
    const entryKeys = Object.keys(contentTypes[collectionKey]).sort();
    for (const entryKey of entryKeys) {
      const entryMetadata = contentTypes[collectionKey][entryKey];
      const dataType = (collectionConfig == null ? void 0 : collectionConfig.schema) ? `InferEntrySchema<${collectionKey}>` : "any";
      const slugType = (collectionConfig == null ? void 0 : collectionConfig.slug) ? "string" : JSON.stringify(entryMetadata.slug);
      contentTypesStr += `${entryKey}: {
  id: ${entryKey},
  slug: ${slugType},
  body: string,
  collection: ${collectionKey},
  data: ${dataType}
},
`;
    }
    contentTypesStr += `},
`;
  }
  let configPathRelativeToCacheDir = normalizePath(
    path.relative(contentPaths.cacheDir.pathname, contentPaths.config.pathname)
  );
  if (!isRelativePath(configPathRelativeToCacheDir))
    configPathRelativeToCacheDir = "./" + configPathRelativeToCacheDir;
  contentTypesBase = contentTypesBase.replace("// @@ENTRY_MAP@@", contentTypesStr);
  contentTypesBase = contentTypesBase.replace(
    "'@@CONTENT_CONFIG_TYPE@@'",
    contentConfig ? `typeof import(${JSON.stringify(configPathRelativeToCacheDir)})` : "never"
  );
  await fs.promises.writeFile(new URL(CONTENT_TYPES_FILE, contentPaths.cacheDir), contentTypesBase);
}
function warnNonexistentCollections({
  contentConfig,
  contentTypes,
  logging
}) {
  for (const configuredCollection in contentConfig.collections) {
    if (!contentTypes[JSON.stringify(configuredCollection)]) {
      warn(
        logging,
        "content",
        `${JSON.stringify(
          configuredCollection
        )} is not a collection. Check your content config for typos.`
      );
    }
  }
}
export {
  createContentTypesGenerator,
  getEntryInfo,
  getEntryType
};
