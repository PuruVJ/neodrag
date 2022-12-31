"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkN4ZBBGX4js = require('./chunk-N4ZBBGX4.js');
require('./chunk-6F4PWJZI.js');

// src/nuxt.ts
function nuxt_default(options = {}, nuxt) {
  var _a;
  const nuxtApp = (this == null ? void 0 : this.nuxt) || nuxt;
  if ((_a = nuxtApp == null ? void 0 : nuxtApp._version) == null ? void 0 : _a.startsWith("3."))
    options.compiler = "vue3";
  nuxtApp.hook("webpack:config", (configs) => {
    configs.forEach((config) => {
      config.plugins = config.plugins || [];
      config.plugins.unshift(_chunkN4ZBBGX4js.src_default.webpack(options));
    });
  });
  nuxtApp.hook("vite:extend", async (vite) => {
    vite.config.plugins = vite.config.plugins || [];
    vite.config.plugins.push(_chunkN4ZBBGX4js.src_default.vite(options));
  });
}


module.exports = nuxt_default;
exports.default = module.exports;