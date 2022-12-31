function vitePluginPrerender(opts, internals) {
  return {
    name: "astro:rollup-plugin-prerender",
    outputOptions(outputOptions) {
      if (!opts.settings.config.experimental.prerender)
        return;
      const manualChunks = outputOptions.manualChunks || Function.prototype;
      outputOptions.manualChunks = function(id, api, ...args) {
        var _a, _b, _c;
        if (typeof manualChunks == "object") {
          if (id in manualChunks) {
            return manualChunks[id];
          }
        } else if (typeof manualChunks === "function") {
          const outid = manualChunks.call(this, id, api, ...args);
          if (outid) {
            return outid;
          }
        }
        if (id.includes("astro/dist")) {
          return "astro";
        }
        const pageInfo = internals.pagesByViteID.get(id);
        if (pageInfo) {
          if ((_c = (_b = (_a = api.getModuleInfo(id)) == null ? void 0 : _a.meta.astro) == null ? void 0 : _b.pageOptions) == null ? void 0 : _c.prerender) {
            return `prerender`;
          }
          return `pages${pageInfo.route.route.replace(/\/$/, "/index")}`;
        }
      };
    }
  };
}
export {
  vitePluginPrerender
};
