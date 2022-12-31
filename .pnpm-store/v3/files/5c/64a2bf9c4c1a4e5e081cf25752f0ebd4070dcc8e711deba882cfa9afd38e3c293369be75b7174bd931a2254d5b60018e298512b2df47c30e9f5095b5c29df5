import { runHookServerSetup } from "../integrations/index.js";
function astroIntegrationsContainerPlugin({
  settings,
  logging
}) {
  return {
    name: "astro:integration-container",
    configureServer(server) {
      runHookServerSetup({ config: settings.config, server, logging });
    }
  };
}
export {
  astroIntegrationsContainerPlugin as default
};
