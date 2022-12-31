import MagicString from "magic-string";
import { isPage } from "../core/util.js";
import { normalizeFilename } from "../vite-plugin-utils/index.js";
import { PAGE_SSR_SCRIPT_ID } from "./index.js";
function astroScriptsPostPlugin({
  settings
}) {
  return {
    name: "astro:scripts:page-ssr",
    enforce: "post",
    transform(code, id, options) {
      if (!(options == null ? void 0 : options.ssr))
        return;
      const hasInjectedScript = settings.scripts.some((s2) => s2.stage === "page-ssr");
      if (!hasInjectedScript)
        return;
      const filename = normalizeFilename(id, settings.config);
      let fileURL;
      try {
        fileURL = new URL(`file://${filename}`);
      } catch (e) {
        return;
      }
      const fileIsPage = isPage(fileURL, settings);
      if (!fileIsPage)
        return;
      const s = new MagicString(code, { filename });
      s.prepend(`import '${PAGE_SSR_SCRIPT_ID}';
`);
      return {
        code: s.toString(),
        map: s.generateMap()
      };
    }
  };
}
export {
  astroScriptsPostPlugin as default
};
