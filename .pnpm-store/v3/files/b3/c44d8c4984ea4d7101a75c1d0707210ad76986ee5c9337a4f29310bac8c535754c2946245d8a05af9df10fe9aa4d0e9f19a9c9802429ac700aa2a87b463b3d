import path from "path";
import { viteID } from "../../util.js";
import { STYLE_EXTENSIONS } from "../util.js";
import { crawlGraph } from "./vite.js";
async function getStylesForURL(filePath, loader, mode) {
  const importedCssUrls = /* @__PURE__ */ new Set();
  const importedStylesMap = /* @__PURE__ */ new Map();
  for await (const importedModule of crawlGraph(loader, viteID(filePath), true)) {
    const ext = path.extname(importedModule.url).toLowerCase();
    if (STYLE_EXTENSIONS.has(ext)) {
      let ssrModule;
      try {
        ssrModule = importedModule.ssrModule ?? await loader.import(importedModule.url);
      } catch {
        continue;
      }
      if (mode === "development" && typeof (ssrModule == null ? void 0 : ssrModule.default) === "string") {
        importedStylesMap.set(importedModule.url, ssrModule.default);
      } else {
        importedCssUrls.add(importedModule.url);
      }
    }
  }
  return {
    urls: importedCssUrls,
    stylesMap: importedStylesMap
  };
}
export {
  getStylesForURL
};
