import { resolve as importMetaResolve } from "import-meta-resolve";
import path from "path";
import { pathToFileURL } from "url";
const cwdUrlStr = pathToFileURL(path.join(process.cwd(), "package.json")).toString();
async function importPlugin(p) {
  if (typeof p === "string") {
    try {
      const importResult2 = await import(p);
      return importResult2.default;
    } catch {
    }
    const resolved = await importMetaResolve(p, cwdUrlStr);
    const importResult = await import(resolved);
    return importResult.default;
  }
  return p;
}
function loadPlugins(items) {
  return items.map((p) => {
    return new Promise((resolve, reject) => {
      if (Array.isArray(p)) {
        const [plugin, opts] = p;
        return importPlugin(plugin).then((m) => resolve([m, opts])).catch((e) => reject(e));
      }
      return importPlugin(p).then((m) => resolve([m])).catch((e) => reject(e));
    });
  });
}
export {
  loadPlugins
};
