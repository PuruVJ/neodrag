import { promises } from 'fs';
import { createUnplugin } from 'unplugin';
import { createFilter } from '@rollup/pluginutils';
import MagicString from 'magic-string';
import { d as createUnimport, s as scanDirExports } from './shared/unimport.d5d80c71.mjs';
import 'fast-glob';
import 'pathe';
import 'mlly';
import 'scule';
import './shared/unimport.bbd7571a.mjs';
import 'strip-literal';
import 'local-pkg';
import 'os';
import 'pkg-types';

const defaultIncludes = [/\.[jt]sx?$/, /\.vue$/, /\.vue\?vue/, /\.svelte$/];
const defaultExcludes = [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/];
function toArray(x) {
  return x == null ? [] : Array.isArray(x) ? x : [x];
}
const unplugin = createUnplugin((options = {}) => {
  const ctx = createUnimport(options);
  const filter = createFilter(
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
          imports.push(...await scanDirExports(options.dirs));
        });
      }
      if (dts) {
        return promises.writeFile(dts, await ctx.generateTypeDeclarations(), "utf-8");
      }
    }
  };
});

export { unplugin as default, defaultExcludes, defaultIncludes };
