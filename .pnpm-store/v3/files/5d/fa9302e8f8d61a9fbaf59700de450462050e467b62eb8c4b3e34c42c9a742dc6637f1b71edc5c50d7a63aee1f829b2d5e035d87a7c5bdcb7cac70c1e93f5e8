import { bold } from "kleur/colors";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "../core/config/config.js";
import { info, warn } from "../core/logger/core.js";
async function withTakingALongTimeMsg({
  name,
  hookResult,
  timeoutMs = 3e3,
  logging
}) {
  const timeout = setTimeout(() => {
    info(logging, "build", `Waiting for the ${bold(name)} integration...`);
  }, timeoutMs);
  const result = await hookResult;
  clearTimeout(timeout);
  return result;
}
async function runHookConfigSetup({
  settings,
  command,
  logging,
  isRestart = false
}) {
  var _a;
  if (settings.config.adapter) {
    settings.config.integrations.push(settings.config.adapter);
  }
  let updatedConfig = { ...settings.config };
  let updatedSettings = { ...settings, config: updatedConfig };
  for (const integration of settings.config.integrations) {
    if ((_a = integration == null ? void 0 : integration.hooks) == null ? void 0 : _a["astro:config:setup"]) {
      let addPageExtension2 = function(...input) {
        const exts = input.flat(Infinity).map((ext) => `.${ext.replace(/^\./, "")}`);
        updatedSettings.pageExtensions.push(...exts);
      };
      var addPageExtension = addPageExtension2;
      const hooks = {
        config: updatedConfig,
        command,
        isRestart,
        addRenderer(renderer) {
          if (!renderer.name) {
            throw new Error(`Integration ${bold(integration.name)} has an unnamed renderer.`);
          }
          if (!renderer.serverEntrypoint) {
            throw new Error(`Renderer ${bold(renderer.name)} does not provide a serverEntrypoint.`);
          }
          updatedSettings.renderers.push(renderer);
        },
        injectScript: (stage, content) => {
          updatedSettings.scripts.push({ stage, content });
        },
        updateConfig: (newConfig) => {
          updatedConfig = mergeConfig(updatedConfig, newConfig);
        },
        injectRoute: (injectRoute) => {
          updatedSettings.injectedRoutes.push(injectRoute);
        },
        addWatchFile: (path) => {
          updatedSettings.watchFiles.push(path instanceof URL ? fileURLToPath(path) : path);
        }
      };
      Object.defineProperty(hooks, "addPageExtension", {
        value: addPageExtension2,
        writable: false,
        enumerable: false
      });
      await withTakingALongTimeMsg({
        name: integration.name,
        hookResult: integration.hooks["astro:config:setup"](hooks),
        logging
      });
    }
  }
  updatedSettings.config = updatedConfig;
  return updatedSettings;
}
async function runHookConfigDone({
  settings,
  logging
}) {
  var _a;
  for (const integration of settings.config.integrations) {
    if ((_a = integration == null ? void 0 : integration.hooks) == null ? void 0 : _a["astro:config:done"]) {
      await withTakingALongTimeMsg({
        name: integration.name,
        hookResult: integration.hooks["astro:config:done"]({
          config: settings.config,
          setAdapter(adapter) {
            if (settings.adapter && settings.adapter.name !== adapter.name) {
              throw new Error(
                `Integration "${integration.name}" conflicts with "${settings.adapter.name}". You can only configure one deployment integration.`
              );
            }
            settings.adapter = adapter;
          }
        }),
        logging
      });
    }
  }
}
async function runHookServerSetup({
  config,
  server,
  logging
}) {
  var _a;
  for (const integration of config.integrations) {
    if ((_a = integration == null ? void 0 : integration.hooks) == null ? void 0 : _a["astro:server:setup"]) {
      await withTakingALongTimeMsg({
        name: integration.name,
        hookResult: integration.hooks["astro:server:setup"]({ server }),
        logging
      });
    }
  }
}
async function runHookServerStart({
  config,
  address,
  logging
}) {
  var _a;
  for (const integration of config.integrations) {
    if ((_a = integration == null ? void 0 : integration.hooks) == null ? void 0 : _a["astro:server:start"]) {
      await withTakingALongTimeMsg({
        name: integration.name,
        hookResult: integration.hooks["astro:server:start"]({ address }),
        logging
      });
    }
  }
}
async function runHookServerDone({
  config,
  logging
}) {
  var _a;
  for (const integration of config.integrations) {
    if ((_a = integration == null ? void 0 : integration.hooks) == null ? void 0 : _a["astro:server:done"]) {
      await withTakingALongTimeMsg({
        name: integration.name,
        hookResult: integration.hooks["astro:server:done"](),
        logging
      });
    }
  }
}
async function runHookBuildStart({
  config,
  buildConfig,
  logging
}) {
  var _a;
  function warnDeprecated(integration, prop) {
    let value = Reflect.get(buildConfig, prop);
    Object.defineProperty(buildConfig, prop, {
      enumerable: true,
      get() {
        return value;
      },
      set(newValue) {
        value = newValue;
        warn(
          logging,
          "astro:build:start",
          `Your adapter ${bold(integration.name)} is using a deprecated API, buildConfig. ${bold(
            prop
          )} config should be set via config.build.${prop} instead.`
        );
      }
    });
    return () => {
      Object.defineProperty(buildConfig, prop, {
        enumerable: true,
        value
      });
    };
  }
  for (const integration of config.integrations) {
    if ((_a = integration == null ? void 0 : integration.hooks) == null ? void 0 : _a["astro:build:start"]) {
      const undoClientWarning = warnDeprecated(integration, "client");
      const undoServerWarning = warnDeprecated(integration, "server");
      const undoServerEntryWarning = warnDeprecated(integration, "serverEntry");
      await withTakingALongTimeMsg({
        name: integration.name,
        hookResult: integration.hooks["astro:build:start"]({ buildConfig }),
        logging
      });
      undoClientWarning();
      undoServerEntryWarning();
      undoServerWarning();
    }
  }
}
async function runHookBuildSetup({
  config,
  vite,
  pages,
  target,
  logging
}) {
  var _a;
  for (const integration of config.integrations) {
    if ((_a = integration == null ? void 0 : integration.hooks) == null ? void 0 : _a["astro:build:setup"]) {
      await withTakingALongTimeMsg({
        name: integration.name,
        hookResult: integration.hooks["astro:build:setup"]({
          vite,
          pages,
          target,
          updateConfig: (newConfig) => {
            mergeConfig(vite, newConfig);
          }
        }),
        logging
      });
    }
  }
}
async function runHookBuildSsr({
  config,
  manifest,
  logging
}) {
  var _a;
  for (const integration of config.integrations) {
    if ((_a = integration == null ? void 0 : integration.hooks) == null ? void 0 : _a["astro:build:ssr"]) {
      await withTakingALongTimeMsg({
        name: integration.name,
        hookResult: integration.hooks["astro:build:ssr"]({ manifest }),
        logging
      });
    }
  }
}
async function runHookBuildGenerated({
  config,
  buildConfig,
  logging
}) {
  var _a;
  const dir = config.output === "server" ? buildConfig.client : config.outDir;
  for (const integration of config.integrations) {
    if ((_a = integration == null ? void 0 : integration.hooks) == null ? void 0 : _a["astro:build:generated"]) {
      await withTakingALongTimeMsg({
        name: integration.name,
        hookResult: integration.hooks["astro:build:generated"]({ dir }),
        logging
      });
    }
  }
}
async function runHookBuildDone({
  config,
  buildConfig,
  pages,
  routes,
  logging
}) {
  var _a;
  const dir = config.output === "server" ? buildConfig.client : config.outDir;
  await fs.promises.mkdir(dir, { recursive: true });
  for (const integration of config.integrations) {
    if ((_a = integration == null ? void 0 : integration.hooks) == null ? void 0 : _a["astro:build:done"]) {
      await withTakingALongTimeMsg({
        name: integration.name,
        hookResult: integration.hooks["astro:build:done"]({
          pages: pages.map((p) => ({ pathname: p })),
          dir,
          routes
        }),
        logging
      });
    }
  }
}
export {
  runHookBuildDone,
  runHookBuildGenerated,
  runHookBuildSetup,
  runHookBuildSsr,
  runHookBuildStart,
  runHookConfigDone,
  runHookConfigSetup,
  runHookServerDone,
  runHookServerSetup,
  runHookServerStart
};
