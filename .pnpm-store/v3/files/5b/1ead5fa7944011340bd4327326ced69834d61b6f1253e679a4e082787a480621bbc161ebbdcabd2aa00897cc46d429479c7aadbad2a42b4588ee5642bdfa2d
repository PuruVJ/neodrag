function defineConfig(config) {
  return config;
}
function getViteConfig(inlineConfig) {
  return async ({ mode, command }) => {
    const cmd = command === "serve" ? "dev" : command;
    const [
      { mergeConfig },
      { nodeLogDestination },
      { openConfig, createSettings },
      { createVite },
      { runHookConfigSetup, runHookConfigDone }
    ] = await Promise.all([
      import("vite"),
      import("../core/logger/node.js"),
      import("../core/config/index.js"),
      import("../core/create-vite.js"),
      import("../integrations/index.js")
    ]);
    const logging = {
      dest: nodeLogDestination,
      level: "info"
    };
    const { astroConfig: config } = await openConfig({
      cmd,
      logging
    });
    const settings = createSettings(config, inlineConfig.root);
    await runHookConfigSetup({ settings, command: cmd, logging });
    const viteConfig = await createVite(
      {
        mode
      },
      { settings, logging, mode }
    );
    await runHookConfigDone({ settings, logging });
    return mergeConfig(viteConfig, inlineConfig);
  };
}
export {
  defineConfig,
  getViteConfig
};
