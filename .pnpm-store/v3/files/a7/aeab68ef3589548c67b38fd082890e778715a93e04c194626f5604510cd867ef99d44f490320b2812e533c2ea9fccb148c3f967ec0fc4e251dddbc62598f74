import { patchOverlay } from "../core/errors/overlay.js";
import { createViteLoader } from "../core/module-loader/index.js";
import { createDevelopmentEnvironment } from "../core/render/dev/index.js";
import { createRouteManifest } from "../core/routing/index.js";
import { baseMiddleware } from "./base.js";
import { createController } from "./controller.js";
import { handleRequest } from "./request.js";
function createVitePluginAstroServer({
  settings,
  logging,
  fs: fsMod
}) {
  return {
    name: "astro:server",
    configureServer(viteServer) {
      const loader = createViteLoader(viteServer);
      let env = createDevelopmentEnvironment(settings, logging, loader);
      let manifest = createRouteManifest({ settings, fsMod }, logging);
      const serverController = createController({ loader });
      function rebuildManifest(needsManifestRebuild, _file) {
        env.routeCache.clearAll();
        if (needsManifestRebuild) {
          manifest = createRouteManifest({ settings }, logging);
        }
      }
      viteServer.watcher.on("add", rebuildManifest.bind(null, true));
      viteServer.watcher.on("unlink", rebuildManifest.bind(null, true));
      viteServer.watcher.on("change", rebuildManifest.bind(null, false));
      return () => {
        if (settings.config.base !== "/") {
          viteServer.middlewares.stack.unshift({
            route: "",
            handle: baseMiddleware(settings, logging)
          });
        }
        viteServer.middlewares.use(async (req, res) => {
          if (req.url === void 0 || !req.method) {
            res.writeHead(500, "Incomplete request");
            res.end();
            return;
          }
          handleRequest(env, manifest, serverController, req, res);
        });
      };
    },
    transform(code, id, opts = {}) {
      if (opts.ssr)
        return;
      if (!id.includes("vite/dist/client/client.mjs"))
        return;
      return patchOverlay(code, settings.config);
    }
  };
}
export {
  createVitePluginAstroServer as default
};
