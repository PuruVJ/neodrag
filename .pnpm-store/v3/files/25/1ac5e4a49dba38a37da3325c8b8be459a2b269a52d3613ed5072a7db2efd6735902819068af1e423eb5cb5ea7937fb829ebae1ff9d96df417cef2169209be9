function vitePluginInternals(input, internals) {
  return {
    name: "@astro/plugin-build-internals",
    config(config, options) {
      var _a;
      const extra = {};
      const noExternal = [], external = [];
      if (options.command === "build" && ((_a = config.build) == null ? void 0 : _a.ssr)) {
        noExternal.push("astro");
        external.push("shiki");
      }
      extra.ssr = {
        external,
        noExternal
      };
      return extra;
    },
    configResolved(resolvedConfig) {
      const plugins = resolvedConfig.plugins;
      const viteAsset = plugins.find((p) => p.name === "vite:asset");
      if (viteAsset) {
        delete viteAsset.generateBundle;
      }
    },
    async generateBundle(_options, bundle) {
      const promises = [];
      const mapping = /* @__PURE__ */ new Map();
      for (const specifier of input) {
        promises.push(
          this.resolve(specifier).then((result) => {
            if (result) {
              mapping.set(result.id, specifier);
            }
          })
        );
      }
      await Promise.all(promises);
      for (const [, chunk] of Object.entries(bundle)) {
        if (chunk.type === "chunk" && chunk.facadeModuleId) {
          const specifier = mapping.get(chunk.facadeModuleId) || chunk.facadeModuleId;
          internals.entrySpecifierToBundleMap.set(specifier, chunk.fileName);
        } else if (chunk.type === "chunk") {
          for (const id of Object.keys(chunk.modules)) {
            const pageData = internals.pagesByViteID.get(id);
            if (pageData) {
              internals.pageToBundleMap.set(pageData.moduleSpecifier, chunk.fileName);
            }
          }
        }
      }
    }
  };
}
export {
  vitePluginInternals
};
