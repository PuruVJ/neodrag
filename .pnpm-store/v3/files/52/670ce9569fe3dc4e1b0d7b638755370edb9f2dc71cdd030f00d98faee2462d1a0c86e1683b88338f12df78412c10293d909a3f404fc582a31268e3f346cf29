"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkKU62ZDK5cjs = require('./chunk-KU62ZDK5.cjs');
require('./chunk-K625S6OX.cjs');

// src/nuxt.ts
function nuxt_default(options) {
  options.exclude = options.exclude || [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/];
  this.extendBuild((config) => {
    config.plugins = config.plugins || [];
    config.plugins.unshift(_chunkKU62ZDK5cjs.unplugin_default.webpack(options));
  });
  this.nuxt.hook("vite:extend", async (vite) => {
    vite.config.plugins = vite.config.plugins || [];
    vite.config.plugins.push(_chunkKU62ZDK5cjs.unplugin_default.vite(options));
  });
}


module.exports = nuxt_default;
exports.default = module.exports;