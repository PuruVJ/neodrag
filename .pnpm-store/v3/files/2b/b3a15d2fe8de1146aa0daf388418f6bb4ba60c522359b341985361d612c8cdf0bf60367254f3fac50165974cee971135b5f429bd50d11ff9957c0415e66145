import * as vite from "vite";
import { createSettings, openConfig } from "../config/index.js";
import { createSafeError } from "../errors/index.js";
import { info } from "../logger/core.js";
import { createContainer, isStarted, startContainer } from "./container.js";
async function createRestartedContainer(container, settings, needsStart) {
  const { logging, fs, resolvedRoot, configFlag, configFlagPath } = container;
  const newContainer = await createContainer({
    isRestart: true,
    logging,
    settings,
    fs,
    root: resolvedRoot,
    configFlag,
    configFlagPath
  });
  if (needsStart) {
    await startContainer(newContainer);
  }
  return newContainer;
}
function shouldRestartContainer({ settings, configFlag, configFlagPath, restartInFlight }, changedFile) {
  if (restartInFlight)
    return false;
  let shouldRestart = false;
  if (configFlag) {
    if (!!configFlagPath) {
      shouldRestart = vite.normalizePath(configFlagPath) === vite.normalizePath(changedFile);
    }
  } else {
    const exp = new RegExp(`.*astro.config.((mjs)|(cjs)|(js)|(ts))$`);
    const normalizedChangedFile = vite.normalizePath(changedFile);
    shouldRestart = exp.test(normalizedChangedFile);
  }
  if (!shouldRestart && settings.watchFiles.length > 0) {
    shouldRestart = settings.watchFiles.some(
      (path) => vite.normalizePath(path) === vite.normalizePath(changedFile)
    );
  }
  return shouldRestart;
}
async function restartContainer({
  container,
  flags,
  logMsg,
  handleConfigError,
  beforeRestart
}) {
  const { logging, close, resolvedRoot, settings: existingSettings } = container;
  container.restartInFlight = true;
  if (beforeRestart) {
    beforeRestart();
  }
  const needsStart = isStarted(container);
  try {
    const newConfig = await openConfig({
      cwd: resolvedRoot,
      flags,
      cmd: "dev",
      logging,
      isRestart: true,
      fsMod: container.fs
    });
    info(logging, "astro", logMsg + "\n");
    let astroConfig = newConfig.astroConfig;
    const settings = createSettings(astroConfig, resolvedRoot);
    await close();
    return {
      container: await createRestartedContainer(container, settings, needsStart),
      error: null
    };
  } catch (_err) {
    const error = createSafeError(_err);
    await handleConfigError(error);
    await close();
    info(logging, "astro", "Continuing with previous valid configuration\n");
    return {
      container: await createRestartedContainer(container, existingSettings, needsStart),
      error
    };
  }
}
async function createContainerWithAutomaticRestart({
  flags,
  handleConfigError = (_e) => {
  },
  beforeRestart,
  params
}) {
  const initialContainer = await createContainer(params);
  let resolveRestart;
  let restartComplete = new Promise((resolve) => {
    resolveRestart = resolve;
  });
  let restart = {
    container: initialContainer,
    restarted() {
      return restartComplete;
    }
  };
  function handleServerRestart(logMsg) {
    const container = restart.container;
    return async function(changedFile) {
      if (shouldRestartContainer(container, changedFile)) {
        const { container: newContainer, error } = await restartContainer({
          beforeRestart,
          container,
          flags,
          logMsg,
          async handleConfigError(err) {
            await handleConfigError(err);
            container.viteServer.ws.send({
              type: "error",
              err: {
                message: err.message,
                stack: err.stack || ""
              }
            });
          }
        });
        restart.container = newContainer;
        addWatches();
        resolveRestart(error);
        restartComplete = new Promise((resolve) => {
          resolveRestart = resolve;
        });
      }
    };
  }
  function addWatches() {
    const watcher = restart.container.viteServer.watcher;
    watcher.on("change", handleServerRestart("Configuration updated. Restarting..."));
    watcher.on("unlink", handleServerRestart("Configuration removed. Restarting..."));
    watcher.on("add", handleServerRestart("Configuration added. Restarting..."));
  }
  addWatches();
  return restart;
}
export {
  createContainerWithAutomaticRestart,
  restartContainer,
  shouldRestartContainer
};
