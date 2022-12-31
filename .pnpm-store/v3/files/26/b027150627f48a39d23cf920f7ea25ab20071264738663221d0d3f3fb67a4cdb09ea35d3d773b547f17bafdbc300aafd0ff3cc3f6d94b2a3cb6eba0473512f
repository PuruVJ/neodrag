import crypto from "crypto";
import npath from "path";
import { viteID } from "../util.js";
import { getTopLevelPages } from "./graph.js";
function shortHashedName(id, ctx) {
  var _a;
  const parents = Array.from(getTopLevelPages(id, ctx));
  const firstParentId = (_a = parents[0]) == null ? void 0 : _a[0].id;
  const firstParentName = firstParentId ? npath.parse(firstParentId).name : "index";
  const hash = crypto.createHash("sha256");
  for (const [page] of parents) {
    hash.update(page.id, "utf-8");
  }
  const h = hash.digest("hex").slice(0, 8);
  const proposedName = firstParentName + "." + h;
  return proposedName;
}
function createSlugger(settings) {
  const pagesDir = viteID(new URL("./pages", settings.config.srcDir));
  const indexPage = viteID(new URL("./pages/index", settings.config.srcDir));
  const map = /* @__PURE__ */ new Map();
  const sep = "-";
  return function(id, ctx) {
    var _a;
    const parents = Array.from(getTopLevelPages(id, ctx));
    const allParentsKey = parents.map(([page]) => page.id).sort().join("-");
    const firstParentId = ((_a = parents[0]) == null ? void 0 : _a[0].id) || indexPage;
    let dir = firstParentId;
    let key = "";
    let i = 0;
    while (i < 2) {
      if (dir === pagesDir) {
        break;
      }
      const name2 = npath.parse(npath.basename(dir)).name;
      key = key.length ? name2 + sep + key : name2;
      dir = npath.dirname(dir);
      i++;
    }
    let name = key;
    if (!map.has(key)) {
      map.set(key, /* @__PURE__ */ new Map([[allParentsKey, 0]]));
    } else {
      const inner = map.get(key);
      if (inner.has(allParentsKey)) {
        const num = inner.get(allParentsKey);
        if (num > 0) {
          name = name + sep + num;
        }
      } else {
        const num = inner.size;
        inner.set(allParentsKey, num);
        name = name + sep + num;
      }
    }
    return name;
  };
}
export {
  createSlugger,
  shortHashedName
};
