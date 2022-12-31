import { fileURLToPath } from "node:url";
import { invalidateCompilation, isCached } from "../core/compile/index.js";
import { info } from "../core/logger/core.js";
import * as msg from "../core/messages.js";
import { isAstroScript } from "./query.js";
const PKG_PREFIX = fileURLToPath(new URL("../../", import.meta.url));
const E2E_PREFIX = fileURLToPath(new URL("../../e2e", import.meta.url));
const isPkgFile = (id) => {
  return id && id.startsWith(PKG_PREFIX) && !id.startsWith(E2E_PREFIX);
};
async function handleHotUpdate(ctx, { config, logging, compile }) {
  let isStyleOnlyChange = false;
  if (ctx.file.endsWith(".astro") && isCached(config, ctx.file)) {
    const oldResult = await compile();
    invalidateCompilation(config, ctx.file);
    const newResult = await compile();
    if (oldResult.scope === newResult.scope) {
      isStyleOnlyChange = true;
      const styles = new Set(newResult.css);
      for (const style of oldResult.css) {
        if (styles.has(style)) {
          styles.delete(style);
        }
      }
      if (styles.size === 0) {
        return [];
      }
    }
  } else {
    invalidateCompilation(config, ctx.file);
  }
  if (isPkgFile(ctx.file)) {
    return;
  }
  const filtered = new Set(ctx.modules);
  const files = /* @__PURE__ */ new Set();
  for (const mod of ctx.modules) {
    if (isPkgFile(mod.id ?? mod.file)) {
      filtered.delete(mod);
      continue;
    }
    if (mod.file && isCached(config, mod.file)) {
      filtered.add(mod);
      files.add(mod.file);
    }
    for (const imp of mod.importers) {
      if (imp.file && isCached(config, imp.file)) {
        filtered.add(imp);
        files.add(imp.file);
      }
    }
  }
  for (const file2 of files) {
    if (isStyleOnlyChange && file2 === ctx.file)
      continue;
    invalidateCompilation(config, file2);
    if (file2.endsWith(".astro")) {
      ctx.server.moduleGraph.onFileChange(file2);
    }
  }
  const mods = ctx.modules.filter((m) => !m.url.endsWith("="));
  const file = ctx.file.replace(config.root.pathname, "/");
  if (isStyleOnlyChange) {
    info(logging, "astro", msg.hmr({ file, style: true }));
    return mods.filter((mod) => {
      var _a;
      return mod.id !== ctx.file && !((_a = mod.id) == null ? void 0 : _a.endsWith(".ts"));
    });
  }
  for (const mod of mods) {
    for (const imp of mod.importedModules) {
      if (imp.id && isAstroScript(imp.id)) {
        mods.push(imp);
      }
    }
  }
  for (const mod of filtered) {
    if (mod.id && isAstroScript(mod.id) && mod.file) {
      const astroMod = ctx.server.moduleGraph.getModuleById(mod.file);
      if (astroMod) {
        mods.unshift(astroMod);
      }
    }
  }
  const isSelfAccepting = mods.every((m) => m.isSelfAccepting || m.url.endsWith(".svelte"));
  if (isSelfAccepting) {
    if (/astro\.config\.[cm][jt]s$/.test(file))
      return mods;
    info(logging, "astro", msg.hmr({ file }));
  } else {
    info(logging, "astro", msg.reload({ file }));
  }
  return mods;
}
export {
  handleHotUpdate
};
