import {
  src_default
} from "./chunk-YZHHVA2M.mjs";
import "./chunk-WBQAMGXK.mjs";

// src/nuxt.ts
function nuxt_default(options = {}, nuxt) {
  var _a;
  const nuxtApp = (this == null ? void 0 : this.nuxt) || nuxt;
  if ((_a = nuxtApp == null ? void 0 : nuxtApp._version) == null ? void 0 : _a.startsWith("3."))
    options.compiler = "vue3";
  nuxtApp.hook("webpack:config", (configs) => {
    configs.forEach((config) => {
      config.plugins = config.plugins || [];
      config.plugins.unshift(src_default.webpack(options));
    });
  });
  nuxtApp.hook("vite:extend", async (vite) => {
    vite.config.plugins = vite.config.plugins || [];
    vite.config.plugins.push(src_default.vite(options));
  });
}
export {
  nuxt_default as default
};
