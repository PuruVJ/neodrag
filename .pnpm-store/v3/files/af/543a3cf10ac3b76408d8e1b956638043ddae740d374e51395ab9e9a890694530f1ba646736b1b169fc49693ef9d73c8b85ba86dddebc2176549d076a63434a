import fs from "fs";
import path from "path";
import resolve from "resolve";
import slash from "slash";
import { fileURLToPath, pathToFileURL } from "url";
import { normalizePath } from "vite";
import { SUPPORTED_MARKDOWN_FILE_EXTENSIONS } from "./constants.js";
import { prependForwardSlash, removeTrailingForwardSlash } from "./path.js";
function isObject(value) {
  return typeof value === "object" && value != null;
}
function isURL(value) {
  return Object.prototype.toString.call(value) === "[object URL]";
}
function isMarkdownFile(fileId, option) {
  const _suffix = (option == null ? void 0 : option.suffix) ?? "";
  for (let markdownFileExtension of SUPPORTED_MARKDOWN_FILE_EXTENSIONS) {
    if (fileId.endsWith(`${markdownFileExtension}${_suffix}`))
      return true;
  }
  return false;
}
function arraify(target) {
  return Array.isArray(target) ? target : [target];
}
function padMultilineString(source, n = 2) {
  const lines = source.split(/\r?\n/);
  return lines.map((l) => ` `.repeat(n) + l).join(`
`);
}
const REGEXP_404_OR_500_ROUTE = /(404)|(500)\/?$/;
function getOutputFilename(astroConfig, name, type) {
  if (type === "endpoint") {
    return name;
  }
  if (name === "/" || name === "") {
    return path.posix.join(name, "index.html");
  }
  if (astroConfig.build.format === "file" || REGEXP_404_OR_500_ROUTE.test(name)) {
    return `${removeTrailingForwardSlash(name || "index")}.html`;
  }
  return path.posix.join(name, "index.html");
}
function parseNpmName(spec) {
  if (!spec || spec[0] === "." || spec[0] === "/")
    return void 0;
  let scope;
  let name = "";
  let parts = spec.split("/");
  if (parts[0][0] === "@") {
    scope = parts[0];
    name = parts.shift() + "/";
  }
  name += parts.shift();
  let subpath = parts.length ? `./${parts.join("/")}` : void 0;
  return {
    scope,
    name,
    subpath
  };
}
function resolveDependency(dep, projectRoot) {
  const resolved = resolve.sync(dep, {
    basedir: fileURLToPath(projectRoot)
  });
  return pathToFileURL(resolved).toString();
}
function viteID(filePath) {
  return slash(fileURLToPath(filePath) + filePath.search).replace(/\\/g, "/");
}
const VALID_ID_PREFIX = `/@id/`;
function unwrapId(id) {
  return id.startsWith(VALID_ID_PREFIX) ? id.slice(VALID_ID_PREFIX.length) : id;
}
function resolvePages(config) {
  return new URL("./pages", config.srcDir);
}
function isInPagesDir(file, config) {
  const pagesDir = resolvePages(config);
  return file.toString().startsWith(pagesDir.toString());
}
function isPublicRoute(file, config) {
  const pagesDir = resolvePages(config);
  const parts = file.toString().replace(pagesDir.toString(), "").split("/").slice(1);
  for (const part of parts) {
    if (part.startsWith("_"))
      return false;
  }
  return true;
}
function endsWithPageExt(file, settings) {
  for (const ext of settings.pageExtensions) {
    if (file.toString().endsWith(ext))
      return true;
  }
  return false;
}
function isPage(file, settings) {
  if (!isInPagesDir(file, settings.config))
    return false;
  if (!isPublicRoute(file, settings.config))
    return false;
  return endsWithPageExt(file, settings);
}
function isEndpoint(file, settings) {
  if (!isInPagesDir(file, settings.config))
    return false;
  if (!isPublicRoute(file, settings.config))
    return false;
  return !endsWithPageExt(file, settings);
}
function isModeServerWithNoAdapter(settings) {
  return settings.config.output === "server" && !settings.adapter;
}
function relativeToSrcDir(config, idOrUrl) {
  let id;
  if (typeof idOrUrl !== "string") {
    id = unwrapId(viteID(idOrUrl));
  } else {
    id = idOrUrl;
  }
  return id.slice(slash(fileURLToPath(config.srcDir)).length);
}
function emoji(char, fallback) {
  return process.platform !== "win32" ? char : fallback;
}
function getLocalAddress(serverAddress, host) {
  if (typeof host === "boolean" || host === "localhost") {
    return "localhost";
  } else {
    return serverAddress;
  }
}
async function resolveIdToUrl(loader, id) {
  let resultId = await loader.resolveId(id, void 0);
  if (!resultId && id.endsWith(".jsx")) {
    resultId = await loader.resolveId(id.slice(0, -4), void 0);
  }
  if (!resultId) {
    return VALID_ID_PREFIX + id;
  }
  if (path.isAbsolute(resultId)) {
    return "/@fs" + prependForwardSlash(resultId);
  }
  return VALID_ID_PREFIX + resultId;
}
function resolveJsToTs(filePath) {
  if (filePath.endsWith(".jsx") && !fs.existsSync(filePath)) {
    const tryPath = filePath.slice(0, -4) + ".tsx";
    if (fs.existsSync(tryPath)) {
      return tryPath;
    }
  }
  return filePath;
}
function resolvePath(specifier, importer) {
  if (specifier.startsWith(".")) {
    const absoluteSpecifier = path.resolve(path.dirname(importer), specifier);
    return resolveJsToTs(normalizePath(absoluteSpecifier));
  } else {
    return specifier;
  }
}
export {
  VALID_ID_PREFIX,
  arraify,
  emoji,
  getLocalAddress,
  getOutputFilename,
  isEndpoint,
  isMarkdownFile,
  isModeServerWithNoAdapter,
  isObject,
  isPage,
  isURL,
  padMultilineString,
  parseNpmName,
  relativeToSrcDir,
  resolveDependency,
  resolveIdToUrl,
  resolveJsToTs,
  resolvePages,
  resolvePath,
  unwrapId,
  viteID
};
