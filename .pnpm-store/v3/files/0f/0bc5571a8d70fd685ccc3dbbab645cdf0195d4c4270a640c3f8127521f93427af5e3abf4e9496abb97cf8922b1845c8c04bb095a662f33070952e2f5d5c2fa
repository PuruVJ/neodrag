import { getAstroMetadata } from "../../../vite-plugin-astro/index.js";
import { viteID } from "../../util.js";
import { crawlGraph } from "./vite.js";
async function getPropagationMap(filePath, loader) {
  const map = /* @__PURE__ */ new Map();
  const rootID = viteID(filePath);
  addInjection(map, loader.getModuleInfo(rootID));
  for await (const moduleNode of crawlGraph(loader, rootID, true)) {
    const id = moduleNode.id;
    if (id) {
      addInjection(map, loader.getModuleInfo(id));
    }
  }
  return map;
}
function addInjection(map, modInfo) {
  if (modInfo) {
    const astro = getAstroMetadata(modInfo);
    if (astro && astro.propagation) {
      map.set(modInfo.id, astro.propagation);
    }
  }
}
export {
  getPropagationMap
};
