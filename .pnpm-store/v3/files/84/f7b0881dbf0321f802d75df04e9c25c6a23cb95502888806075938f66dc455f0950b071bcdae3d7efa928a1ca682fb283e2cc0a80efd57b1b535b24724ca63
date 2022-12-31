import { getAstroMetadata } from "../vite-plugin-astro/index.js";
const injectExp = /^\/\/\s*astro-head-inject/;
function configHeadPropagationVitePlugin({
  settings
}) {
  function addHeadInjectionInTree(graph, id, getInfo, seen = /* @__PURE__ */ new Set()) {
    const mod = server.moduleGraph.getModuleById(id);
    for (const parent of (mod == null ? void 0 : mod.importers) || []) {
      if (parent.id) {
        if (seen.has(parent.id)) {
          continue;
        } else {
          seen.add(parent.id);
        }
        const info = getInfo(parent.id);
        if (info == null ? void 0 : info.meta.astro) {
          const astroMetadata = getAstroMetadata(info);
          if (astroMetadata) {
            astroMetadata.propagation = "in-tree";
          }
        }
        addHeadInjectionInTree(graph, parent.id, getInfo, seen);
      }
    }
  }
  let server;
  return {
    name: "astro:head-propagation",
    configureServer(_server) {
      server = _server;
    },
    transform(source, id) {
      if (!server) {
        return;
      }
      if (injectExp.test(source)) {
        addHeadInjectionInTree(server.moduleGraph, id, (child) => this.getModuleInfo(child));
      }
    }
  };
}
export {
  configHeadPropagationVitePlugin as default
};
