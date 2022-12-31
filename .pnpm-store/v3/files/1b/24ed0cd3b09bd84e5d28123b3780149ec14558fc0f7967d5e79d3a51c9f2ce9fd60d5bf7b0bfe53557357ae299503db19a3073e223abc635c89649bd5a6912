import npath from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { appendForwardSlash } from "../../core/path.js";
const STATUS_CODE_PAGES = /* @__PURE__ */ new Set(["/404", "/500"]);
const FALLBACK_OUT_DIR_NAME = "./.astro/";
function getOutRoot(astroConfig) {
  if (astroConfig.output === "static") {
    return new URL("./", astroConfig.outDir);
  } else {
    return new URL("./", astroConfig.build.client);
  }
}
function getOutFolder(astroConfig, pathname, routeType) {
  const outRoot = getOutRoot(astroConfig);
  switch (routeType) {
    case "endpoint":
      return new URL("." + appendForwardSlash(npath.dirname(pathname)), outRoot);
    case "page":
      switch (astroConfig.build.format) {
        case "directory": {
          if (STATUS_CODE_PAGES.has(pathname)) {
            return new URL("." + appendForwardSlash(npath.dirname(pathname)), outRoot);
          }
          return new URL("." + appendForwardSlash(pathname), outRoot);
        }
        case "file": {
          const d = pathname === "" ? pathname : npath.dirname(pathname);
          return new URL("." + appendForwardSlash(d), outRoot);
        }
      }
  }
}
function getOutFile(astroConfig, outFolder, pathname, routeType) {
  switch (routeType) {
    case "endpoint":
      return new URL(npath.basename(pathname), outFolder);
    case "page":
      switch (astroConfig.build.format) {
        case "directory": {
          if (STATUS_CODE_PAGES.has(pathname)) {
            const baseName = npath.basename(pathname);
            return new URL("./" + (baseName || "index") + ".html", outFolder);
          }
          return new URL("./index.html", outFolder);
        }
        case "file": {
          const baseName = npath.basename(pathname);
          return new URL("./" + (baseName || "index") + ".html", outFolder);
        }
      }
  }
}
function getOutDirWithinCwd(outDir) {
  if (fileURLToPath(outDir).startsWith(process.cwd())) {
    return outDir;
  } else {
    return new URL(FALLBACK_OUT_DIR_NAME, pathToFileURL(process.cwd() + npath.sep));
  }
}
export {
  getOutDirWithinCwd,
  getOutFile,
  getOutFolder
};
