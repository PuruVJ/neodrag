import { prependForwardSlash } from "../../core/path.js";
import { getTopLevelPages } from "./graph.js";
import { getPageDataByViteID, trackClientOnlyPageDatas } from "./internal.js";
function vitePluginAnalyzer(internals) {
  function hoistedScriptScanner() {
    const uniqueHoistedIds = /* @__PURE__ */ new Map();
    const pageScripts = /* @__PURE__ */ new Map();
    return {
      scan(scripts, from) {
        var _a;
        const hoistedScripts = /* @__PURE__ */ new Set();
        for (let i = 0; i < scripts.length; i++) {
          const hid = `${from.replace("/@fs", "")}?astro&type=script&index=${i}&lang.ts`;
          hoistedScripts.add(hid);
        }
        if (hoistedScripts.size) {
          for (const [pageInfo] of getTopLevelPages(from, this)) {
            const pageId = pageInfo.id;
            for (const hid of hoistedScripts) {
              if (pageScripts.has(pageId)) {
                (_a = pageScripts.get(pageId)) == null ? void 0 : _a.add(hid);
              } else {
                pageScripts.set(pageId, /* @__PURE__ */ new Set([hid]));
              }
            }
          }
        }
      },
      finalize() {
        for (const [pageId, hoistedScripts] of pageScripts) {
          const pageData = getPageDataByViteID(internals, pageId);
          if (!pageData)
            continue;
          const { component } = pageData;
          const astroModuleId = prependForwardSlash(component);
          const uniqueHoistedId = JSON.stringify(Array.from(hoistedScripts).sort());
          let moduleId;
          if (uniqueHoistedIds.has(uniqueHoistedId)) {
            moduleId = uniqueHoistedIds.get(uniqueHoistedId);
          } else {
            moduleId = `/astro/hoisted.js?q=${uniqueHoistedIds.size}`;
            uniqueHoistedIds.set(uniqueHoistedId, moduleId);
          }
          internals.discoveredScripts.add(moduleId);
          if (internals.hoistedScriptIdToPagesMap.has(moduleId)) {
            const pages = internals.hoistedScriptIdToPagesMap.get(moduleId);
            pages.add(astroModuleId);
          } else {
            internals.hoistedScriptIdToPagesMap.set(moduleId, /* @__PURE__ */ new Set([astroModuleId]));
            internals.hoistedScriptIdToHoistedMap.set(moduleId, hoistedScripts);
          }
        }
      }
    };
  }
  return {
    name: "@astro/rollup-plugin-astro-analyzer",
    async generateBundle() {
      var _a;
      const hoistScanner = hoistedScriptScanner();
      const ids = this.getModuleIds();
      for (const id of ids) {
        const info = this.getModuleInfo(id);
        if (!info || !((_a = info.meta) == null ? void 0 : _a.astro))
          continue;
        const astro = info.meta.astro;
        const pageData = getPageDataByViteID(internals, id);
        if (pageData) {
          internals.pageOptionsByPage.set(id, astro.pageOptions);
        }
        for (const c of astro.hydratedComponents) {
          const rid = c.resolvedPath ? decodeURI(c.resolvedPath) : c.specifier;
          internals.discoveredHydratedComponents.add(rid);
        }
        hoistScanner.scan.call(this, astro.scripts, id);
        if (astro.clientOnlyComponents.length) {
          const clientOnlys = [];
          for (const c of astro.clientOnlyComponents) {
            const cid = c.resolvedPath ? decodeURI(c.resolvedPath) : c.specifier;
            internals.discoveredClientOnlyComponents.add(cid);
            clientOnlys.push(cid);
            const resolvedId = await this.resolve(c.specifier, id);
            if (resolvedId) {
              clientOnlys.push(resolvedId.id);
            }
          }
          for (const [pageInfo] of getTopLevelPages(id, this)) {
            const newPageData = getPageDataByViteID(internals, pageInfo.id);
            if (!newPageData)
              continue;
            trackClientOnlyPageDatas(internals, newPageData, clientOnlys);
          }
        }
      }
      hoistScanner.finalize();
    }
  };
}
export {
  vitePluginAnalyzer
};
