import { isEndpoint, isPage } from "../core/util.js";
import { normalizeFilename } from "../vite-plugin-utils/index.js";
import { scan } from "./scan.js";
function astroScannerPlugin({
  settings,
  logging
}) {
  return {
    name: "astro:scanner",
    enforce: "post",
    async transform(code, id, options) {
      if (!(options == null ? void 0 : options.ssr))
        return;
      const filename = normalizeFilename(id, settings.config);
      let fileURL;
      try {
        fileURL = new URL(`file://${filename}`);
      } catch (e) {
        return;
      }
      const fileIsPage = isPage(fileURL, settings);
      const fileIsEndpoint = isEndpoint(fileURL, settings);
      if (!(fileIsPage || fileIsEndpoint))
        return;
      const pageOptions = await scan(code, id);
      const { meta = {} } = this.getModuleInfo(id) ?? {};
      return {
        code,
        meta: {
          ...meta,
          astro: {
            ...meta.astro ?? { hydratedComponents: [], clientOnlyComponents: [], scripts: [] },
            pageOptions
          }
        }
      };
    }
  };
}
export {
  astroScannerPlugin as default
};
