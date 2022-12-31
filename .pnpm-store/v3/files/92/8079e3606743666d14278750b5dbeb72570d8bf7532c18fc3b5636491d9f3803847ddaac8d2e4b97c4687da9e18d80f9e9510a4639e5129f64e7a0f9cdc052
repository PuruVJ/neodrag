import fs from "fs";
import * as colors from "kleur/colors";
import { performance } from "perf_hooks";
import {
  runHookBuildDone,
  runHookBuildStart,
  runHookConfigDone,
  runHookConfigSetup
} from "../../integrations/index.js";
import { createVite } from "../create-vite.js";
import { debug, info, levels, timerMessage } from "../logger/core.js";
import { apply as applyPolyfill } from "../polyfill.js";
import { RouteCache } from "../render/route-cache.js";
import { createRouteManifest } from "../routing/index.js";
import { collectPagesData } from "./page-data.js";
import { staticBuild } from "./static-build.js";
import { getTimeStat } from "./util.js";
async function build(settings, options) {
  applyPolyfill();
  const builder = new AstroBuilder(settings, options);
  await builder.run();
}
class AstroBuilder {
  constructor(settings, options) {
    this.mode = "production";
    if (options.mode) {
      this.mode = options.mode;
    }
    this.settings = settings;
    this.logging = options.logging;
    this.routeCache = new RouteCache(this.logging);
    this.origin = settings.config.site ? new URL(settings.config.site).origin : `http://localhost:${settings.config.server.port}`;
    this.manifest = { routes: [] };
    this.timer = {};
  }
  async setup() {
    debug("build", "Initial setup...");
    const { logging } = this;
    this.timer.init = performance.now();
    this.settings = await runHookConfigSetup({
      settings: this.settings,
      command: "build",
      logging
    });
    this.manifest = createRouteManifest({ settings: this.settings }, this.logging);
    const viteConfig = await createVite(
      {
        mode: this.mode,
        server: {
          hmr: false,
          middlewareMode: true
        }
      },
      { settings: this.settings, logging, mode: "build" }
    );
    await runHookConfigDone({ settings: this.settings, logging });
    return { viteConfig };
  }
  async build({ viteConfig }) {
    const buildConfig = {
      client: this.settings.config.build.client,
      server: this.settings.config.build.server,
      serverEntry: this.settings.config.build.serverEntry
    };
    await runHookBuildStart({ config: this.settings.config, buildConfig, logging: this.logging });
    this.validateConfig();
    info(this.logging, "build", `output target: ${colors.green(this.settings.config.output)}`);
    if (this.settings.adapter) {
      info(this.logging, "build", `deploy adapter: ${colors.green(this.settings.adapter.name)}`);
    }
    info(this.logging, "build", "Collecting build info...");
    this.timer.loadStart = performance.now();
    const { assets, allPages } = await collectPagesData({
      settings: this.settings,
      logging: this.logging,
      manifest: this.manifest
    });
    debug("build", timerMessage("All pages loaded", this.timer.loadStart));
    const pageNames = [];
    this.timer.buildStart = performance.now();
    info(
      this.logging,
      "build",
      colors.dim(`Completed in ${getTimeStat(this.timer.init, performance.now())}.`)
    );
    await staticBuild({
      allPages,
      settings: this.settings,
      logging: this.logging,
      manifest: this.manifest,
      mode: this.mode,
      origin: this.origin,
      pageNames,
      routeCache: this.routeCache,
      viteConfig,
      buildConfig
    });
    this.timer.assetsStart = performance.now();
    Object.keys(assets).map((k) => {
      if (!assets[k])
        return;
      const filePath = new URL(`file://${k}`);
      fs.mkdirSync(new URL("./", filePath), { recursive: true });
      fs.writeFileSync(filePath, assets[k], "utf8");
      delete assets[k];
    });
    debug("build", timerMessage("Additional assets copied", this.timer.assetsStart));
    await runHookBuildDone({
      config: this.settings.config,
      buildConfig,
      pages: pageNames,
      routes: Object.values(allPages).map((pd) => pd.route),
      logging: this.logging
    });
    if (this.logging.level && levels[this.logging.level] <= levels["info"]) {
      await this.printStats({
        logging: this.logging,
        timeStart: this.timer.init,
        pageCount: pageNames.length,
        buildMode: this.settings.config.output
      });
    }
  }
  async run() {
    const setupData = await this.setup();
    try {
      await this.build(setupData);
    } catch (_err) {
      throw _err;
    }
  }
  validateConfig() {
    const { config } = this.settings;
    if (config.outDir.toString() === config.root.toString()) {
      throw new Error(
        `the outDir cannot be the root folder. Please build to a folder such as dist.`
      );
    }
  }
  async printStats({
    logging,
    timeStart,
    pageCount,
    buildMode
  }) {
    const total = getTimeStat(timeStart, performance.now());
    let messages = [];
    if (buildMode === "static") {
      messages = [`${pageCount} page(s) built in`, colors.bold(total)];
    } else {
      messages = ["Server built in", colors.bold(total)];
    }
    info(logging, "build", messages.join(" "));
    info(logging, "build", `${colors.bold("Complete!")}`);
  }
}
export {
  build as default
};
