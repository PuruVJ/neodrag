import { pagesVirtualModuleId, resolvedPagesVirtualModuleId } from "../app/index.js";
import { addRollupInput } from "./add-rollup-input.js";
import { eachPageData, hasPrerenderedPages } from "./internal.js";
function vitePluginPages(opts, internals) {
  return {
    name: "@astro/plugin-build-pages",
    options(options) {
      if (opts.settings.config.output === "static" || hasPrerenderedPages(internals)) {
        return addRollupInput(options, [pagesVirtualModuleId]);
      }
    },
    resolveId(id) {
      if (id === pagesVirtualModuleId) {
        return resolvedPagesVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedPagesVirtualModuleId) {
        let importMap = "";
        let imports = [];
        let i = 0;
        for (const pageData of eachPageData(internals)) {
          const variable = `_page${i}`;
          imports.push(`import * as ${variable} from ${JSON.stringify(pageData.moduleSpecifier)};`);
          importMap += `[${JSON.stringify(pageData.component)}, ${variable}],`;
          i++;
        }
        i = 0;
        let rendererItems = "";
        for (const renderer of opts.settings.renderers) {
          const variable = `_renderer${i}`;
          imports.unshift(`import ${variable} from '${renderer.serverEntrypoint}';`);
          rendererItems += `Object.assign(${JSON.stringify(renderer)}, { ssr: ${variable} }),`;
          i++;
        }
        const def = `${imports.join("\n")}

export const pageMap = new Map([${importMap}]);
export const renderers = [${rendererItems}];`;
        return def;
      }
    }
  };
}
export {
  vitePluginPages
};
