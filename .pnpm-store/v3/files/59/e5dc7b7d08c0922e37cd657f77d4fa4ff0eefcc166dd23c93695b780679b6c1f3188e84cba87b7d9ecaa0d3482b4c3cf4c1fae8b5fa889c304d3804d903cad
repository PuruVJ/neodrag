import { performance } from "perf_hooks";
import { info, warn } from "../logger/core.js";
import * as msg from "../messages.js";
import { startContainer } from "./container.js";
import { createContainerWithAutomaticRestart } from "./restart.js";
async function dev(settings, options) {
  var _a, _b;
  const devStart = performance.now();
  await options.telemetry.record([]);
  const restart = await createContainerWithAutomaticRestart({
    flags: {},
    handleConfigError: options.handleConfigError,
    beforeRestart: () => console.clear(),
    params: {
      settings,
      logging: options.logging,
      isRestart: options.isRestart
    }
  });
  const devServerAddressInfo = await startContainer(restart.container);
  const site = settings.config.site ? new URL(settings.config.base, settings.config.site) : void 0;
  info(
    options.logging,
    null,
    msg.serverStart({
      startupTime: performance.now() - devStart,
      resolvedUrls: restart.container.viteServer.resolvedUrls || { local: [], network: [] },
      host: settings.config.server.host,
      site,
      isRestart: options.isRestart
    })
  );
  const currentVersion = "1.8.0";
  if (currentVersion.includes("-")) {
    warn(options.logging, null, msg.prerelease({ currentVersion }));
  }
  if (((_b = (_a = restart.container.viteConfig.server) == null ? void 0 : _a.fs) == null ? void 0 : _b.strict) === false) {
    warn(options.logging, null, msg.fsStrictWarning());
  }
  return {
    address: devServerAddressInfo,
    get watcher() {
      return restart.container.viteServer.watcher;
    },
    handle(req, res) {
      return restart.container.handle(req, res);
    },
    async stop() {
      await restart.container.close();
    }
  };
}
export {
  dev as default
};
