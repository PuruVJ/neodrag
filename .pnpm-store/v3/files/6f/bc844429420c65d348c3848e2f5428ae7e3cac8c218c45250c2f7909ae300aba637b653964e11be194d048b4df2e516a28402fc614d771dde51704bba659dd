'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const fs = require('fs');
const unplugin$1 = require('unplugin');
const pluginutils = require('@rollup/pluginutils');
const MagicString = require('magic-string');
const context = require('./shared/unimport.50fa89e4.cjs');
require('fast-glob');
require('pathe');
require('mlly');
require('scule');
require('./shared/unimport.7b88c06e.cjs');
require('strip-literal');
require('local-pkg');
require('os');
require('pkg-types');

const defaultIncludes = [/\.[jt]sx?$/, /\.vue$/, /\.vue\?vue/, /\.svelte$/];
const defaultExcludes = [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/];
function toArray(x) {
  return x == null ? [] : Array.isArray(x) ? x : [x];
}
const unplugin = unplugin$1.createUnplugin((options = {}) => {
  const ctx = context.createUnimport(options);
  const filter = pluginutils.createFilter(
    toArray(options.include || []).length ? options.include : defaultIncludes,
    options.exclude || defaultExcludes
  );
  const dts = options.dts === true ? "unimport.d.ts" : options.dts;
  return {
    name: "unimport",
    enforce: "post",
    transformInclude(id) {
      return filter(id);
    },
    async transform(code, id) {
      const s = new MagicString(code);
      await ctx.injectImports(s, id);
      if (!s.hasChanged()) {
        return;
      }
      return {
        code: s.toString(),
        map: s.generateMap()
      };
    },
    async buildStart() {
      if (options.dirs?.length) {
        await ctx.modifyDynamicImports(async (imports) => {
          imports.push(...await context.scanDirExports(options.dirs));
        });
      }
      if (dts) {
        return fs.promises.writeFile(dts, await ctx.generateTypeDeclarations(), "utf-8");
      }
    }
  };
});

exports.default = unplugin;
exports.defaultExcludes = defaultExcludes;
exports.defaultIncludes = defaultIncludes;
