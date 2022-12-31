import fs from "fs";
import * as colors from "kleur/colors";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { mergeConfig as mergeViteConfig } from "vite";
import { AstroError, AstroErrorData } from "../errors/index.js";
import { arraify, isObject, isURL } from "../util.js";
import { createRelativeSchema } from "./schema.js";
import { loadConfigWithVite } from "./vite-load.js";
const LEGACY_ASTRO_CONFIG_KEYS = /* @__PURE__ */ new Set([
  "projectRoot",
  "src",
  "pages",
  "public",
  "dist",
  "styleOptions",
  "markdownOptions",
  "buildOptions",
  "devOptions"
]);
async function validateConfig(userConfig, root, cmd) {
  const fileProtocolRoot = pathToFileURL(root + path.sep);
  if (userConfig.hasOwnProperty("renderers")) {
    console.error('Astro "renderers" are now "integrations"!');
    console.error("Update your configuration and install new dependencies:");
    try {
      const rendererKeywords = userConfig.renderers.map(
        (r) => r.replace("@astrojs/renderer-", "")
      );
      const rendererImports = rendererKeywords.map((r) => `  import ${r} from '@astrojs/${r === "solid" ? "solid-js" : r}';`).join("\n");
      const rendererIntegrations = rendererKeywords.map((r) => `    ${r}(),`).join("\n");
      console.error("");
      console.error(colors.dim("  // astro.config.js"));
      if (rendererImports.length > 0) {
        console.error(colors.green(rendererImports));
      }
      console.error("");
      console.error(colors.dim("  // ..."));
      if (rendererIntegrations.length > 0) {
        console.error(colors.green("  integrations: ["));
        console.error(colors.green(rendererIntegrations));
        console.error(colors.green("  ],"));
      } else {
        console.error(colors.green("  integrations: [],"));
      }
      console.error("");
    } catch (err) {
    }
    process.exit(1);
  }
  let legacyConfigKey;
  for (const key of Object.keys(userConfig)) {
    if (LEGACY_ASTRO_CONFIG_KEYS.has(key)) {
      legacyConfigKey = key;
      break;
    }
  }
  if (legacyConfigKey) {
    throw new AstroError({
      ...AstroErrorData.ConfigLegacyKey,
      message: AstroErrorData.ConfigLegacyKey.message(legacyConfigKey)
    });
  }
  const AstroConfigRelativeSchema = createRelativeSchema(cmd, fileProtocolRoot);
  const result = await AstroConfigRelativeSchema.parseAsync(userConfig);
  return result;
}
function resolveFlags(flags) {
  return {
    root: typeof flags.root === "string" ? flags.root : void 0,
    site: typeof flags.site === "string" ? flags.site : void 0,
    base: typeof flags.base === "string" ? flags.base : void 0,
    port: typeof flags.port === "number" ? flags.port : void 0,
    config: typeof flags.config === "string" ? flags.config : void 0,
    host: typeof flags.host === "string" || typeof flags.host === "boolean" ? flags.host : void 0,
    drafts: typeof flags.drafts === "boolean" ? flags.drafts : void 0,
    experimentalErrorOverlay: typeof flags.experimentalErrorOverlay === "boolean" ? flags.experimentalErrorOverlay : void 0,
    experimentalPrerender: typeof flags.experimentalPrerender === "boolean" ? flags.experimentalPrerender : void 0,
    experimentalContentCollections: typeof flags.experimentalContentCollections === "boolean" ? flags.experimentalContentCollections : void 0
  };
}
function resolveRoot(cwd) {
  if (cwd instanceof URL) {
    cwd = fileURLToPath(cwd);
  }
  return cwd ? path.resolve(cwd) : process.cwd();
}
function mergeCLIFlags(astroConfig, flags, cmd) {
  astroConfig.server = astroConfig.server || {};
  astroConfig.markdown = astroConfig.markdown || {};
  astroConfig.experimental = astroConfig.experimental || {};
  if (typeof flags.site === "string")
    astroConfig.site = flags.site;
  if (typeof flags.base === "string")
    astroConfig.base = flags.base;
  if (typeof flags.drafts === "boolean")
    astroConfig.markdown.drafts = flags.drafts;
  if (typeof flags.port === "number") {
    astroConfig.server.port = flags.port;
  }
  if (typeof flags.host === "string" || typeof flags.host === "boolean") {
    astroConfig.server.host = flags.host;
  }
  if (flags.experimentalErrorOverlay)
    astroConfig.experimental.errorOverlay = true;
  if (flags.experimentalPrerender)
    astroConfig.experimental.prerender = true;
  if (flags.experimentalContentCollections)
    astroConfig.experimental.contentCollections = true;
  return astroConfig;
}
async function resolveConfigPath(configOptions) {
  const root = resolveRoot(configOptions.cwd);
  const flags = resolveFlags(configOptions.flags || {});
  let userConfigPath;
  if (flags == null ? void 0 : flags.config) {
    userConfigPath = /^\.*\//.test(flags.config) ? flags.config : `./${flags.config}`;
    userConfigPath = fileURLToPath(new URL(userConfigPath, `file://${root}/`));
  }
  try {
    const config = await loadConfigWithVite({
      configPath: userConfigPath,
      root,
      fs: configOptions.fs
    });
    return config.filePath;
  } catch (e) {
    if (flags.config) {
      throw new AstroError({
        ...AstroErrorData.ConfigNotFound,
        message: AstroErrorData.ConfigNotFound.message(flags.config)
      });
    }
    throw e;
  }
}
async function openConfig(configOptions) {
  const root = resolveRoot(configOptions.cwd);
  const flags = resolveFlags(configOptions.flags || {});
  let userConfig = {};
  const config = await tryLoadConfig(configOptions, root);
  if (config) {
    userConfig = config.value;
  }
  const astroConfig = await resolveConfig(userConfig, root, flags, configOptions.cmd);
  return {
    astroConfig,
    userConfig,
    flags,
    root
  };
}
async function tryLoadConfig(configOptions, root) {
  const fsMod = configOptions.fsMod ?? fs;
  let finallyCleanup = async () => {
  };
  try {
    let configPath = await resolveConfigPath({
      cwd: configOptions.cwd,
      flags: configOptions.flags,
      fs: fsMod
    });
    if (!configPath)
      return void 0;
    if (configOptions.isRestart) {
      const tempConfigPath = path.join(
        root,
        `.temp.${Date.now()}.config${path.extname(configPath)}`
      );
      const currentConfigContent = await fsMod.promises.readFile(configPath, "utf-8");
      await fs.promises.writeFile(tempConfigPath, currentConfigContent);
      finallyCleanup = async () => {
        try {
          await fs.promises.unlink(tempConfigPath);
        } catch {
        }
      };
      configPath = tempConfigPath;
    }
    const config = await loadConfigWithVite({
      configPath,
      fs: fsMod,
      root
    });
    return config;
  } finally {
    await finallyCleanup();
  }
}
async function loadConfig(configOptions) {
  const root = resolveRoot(configOptions.cwd);
  const flags = resolveFlags(configOptions.flags || {});
  let userConfig = {};
  const config = await tryLoadConfig(configOptions, root);
  if (config) {
    userConfig = config.value;
  }
  return resolveConfig(userConfig, root, flags, configOptions.cmd);
}
async function resolveConfig(userConfig, root, flags = {}, cmd) {
  const mergedConfig = mergeCLIFlags(userConfig, flags, cmd);
  const validatedConfig = await validateConfig(mergedConfig, root, cmd);
  return validatedConfig;
}
function createDefaultDevConfig(userConfig = {}, root = process.cwd()) {
  return resolveConfig(userConfig, root, void 0, "dev");
}
function mergeConfigRecursively(defaults, overrides, rootPath) {
  const merged = { ...defaults };
  for (const key in overrides) {
    const value = overrides[key];
    if (value == null) {
      continue;
    }
    const existing = merged[key];
    if (existing == null) {
      merged[key] = value;
      continue;
    }
    if (key === "vite" && rootPath === "") {
      merged[key] = mergeViteConfig(existing, value);
      continue;
    }
    if (Array.isArray(existing) || Array.isArray(value)) {
      merged[key] = [...arraify(existing ?? []), ...arraify(value ?? [])];
      continue;
    }
    if (isURL(existing) && isURL(value)) {
      merged[key] = value;
      continue;
    }
    if (isObject(existing) && isObject(value)) {
      merged[key] = mergeConfigRecursively(existing, value, rootPath ? `${rootPath}.${key}` : key);
      continue;
    }
    merged[key] = value;
  }
  return merged;
}
function mergeConfig(defaults, overrides, isRoot = true) {
  return mergeConfigRecursively(defaults, overrides, isRoot ? "" : ".");
}
export {
  LEGACY_ASTRO_CONFIG_KEYS,
  createDefaultDevConfig,
  loadConfig,
  mergeConfig,
  openConfig,
  resolveConfig,
  resolveConfigPath,
  resolveFlags,
  resolveRoot,
  validateConfig
};
