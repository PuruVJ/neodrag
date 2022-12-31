import { deepmerge } from "deepmerge-ts";
import { existsSync } from "fs";
import { join } from "path";
import * as tsr from "tsconfig-resolver";
const defaultTSConfig = { extends: "astro/tsconfigs/base" };
const presets = /* @__PURE__ */ new Map([
  [
    "vue",
    {
      compilerOptions: {
        jsx: "preserve"
      }
    }
  ],
  [
    "react",
    {
      compilerOptions: {
        jsx: "react-jsx",
        jsxImportSource: "react"
      }
    }
  ],
  [
    "preact",
    {
      compilerOptions: {
        jsx: "react-jsx",
        jsxImportSource: "preact"
      }
    }
  ],
  [
    "solid-js",
    {
      compilerOptions: {
        jsx: "preserve",
        jsxImportSource: "solid-js"
      }
    }
  ]
]);
function loadTSConfig(cwd, resolve = true) {
  cwd = cwd ?? process.cwd();
  let config = tsr.tsconfigResolverSync({
    cwd,
    filePath: resolve ? void 0 : cwd,
    ignoreExtends: !resolve
  });
  if (!resolve && config.reason === "invalid-config" && !existsSync(join(cwd, "tsconfig.json"))) {
    config = { reason: "not-found", path: void 0, exists: false };
  }
  if (config.reason === "not-found") {
    const jsconfig = tsr.tsconfigResolverSync({
      cwd,
      filePath: resolve ? void 0 : cwd,
      searchName: "jsconfig.json",
      ignoreExtends: !resolve
    });
    if (!resolve && jsconfig.reason === "invalid-config" && !existsSync(join(cwd, "jsconfig.json"))) {
      return { reason: "not-found", path: void 0, exists: false };
    }
    return jsconfig;
  }
  return config;
}
function updateTSConfigForFramework(target, framework) {
  if (!presets.has(framework)) {
    return target;
  }
  return deepmerge(target, presets.get(framework));
}
export {
  defaultTSConfig,
  loadTSConfig,
  presets,
  updateTSConfigForFramework
};
