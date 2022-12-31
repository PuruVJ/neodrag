import { resolvedPagesVirtualModuleId } from "../app/index.js";
function* walkParentInfos(id, ctx, until, depth = 0, order = 0, seen = /* @__PURE__ */ new Set(), childId = "") {
  seen.add(id);
  const info = ctx.getModuleInfo(id);
  if (info) {
    if (childId) {
      order += info.importedIds.indexOf(childId);
    }
    yield [info, depth, order];
  }
  if (until == null ? void 0 : until(id))
    return;
  const importers = ((info == null ? void 0 : info.importers) || []).concat((info == null ? void 0 : info.dynamicImporters) || []);
  for (const imp of importers) {
    if (seen.has(imp)) {
      continue;
    }
    yield* walkParentInfos(imp, ctx, until, ++depth, order, seen, id);
  }
}
function moduleIsTopLevelPage(info) {
  return info.importers[0] === resolvedPagesVirtualModuleId;
}
function* getTopLevelPages(id, ctx) {
  for (const res of walkParentInfos(id, ctx)) {
    if (moduleIsTopLevelPage(res[0])) {
      yield res;
    }
  }
}
export {
  getTopLevelPages,
  moduleIsTopLevelPage,
  walkParentInfos
};
