import { pathToFileURL } from "url";
import { moduleIsTopLevelPage, walkParentInfos } from "../core/build/graph.js";
import { getPageDataByViteID } from "../core/build/internal.js";
import { createViteLoader } from "../core/module-loader/vite.js";
import { getStylesForURL } from "../core/render/dev/css.js";
import {
  contentFileExts,
  DELAYED_ASSET_FLAG,
  LINKS_PLACEHOLDER,
  STYLES_PLACEHOLDER
} from "./consts.js";
function isDelayedAsset(url) {
  return url.searchParams.has(DELAYED_ASSET_FLAG) && contentFileExts.some((ext) => url.pathname.endsWith(ext));
}
function astroDelayedAssetPlugin({ mode }) {
  let devModuleLoader;
  return {
    name: "astro-delayed-asset-plugin",
    enforce: "pre",
    configureServer(server) {
      if (mode === "dev") {
        devModuleLoader = createViteLoader(server);
      }
    },
    load(id) {
      const url = new URL(id, "file://");
      if (isDelayedAsset(url)) {
        const code = `
					export { Content, getHeadings, _internal } from ${JSON.stringify(url.pathname)};
					export const collectedLinks = ${JSON.stringify(LINKS_PLACEHOLDER)};
					export const collectedStyles = ${JSON.stringify(STYLES_PLACEHOLDER)};
				`;
        return { code };
      }
    },
    async transform(code, id, options) {
      var _a;
      if (!(options == null ? void 0 : options.ssr))
        return;
      const url = new URL(id, "file://");
      if (devModuleLoader && isDelayedAsset(url)) {
        const { pathname } = url;
        if (!((_a = devModuleLoader.getModuleById(pathname)) == null ? void 0 : _a.ssrModule)) {
          await devModuleLoader.import(pathname);
        }
        const { stylesMap, urls } = await getStylesForURL(
          pathToFileURL(pathname),
          devModuleLoader,
          "development"
        );
        return {
          code: code.replace(JSON.stringify(LINKS_PLACEHOLDER), JSON.stringify([...urls])).replace(JSON.stringify(STYLES_PLACEHOLDER), JSON.stringify([...stylesMap.values()]))
        };
      }
    }
  };
}
function astroBundleDelayedAssetPlugin({
  internals
}) {
  return {
    name: "astro-bundle-delayed-asset-plugin",
    async generateBundle(_options, bundle) {
      var _a;
      for (const [_, chunk] of Object.entries(bundle)) {
        if (chunk.type === "chunk" && chunk.code.includes(LINKS_PLACEHOLDER)) {
          for (const id of Object.keys(chunk.modules)) {
            for (const [pageInfo, depth, order] of walkParentInfos(id, this)) {
              if (moduleIsTopLevelPage(pageInfo)) {
                const pageViteID = pageInfo.id;
                const pageData = getPageDataByViteID(internals, pageViteID);
                if (!pageData)
                  continue;
                const entryCss = (_a = pageData.contentCollectionCss) == null ? void 0 : _a.get(id);
                if (!entryCss)
                  continue;
                chunk.code = chunk.code.replace(
                  JSON.stringify(LINKS_PLACEHOLDER),
                  JSON.stringify([...entryCss])
                );
              }
            }
          }
        }
      }
    }
  };
}
export {
  astroBundleDelayedAssetPlugin,
  astroDelayedAssetPlugin
};
