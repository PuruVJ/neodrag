import { getContentPaths } from "../../../content/index.js";
import { createEnvironment } from "../index.js";
import { RouteCache } from "../route-cache.js";
import { createResolve } from "./resolve.js";
function createDevelopmentEnvironment(settings, logging, loader) {
  var _a;
  const mode = "development";
  let env = createEnvironment({
    adapterName: (_a = settings.adapter) == null ? void 0 : _a.name,
    logging,
    markdown: {
      ...settings.config.markdown,
      isAstroFlavoredMd: settings.config.legacy.astroFlavoredMarkdown,
      isExperimentalContentCollections: settings.config.experimental.contentCollections,
      contentDir: getContentPaths(settings.config).contentDir
    },
    mode,
    renderers: [],
    resolve: createResolve(loader),
    routeCache: new RouteCache(logging, mode),
    site: settings.config.site,
    ssr: settings.config.output === "server",
    streaming: true
  });
  return {
    ...env,
    loader,
    settings
  };
}
export {
  createDevelopmentEnvironment
};
